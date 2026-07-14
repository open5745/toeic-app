// 考試模式：半份多益模擬考（題數與時間皆為正式考試的一半）
// 正式多益：200 題 / 120 分鐘 → 本模式：100 題 / 60 分鐘
// 聽力 50 題（音檔只播一次、原速、無逐字稿）→ 閱讀 50 題（限時 37:30，時間到自動交卷）→ 成績與錯題檢討
import { speakSequence, stopSpeaking, speechAvailable, speakerVoiceOpts } from './speech.js';
import { recordActivity } from './streak.js';
import { navigate } from './app.js';
import { SCENES } from './scenes.js';

const LETTERS = ['A', 'B', 'C', 'D'];

// 各 Part 題數 = 正式多益的一半（四捨五入）
// 聽力：P1 6→3、P2 25→13、P3 39→19、P4 30→15（共 50）
// 閱讀：P5 30→15、P6 16→8、P7 54→27（共 50）
const LISTENING_SPEC = { 1: 3, 2: 13, 3: 19, 4: 15 };
const READING_SPEC = { 5: 15, 6: 8 };
const P7_COUNT = 27;
const READING_SECONDS = Math.round((75 * 60) / 2); // 正式閱讀 75 分鐘的一半 = 37 分 30 秒

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(sec) {
  const m = String(Math.floor(Math.max(0, sec) / 60)).padStart(2, '0');
  const s = String(Math.max(0, sec) % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// 依 spec 從題庫各 Part 抽題（題庫不足時抽到多少算多少），並照 Part 順序排列
function pickByPart(items, spec) {
  const picked = [];
  for (const part of Object.keys(spec)) {
    const pool = items.filter((q) => q.part === Number(part));
    picked.push(...shuffle(pool).slice(0, spec[part]));
  }
  return picked.sort((a, b) => a.part - b.part);
}

// Part 7 以「題組」為單位抽選：單篇 → 雙篇 → 三篇（同正式考試順序），攤平後裁到目標題數
function pickPart7(sets, count) {
  const order = { single: 0, double: 1, triple: 2 };
  const chosen = [];
  let total = 0;
  for (const s of shuffle(sets)) {
    if (total >= count) break;
    chosen.push(s);
    total += s.questions.length;
  }
  chosen.sort((a, b) => order[a.passageType] - order[b.passageType]);
  const flat = [];
  for (const s of chosen) {
    s.questions.forEach((q, qi) => flat.push({ ...q, part: 7, set: s, qIndex: qi }));
  }
  return flat.slice(0, count);
}

let timerId = null;
function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

export function renderExam(container, data) {
  stopSpeaking();
  clearTimer();
  const p7Sets = data.grammar.reading7 || [];
  const nL = Object.entries(LISTENING_SPEC).reduce(
    (sum, [part, n]) => sum + Math.min(n, data.listening.items.filter((q) => q.part === Number(part)).length), 0);
  const nP56 = Object.entries(READING_SPEC).reduce(
    (sum, [part, n]) => sum + Math.min(n, data.grammar.questions.filter((q) => q.part === Number(part)).length), 0);
  const nP7 = Math.min(P7_COUNT, p7Sets.reduce((s, x) => s + x.questions.length, 0));
  const nR = nP56 + nP7;

  container.innerHTML = `
    <h2>🎯 考試模式</h2>
    <p class="hint">半份多益模擬考：題數與時間都是正式考試的一半，完整走過 Part 1～7。</p>
    ${speechAvailable() ? '' : '<p class="warn">⚠️ 此瀏覽器不支援語音合成，聽力部分無法播放。</p>'}
    <div class="card">
      <h3>考試規則（正式多益的一半）</h3>
      <ul class="rule-list">
        <li>🎧 聽力 ${nL} 題：Part 1 照片描述 ${LISTENING_SPEC[1]} 題・Part 2 應答問題 ${LISTENING_SPEC[2]} 題・Part 3 簡短對話 ${LISTENING_SPEC[3]} 題・Part 4 簡短獨白 ${LISTENING_SPEC[4]} 題</li>
        <li>🔇 音檔<b>只播放一次</b>、固定原速、不提供逐字稿；Part 1、2 依正式規則<b>不顯示選項文字</b></li>
        <li>📖 閱讀 ${nR} 題：Part 5 單句填空 ${READING_SPEC[5]} 題・Part 6 段落填空 ${READING_SPEC[6]} 題・Part 7 閱讀測驗 ${nP7} 題</li>
        <li>⏱ 閱讀限時 <b>${fmt(READING_SECONDS)}</b>（正式 75 分鐘的一半），時間到自動交卷，可自行分配各題時間</li>
        <li>🤐 作答過程不顯示對錯，交卷後統一檢討</li>
      </ul>
      <button class="btn btn-primary btn-block" id="start-exam">開始模擬考（${nL + nR} 題）</button>
    </div>`;

  container.querySelector('#start-exam').addEventListener('click', () => startExam(container, data));
}

function startExam(container, data) {
  const listeningQs = pickByPart(data.listening.items, LISTENING_SPEC);
  const readingQs = [
    ...pickByPart(data.grammar.questions, READING_SPEC),
    ...pickPart7(data.grammar.reading7 || [], P7_COUNT),
  ];
  const answers = { listening: [], reading: [] };
  let remaining = READING_SECONDS;

  function quitBar(label) {
    return `<button class="link-btn" id="quit-btn">← 放棄考試</button><span class="progress-text">${label}</span>`;
  }

  function bindQuit() {
    container.querySelector('#quit-btn').addEventListener('click', () => {
      if (confirm('確定要放棄這次模擬考嗎？作答紀錄不會保存。')) {
        renderExam(container, data);
      }
    });
  }

  // ---- 第一部分：聽力 ----
  function showListening(i) {
    if (i >= listeningQs.length) return startReading();
    const q = listeningQs[i];

    // Part 1 照片描述：顯示照片，四句描述只播音不顯示文字（同真實考試）
    // Part 2 應答問題：無圖片、無文字題幹，只顯示 A/B/C 按鈕，問題與三個回應皆只播音（同真實考試）
    const isP1 = q.part === 1;
    const isP2 = q.part === 2;
    const masked = isP1 || isP2;
    const sceneHtml = isP1 && SCENES[q.scene] ? `<div class="scene-box">${SCENES[q.scene]}</div>` : '';
    const qText = isP2 ? '請聽問題與三個回應，選出最合適的應答。' : q.question;

    container.innerHTML = `
      <div class="session-top">${quitBar(`聽力 ${i + 1} / ${listeningQs.length}・Part ${q.part}`)}</div>
      <div class="card">
        <p class="hint">🎧 音檔只播放一次，請仔細聆聽（${q.accentLabel}口音）</p>
        ${sceneHtml}
        <p class="q-text">${qText}</p>
        <div class="option-list${masked ? ' p1-hidden' : ''}">
          ${q.options
            .map((opt, oi) => `<button class="btn option-btn" data-i="${oi}"><span class="opt-letter">${LETTERS[oi]}</span><span class="${masked ? 'masked-opt' : ''}">${opt}</span></button>`)
            .join('')}
        </div>
      </div>`;

    bindQuit();
    // Part 2 需補播三個回應選項（題庫音檔只含問題句）
    const toSpeak = q.sentences.map((s) => ({ text: s.text, ...speakerVoiceOpts(s.speaker) }));
    if (isP2) {
      q.options.forEach((opt, oi) => toSpeak.push({ text: `${LETTERS[oi]}. ${opt}`, ...speakerVoiceOpts('N') }));
    }
    speakSequence(toSpeak, { lang: q.accent, rate: 1.0 });

    container.querySelectorAll('.option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        stopSpeaking();
        answers.listening[i] = Number(btn.dataset.i);
        showListening(i + 1);
      });
    });
  }

  // ---- 第二部分：閱讀（限時）----
  function startReading() {
    stopSpeaking();
    clearTimer();
    timerId = setInterval(() => {
      remaining -= 1;
      const el = document.getElementById('exam-timer');
      if (!el) return clearTimer(); // 使用者已離開考試頁面
      el.textContent = '⏱ ' + fmt(remaining);
      if (remaining <= 60) el.classList.add('timer-low');
      if (remaining <= 0) {
        clearTimer();
        showResult(true);
      }
    }, 1000);
    showReading(0);
  }

  function showReading(i) {
    if (i >= readingQs.length) return showResult(false);
    const q = readingQs[i];
    const isP7 = q.part === 7;

    // Part 7：文章在上、題目在下（上下分割），文章區可獨立捲動方便對照
    const passageHtml = isP7
      ? `<div class="passage-box">
          ${q.set.passages
            .map((p) => `<p class="passage-label">${p.label}</p><div class="passage-text">${p.text.replace(/\n/g, '<br>')}</div>`)
            .join('')}
        </div>`
      : '';
    const typeLabel = isP7 ? q.set.typeLabel : q.type;
    const qNoInSet = isP7 && q.set.questions.length > 1 ? `（本文第 ${q.qIndex + 1} / ${q.set.questions.length} 題）` : '';

    container.innerHTML = `
      <div class="session-top">
        ${quitBar(`閱讀 ${i + 1} / ${readingQs.length}`)}
      </div>
      <div class="card">
        <div class="q-tags">
          <span class="tag">Part ${q.part}</span>
          <span class="tag tag-type">${typeLabel}</span>
          <span class="tag tag-timer" id="exam-timer">⏱ ${fmt(remaining)}</span>
        </div>
        ${passageHtml}
        <p class="q-text">${q.question.replace(/\n/g, '<br>')}${qNoInSet}</p>
        <div class="option-list">
          ${q.options
            .map((opt, oi) => `<button class="btn option-btn" data-i="${oi}"><span class="opt-letter">${LETTERS[oi]}</span>${opt}</button>`)
            .join('')}
        </div>
      </div>`;

    bindQuit();
    if (remaining <= 60) document.getElementById('exam-timer').classList.add('timer-low');
    window.scrollTo(0, 0);

    container.querySelectorAll('.option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        answers.reading[i] = Number(btn.dataset.i);
        showReading(i + 1);
      });
    });
  }

  // ---- 成績 ----
  function showResult(timedOut) {
    clearTimer();
    stopSpeaking();
    const lCorrect = listeningQs.filter((q, i) => answers.listening[i] === q.answer).length;
    const rCorrect = readingQs.filter((q, i) => answers.reading[i] === q.answer).length;
    const total = listeningQs.length + readingQs.length;
    const pct = Math.round(((lCorrect + rCorrect) / total) * 100);
    recordActivity('exam', total);

    const msg = pct >= 80 ? '狀態很好，維持手感到考試當天！' : pct >= 60 ? '基礎不錯，把錯題檢討弄懂再刷一次！' : '先別急，從錯題檢討找出弱點題型吧！';

    container.innerHTML = `
      <div class="card center-card">
        <div class="big-emoji">${pct >= 80 ? '🏆' : pct >= 60 ? '📈' : '💪'}</div>
        ${timedOut ? '<p class="warn">⏰ 時間到，已自動交卷</p>' : ''}
        <h2>${lCorrect + rCorrect} / ${total}</h2>
        <p class="hint">🎧 聽力 ${lCorrect}/${listeningQs.length}　📖 閱讀 ${rCorrect}/${readingQs.length}</p>
        <p>${msg}</p>
        <button class="btn btn-primary" id="review-btn">📋 錯題檢討</button>
        <button class="btn" id="retry-btn">再考一次</button>
        <button class="btn" id="home-btn">回首頁</button>
      </div>`;

    container.querySelector('#review-btn').addEventListener('click', showReview);
    container.querySelector('#retry-btn').addEventListener('click', () => startExam(container, data));
    container.querySelector('#home-btn').addEventListener('click', () => navigate('home'));

    function showReview() {
      const listeningHtml = listeningQs
        .map((q, i) => reviewCard(q, answers.listening[i], `聽力 Part ${q.part}`, `
          ${q.part === 1 && SCENES[q.scene] ? `<div class="scene-box">${SCENES[q.scene]}</div>` : ''}
          <p class="fb-explanation"><b>逐字稿：</b>${q.sentences.map((s) => s.text).join(' ')}</p>
          <p class="fb-explanation"><b>中文：</b>${q.transcriptZh}</p>`))
        .join('');
      // Part 7 只在答錯時附上原文，避免檢討頁過長
      const readingHtml = readingQs
        .map((q, i) => reviewCard(q, answers.reading[i], `閱讀 Part ${q.part}・${q.part === 7 ? q.set.typeLabel : q.type}`, `
          ${q.part === 7 && answers.reading[i] !== q.answer ? `<div class="passage-box">${q.set.passages.map((p) => `<p class="passage-label">${p.label}</p><div class="passage-text">${p.text.replace(/\n/g, '<br>')}</div>`).join('')}</div>` : ''}
          <p class="fb-explanation">${q.explanation}</p>`))
        .join('');

      container.innerHTML = `
        <div class="session-top">
          <button class="link-btn" id="back-result">← 回成績</button>
          <span class="progress-text">錯題檢討</span>
        </div>
        ${listeningHtml}${readingHtml}
        <button class="btn btn-primary btn-block" id="retry-btn2">再考一次</button>`;

      container.querySelector('#back-result').addEventListener('click', () => showResult(timedOut));
      container.querySelector('#retry-btn2').addEventListener('click', () => startExam(container, data));
      window.scrollTo(0, 0);
    }

    function reviewCard(q, picked, tagLabel, extraHtml) {
      const ok = picked === q.answer;
      const pickedText = picked === undefined ? '未作答' : `(${LETTERS[picked]}) ${q.options[picked]}`;
      return `
        <div class="card ${ok ? '' : 'review-wrong'}">
          <div class="q-tags">
            <span class="tag">${tagLabel}</span>
            <span class="tag ${ok ? 'tag-ok' : 'tag-ng'}">${ok ? '✅ 答對' : '❌ 答錯'}</span>
          </div>
          <p class="q-text">${q.question.replace(/\n/g, '<br>')}</p>
          ${ok ? '' : `<p class="fb-explanation"><b>你的答案：</b>${pickedText}</p>`}
          <p class="fb-explanation"><b>正解：</b>(${LETTERS[q.answer]}) ${q.options[q.answer]}</p>
          ${extraHtml}
          <p class="fb-tip">💡 ${q.tip}</p>
        </div>`;
    }
  }

  showListening(0);
}
