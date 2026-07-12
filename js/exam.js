// 考試模式：依多益實際流程的迷你模擬考
// 聽力（只播一次、原速、無逐字稿）→ 閱讀（限時、時間到自動交卷）→ 成績與錯題檢討
import { speakSequence, stopSpeaking, speechAvailable, speakerVoiceOpts } from './speech.js';
import { recordActivity } from './streak.js';
import { navigate } from './app.js';
import { SCENES } from './scenes.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const READING_SECONDS = 8 * 60;

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
  const nL = Math.min(6, data.listening.items.length);
  const nR = Math.min(12, data.grammar.questions.length);

  container.innerHTML = `
    <h2>🎯 考試模式</h2>
    <p class="hint">模擬多益實際考試節奏，適合考前衝刺熟悉臨場感。</p>
    ${speechAvailable() ? '' : '<p class="warn">⚠️ 此瀏覽器不支援語音合成，聽力部分無法播放。</p>'}
    <div class="card">
      <h3>考試規則</h3>
      <ul class="rule-list">
        <li>🎧 聽力 ${nL} 題：音檔<b>只播放一次</b>、固定原速、不提供逐字稿</li>
        <li>📖 閱讀 ${nR} 題：限時 <b>${READING_SECONDS / 60} 分鐘</b>，時間到自動交卷</li>
        <li>🤐 作答過程不顯示對錯，交卷後統一檢討</li>
      </ul>
      <button class="btn btn-primary btn-block" id="start-exam">開始模擬考</button>
    </div>`;

  container.querySelector('#start-exam').addEventListener('click', () => startExam(container, data));
}

function startExam(container, data) {
  // 隨機抽題後依 Part 順序排列，貼近真實考試（聽力 Part 2→4、閱讀 Part 5→6）
  const listeningQs = shuffle(data.listening.items).slice(0, 6).sort((a, b) => a.part - b.part);
  const readingQs = shuffle(data.grammar.questions).slice(0, 12).sort((a, b) => a.part - b.part);
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
    const isP1 = q.part === 1;
    const sceneHtml = isP1 && SCENES[q.scene] ? `<div class="scene-box">${SCENES[q.scene]}</div>` : '';

    container.innerHTML = `
      <div class="session-top">${quitBar(`聽力 ${i + 1} / ${listeningQs.length}・Part ${q.part}`)}</div>
      <div class="card">
        <p class="hint">🎧 音檔只播放一次，請仔細聆聽（${q.accentLabel}口音）</p>
        ${sceneHtml}
        <p class="q-text">${q.question}</p>
        <div class="option-list${isP1 ? ' p1-hidden' : ''}">
          ${q.options
            .map((opt, oi) => `<button class="btn option-btn" data-i="${oi}"><span class="opt-letter">${LETTERS[oi]}</span><span class="${isP1 ? 'masked-opt' : ''}">${opt}</span></button>`)
            .join('')}
        </div>
      </div>`;

    bindQuit();
    speakSequence(q.sentences.map((s) => ({ text: s.text, ...speakerVoiceOpts(s.speaker) })), { lang: q.accent, rate: 1.0 });

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

    container.innerHTML = `
      <div class="session-top">
        ${quitBar(`閱讀 ${i + 1} / ${readingQs.length}`)}
      </div>
      <div class="card">
        <div class="q-tags">
          <span class="tag">Part ${q.part}</span>
          <span class="tag tag-type">${q.type}</span>
          <span class="tag tag-timer" id="exam-timer">⏱ ${fmt(remaining)}</span>
        </div>
        <p class="q-text">${q.question.replace(/\n/g, '<br>')}</p>
        <div class="option-list">
          ${q.options
            .map((opt, oi) => `<button class="btn option-btn" data-i="${oi}"><span class="opt-letter">${LETTERS[oi]}</span>${opt}</button>`)
            .join('')}
        </div>
      </div>`;

    bindQuit();
    if (remaining <= 60) document.getElementById('exam-timer').classList.add('timer-low');

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
      const readingHtml = readingQs
        .map((q, i) => reviewCard(q, answers.reading[i], `閱讀 Part ${q.part}・${q.type}`, `
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
