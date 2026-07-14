// 文法模組：Part 5 & 6 模擬測驗 + 即時中文解析
// 出題優先挑「沒做過」的題目，整個題庫做完一輪前不會重複
import { recordActivity, todayCount } from './streak.js';
import { load, save } from './storage.js';
import { quota, addExtra, extraButtonLabel } from './plan.js';
import { navigate } from './app.js';

const SEEN_KEY = 'grammarSeen';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTERS = ['A', 'B', 'C', 'D'];

// 文法分類：把題庫的 type 標籤歸入八大類（未列到的新 type 仍會出現在綜合測驗）
const CATEGORIES = [
  { id: 'tense', icon: '⏰', name: '時態', types: ['時態'] },
  { id: 'verb', icon: '🏃', name: '動詞', types: ['動詞形式', '被動語態', '分詞', '片語動詞'] },
  { id: 'noun', icon: '📦', name: '名詞代名詞', types: ['代名詞', '數量詞'] },
  { id: 'adj', icon: '🎨', name: '形容詞副詞', types: ['詞性判斷', '比較級', '轉承副詞'] },
  { id: 'prep', icon: '🔗', name: '介係連接詞', types: ['介系詞', '連接詞'] },
  { id: 'pattern', icon: '🧩', name: '句型結構', types: ['假設語氣', '關係代名詞', '名詞子句', '倒裝句', '平行結構', '複合關係詞', '主詞一致'] },
  { id: 'vocab', icon: '💬', name: '字彙搭配', types: ['字彙選擇', '固定搭配'] },
  { id: 'part6', icon: '📄', name: '篇章填空', types: ['篇章填空'] },
];

function categoryPool(grammarData, cat) {
  return grammarData.questions.filter((q) => cat.types.includes(q.type));
}

export function renderGrammar(container, grammarData) {
  const done = todayCount('grammar');
  const dailyQuota = quota('grammar');

  // 今日份量已完成 → 顯示追加提示
  if (done >= dailyQuota) {
    container.innerHTML = `
      <h2>文法測驗</h2>
      <div class="card center-card">
        <div class="big-emoji">🎉</div>
        <h2>今日文法份量完成！</h2>
        <p>你今天已作答 <strong>${done}</strong> 題，先休息一下也很好。</p>
        <button class="btn btn-primary btn-block" id="add-extra">${extraButtonLabel()}</button>
        <button class="btn task-btn" data-go="vocab">📚 去複習單字 →</button>
        <button class="btn task-btn" data-go="listening">🎧 去練聽力 →</button>
        <button class="btn task-btn" data-go="exam">🎯 考試模式（不受份量限制）→</button>
      </div>`;
    container.querySelector('#add-extra').addEventListener('click', () => {
      addExtra();
      renderGrammar(container, grammarData);
    });
    container.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => navigate(b.dataset.go)));
    return;
  }

  const seen = new Set(load(SEEN_KEY, []));
  const unseenCount = grammarData.questions.filter((q) => !seen.has(q.id)).length;
  const quizLen = Math.min(10, dailyQuota - done);

  const tiles = CATEGORIES.map((cat) => {
    const unseen = categoryPool(grammarData, cat).filter((q) => !seen.has(q.id)).length;
    const badge = unseen > 0
      ? `<span class="tile-badge">${unseen}</span>`
      : '<span class="tile-badge done">✓</span>';
    return `
      <button class="pack-tile" data-cat="${cat.id}">
        <span class="tile-icon">${cat.icon}</span>
        <span class="tile-name">${cat.name}</span>
        ${badge}
      </button>`;
  }).join('');

  container.innerHTML = `
    <h2>文法測驗</h2>
    <p class="hint">模擬多益 Part 5 & 6 題型，答完立即看中文解析與破題技巧。今日進度 <strong>${done} / ${dailyQuota}</strong> 題・題庫還有 <strong>${unseenCount}</strong> 題沒做過。</p>
    <button class="btn btn-primary btn-block" id="start-quiz" style="margin-bottom:14px">🎲 綜合測驗（${quizLen} 題・混合所有分類）</button>
    <h3 class="section-title">分類練習（數字＝還沒做過的題數）</h3>
    <div class="pack-grid">${tiles}</div>
    ${unseenCount === 0 ? '<p class="hint" style="margin-top:12px">🎉 題庫已全部做完一輪，將重新出題複習。</p>' : ''}`;

  container.querySelector('#start-quiz').addEventListener('click', () => startQuiz(container, grammarData, quizLen));
  container.querySelectorAll('.pack-tile').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = CATEGORIES.find((c) => c.id === btn.dataset.cat);
      startQuiz(container, grammarData, quizLen, categoryPool(grammarData, cat), cat.name);
    });
  });
}

// 優先挑沒做過的題目，不足 10 題才用做過的補滿
function pickQuestions(all, n = 10) {
  const seen = new Set(load(SEEN_KEY, []));
  const unseen = all.filter((q) => !seen.has(q.id));
  const picked = shuffle(unseen).slice(0, n);
  if (picked.length < n) {
    const pickedIds = new Set(picked.map((q) => q.id));
    picked.push(...shuffle(all.filter((q) => !pickedIds.has(q.id))).slice(0, n - picked.length));
  }
  return shuffle(picked);
}

function markSeen(id) {
  const seen = load(SEEN_KEY, []);
  if (!seen.includes(id)) {
    seen.push(id);
    save(SEEN_KEY, seen);
  }
}

// pool 未指定＝綜合測驗（全題庫）；指定＝分類練習，只從該分類抽題
function startQuiz(container, grammarData, quizLen = 10, pool = null, catName = '') {
  const questions = pickQuestions(pool || grammarData.questions, quizLen);
  let index = 0;
  let correct = 0;

  function showQuestion() {
    if (index >= questions.length) return showResult();
    const q = questions[index];

    container.innerHTML = `
      <div class="session-top">
        <button class="link-btn" id="quit-btn">← 結束</button>
        <span class="progress-text">${catName ? catName + '・' : ''}第 ${index + 1} / ${questions.length} 題</span>
      </div>
      <div class="card">
        <div class="q-tags"><span class="tag">Part ${q.part}</span><span class="tag tag-type">${q.type}</span></div>
        <p class="q-text">${q.question.replace(/\n/g, '<br>')}</p>
        <div class="option-list" id="options">
          ${q.options
            .map((opt, i) => `<button class="btn option-btn" data-i="${i}"><span class="opt-letter">${LETTERS[i]}</span>${opt}</button>`)
            .join('')}
        </div>
        <div id="feedback" class="hidden"></div>
      </div>
      <div id="next-area"></div>`;

    container.querySelector('#quit-btn').addEventListener('click', () => renderGrammar(container, grammarData));

    container.querySelectorAll('.option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const picked = Number(btn.dataset.i);
        const isCorrect = picked === q.answer;
        if (isCorrect) correct += 1;
        recordActivity('grammar');
        markSeen(q.id);

        container.querySelectorAll('.option-btn').forEach((b) => {
          b.disabled = true;
          const i = Number(b.dataset.i);
          if (i === q.answer) b.classList.add('opt-correct');
          else if (i === picked) b.classList.add('opt-wrong');
        });

        const fb = container.querySelector('#feedback');
        fb.classList.remove('hidden');
        fb.innerHTML = `
          <p class="fb-verdict ${isCorrect ? 'ok' : 'ng'}">${isCorrect ? '✅ 答對了！' : `❌ 答錯了，正解是 (${LETTERS[q.answer]})`}</p>
          <p class="fb-explanation">${q.explanation}</p>
          <p class="fb-tip">💡 破題技巧：${q.tip}</p>`;

        container.querySelector('#next-area').innerHTML =
          `<button class="btn btn-primary btn-block" id="next-btn">${index + 1 >= questions.length ? '看成績' : '下一題'}</button>`;
        container.querySelector('#next-btn').addEventListener('click', () => {
          index += 1;
          showQuestion();
        });
      });
    });
  }

  function showResult() {
    const pct = Math.round((correct / questions.length) * 100);
    const msg = pct >= 80 ? '太強了，保持下去！' : pct >= 60 ? '不錯的表現，再刷一輪吧！' : '別氣餒，看解析弄懂再挑戰一次！';
    container.innerHTML = `
      <div class="card center-card">
        <div class="big-emoji">${pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪'}</div>
        <h2>${correct} / ${questions.length}</h2>
        <p>${msg}</p>
        <button class="btn btn-primary" id="again-btn">再測一次</button>
        <button class="btn" id="back-btn">回文法首頁</button>
      </div>
      <div class="card">
        <h3>要不要挑戰更多題目？</h3>
        <button class="btn task-btn" data-go="vocab">📚 複習單字 →</button>
        <button class="btn task-btn" data-go="listening">🎧 練一題聽力 →</button>
        <button class="btn task-btn" data-go="exam">🎯 挑戰模擬考（迷你/半份）→</button>
      </div>`;
    container.querySelector('#again-btn').addEventListener('click', () => startQuiz(container, grammarData, quizLen, pool, catName));
    container.querySelector('#back-btn').addEventListener('click', () => renderGrammar(container, grammarData));
    container.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => navigate(b.dataset.go)));
  }

  showQuestion();
}
