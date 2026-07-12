// 語音合成（Web Speech API）：口音選擇與語速控制
// MVP 先用瀏覽器內建 TTS，日後可替換成真人錄音檔而不影響其他模組

let voicesCache = [];

function refreshVoices() {
  voicesCache = window.speechSynthesis ? speechSynthesis.getVoices() : [];
}

if (window.speechSynthesis) {
  refreshVoices();
  speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

export function speechAvailable() {
  return 'speechSynthesis' in window;
}

// 常見語音名稱的性別對照（Edge Natural / Google / 系統內建語音）
const FEMALE_NAMES = ['aria', 'jenny', 'michelle', 'emma', 'ava', 'ana', 'sonia', 'libby', 'maisie', 'natasha', 'clara', 'zira', 'hazel', 'susan', 'catherine', 'linda', 'heather', 'samantha', 'karen', 'moira', 'tessa', 'fiona', 'serena', 'kate'];
const MALE_NAMES = ['guy', 'eric', 'christopher', 'roger', 'steffan', 'andrew', 'brian', 'davis', 'tony', 'ryan', 'thomas', 'william', 'liam', 'david', 'mark', 'james', 'richard', 'george', 'daniel', 'alex', 'fred', 'oliver', 'gordon'];

function voiceGender(v) {
  const n = v.name.toLowerCase();
  if (n.includes('female')) return 'f';
  if (/\bmale\b/.test(n)) return 'm';
  if (FEMALE_NAMES.some((x) => n.includes(x))) return 'f';
  if (MALE_NAMES.some((x) => n.includes(x))) return 'm';
  return null;
}

// 依 BCP-47 語言代碼（en-US / en-GB / en-AU / en-CA）與性別挑最合適的聲音
// 用評分制：Natural/Online 語音（Edge）與 Google 語音（Chrome）音質遠勝
// 系統內建的舊式語音（如 Microsoft David/Zira），一律優先
function scoreVoice(v, lang, gender) {
  const norm = v.lang.replace('_', '-');
  let score = 0;
  if (norm === lang) score += 8;
  else if (norm.startsWith('en')) score += 2;
  else return -Infinity; // 非英文語音不列入考慮
  if (/natural/i.test(v.name)) score += 6;
  if (/online/i.test(v.name)) score += 3;
  if (/google/i.test(v.name)) score += 4;
  if (!v.localService) score += 1;
  if (/david|zira|mark\b/i.test(v.name)) score -= 3; // 舊式機械音降權
  if (gender) {
    const g = voiceGender(v);
    if (g === gender) score += 12; // 性別相符優先於口音相符
    else if (g && g !== gender) score -= 10;
  }
  return score;
}

// variant：同性別的第二位說話者（M2/W2）改挑「分數次高的不同聲音」
export function pickVoice(lang, gender = null, variant = 0) {
  if (!voicesCache.length) refreshVoices();
  const scored = voicesCache
    .map((v) => ({ v, s: scoreVoice(v, lang, gender) }))
    .filter((x) => Number.isFinite(x.s))
    .sort((a, b) => b.s - a.s);
  if (!scored.length) return null;
  if (variant > 0) {
    const alts = scored.slice(1).filter((x) => !gender || voiceGender(x.v) === gender);
    if (alts.length) return alts[Math.min(variant - 1, alts.length - 1)].v;
  }
  return scored[0].v;
}

// 對話說話者代號 → 語音選項：M/M2 男聲、W/W2 女聲、Q/N 用預設最佳聲音
export function speakerVoiceOpts(speaker) {
  if (!speaker) return {};
  const s = String(speaker).toUpperCase();
  if (s.startsWith('M')) return { gender: 'm', variant: s === 'M2' ? 1 : 0 };
  if (s.startsWith('W') || s.startsWith('F')) return { gender: 'f', variant: s === 'W2' || s === 'F2' ? 1 : 0 };
  return {};
}

export function stopSpeaking() {
  sequenceId += 1; // 讓進行中的 speakSequence 提前結束
  if (window.speechSynthesis) speechSynthesis.cancel();
}

// 念一段文字；回傳 Promise 在播完時 resolve
export function speak(text, { lang = 'en-US', rate = 1.0, gender = null, variant = 0 } = {}) {
  return new Promise((resolve) => {
    if (!speechAvailable()) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(lang, gender, variant);
    if (voice) u.voice = voice;
    u.lang = lang;
    u.rate = rate;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

// 依序念多句（對話/獨白用）；stopSpeaking 或啟動新序列會讓舊序列提前結束
// items 可為字串陣列，或 { text, gender, variant } 物件陣列（男女聲分開）
let sequenceId = 0;

export async function speakSequence(items, { lang = 'en-US', rate = 1.0, gapMs = 450 } = {}) {
  stopSpeaking();
  const myId = ++sequenceId;
  for (const item of items) {
    const o = typeof item === 'string' ? { text: item } : item;
    if (myId !== sequenceId) return;
    await speak(o.text, { lang, rate, gender: o.gender || null, variant: o.variant || 0 });
    if (myId !== sequenceId) return;
    await new Promise((r) => setTimeout(r, gapMs));
  }
}
