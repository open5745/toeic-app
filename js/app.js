// 主程式：載入資料、分頁導覽、首頁（Streak + 進度圖表）
import { load } from './storage.js';
import { isDue } from './srs.js';
import { currentStreak, recentDays, getActivity, todayCount } from './streak.js';
import { quota, addExtra, extraButtonLabel } from './plan.js';
import { renderVocab } from './vocab.js';
import { renderGrammar } from './grammar.js';
import { renderListening } from './listening.js';
import { renderSettings, startReminderLoop } from './settings.js';
import { renderExam } from './exam.js';
import { stopSpeaking } from './speech.js';

const view = document.getElementById('view');
let data = { vocab: null, grammar: null, listening: null };

async function loadData() {
  const [vocab, grammar, listening] = await Promise.all([
    fetch('data/vocab.json').then((r) => r.json()),
    fetch('data/grammar.json').then((r) => r.json()),
    fetch('data/listening.json').then((r) => r.json()),
  ]);
  data = { vocab, grammar, listening };
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 吉祥物：多益超人（純 SVG，無外部資源）
const MASCOT_SVG = `
<svg class="mascot" viewBox="0 0 200 214" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- 披風 -->
  <path d="M64 104 C46 146 42 178 54 200 C78 190 122 190 146 200 C158 178 154 146 136 104 Z" fill="#ef4b47"/>
  <path d="M64 104 C46 146 42 178 54 200 C61 197 69 194 78 193 C70 163 70 132 76 105 Z" fill="#d63b37"/>
  <!-- 腿與靴子 -->
  <rect x="78" y="156" width="18" height="38" rx="9" fill="#3f6df0"/>
  <rect x="104" y="156" width="18" height="38" rx="9" fill="#3f6df0"/>
  <path d="M76 186 h22 v12 a8 8 0 0 1 -8 8 h-6 a8 8 0 0 1 -8 -8 Z" fill="#ef4b47"/>
  <path d="M102 186 h22 v12 a8 8 0 0 1 -8 8 h-6 a8 8 0 0 1 -8 -8 Z" fill="#ef4b47"/>
  <!-- 身體 -->
  <path d="M73 98 h54 c5 0 8 3 8 8 l-4 44 c-1 7 -6 11 -13 11 h-36 c-7 0 -12 -4 -13 -11 l-4 -44 c0 -5 3 -8 8 -8 Z" fill="#4a7dff"/>
  <!-- 插腰的手臂與拳頭 -->
  <path d="M72 106 C55 113 49 128 57 140 C62 147 71 147 76 141" stroke="#4a7dff" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M128 106 C145 113 151 128 143 140 C138 147 129 147 124 141" stroke="#4a7dff" stroke-width="14" fill="none" stroke-linecap="round"/>
  <circle cx="77" cy="143" r="8.5" fill="#ffd8b4"/>
  <circle cx="123" cy="143" r="8.5" fill="#ffd8b4"/>
  <!-- 腰帶 -->
  <rect x="71" y="148" width="58" height="11" rx="5.5" fill="#ffc531"/>
  <!-- 胸前閃電徽章 -->
  <circle cx="100" cy="126" r="13" fill="#ffc531"/>
  <path d="M104 115 l-11 13 h7 l-4 11 11 -14 h-7 Z" fill="#ef4b47"/>
  <!-- 頭 -->
  <circle cx="100" cy="60" r="38" fill="#ffd8b4"/>
  <path d="M62 58 C60 27 79 16 100 16 C121 16 140 27 138 58 C129 45 116 38 100 38 C84 38 71 45 62 58 Z" fill="#3a2e2a"/>
  <path d="M97 18 C99 10 110 8 113 15 C107 13 102 15 100 21 Z" fill="#3a2e2a"/>
  <!-- 眼罩與眼睛 -->
  <rect x="58" y="50" width="84" height="27" rx="13.5" fill="#3557d4"/>
  <ellipse cx="84" cy="63" rx="10" ry="10.5" fill="#fff"/>
  <ellipse cx="116" cy="63" rx="10" ry="10.5" fill="#fff"/>
  <circle cx="86" cy="65" r="4.5" fill="#33302e"/>
  <circle cx="114" cy="65" r="4.5" fill="#33302e"/>
  <circle cx="88" cy="62" r="1.8" fill="#fff"/>
  <circle cx="112" cy="62" r="1.8" fill="#fff"/>
  <!-- 臉頰與笑容 -->
  <ellipse cx="71" cy="83" rx="6" ry="4.5" fill="#ffb199" opacity=".75"/>
  <ellipse cx="129" cy="83" rx="6" ry="4.5" fill="#ffb199" opacity=".75"/>
  <path d="M88 86 Q100 97 112 86" stroke="#b55b40" stroke-width="4.5" fill="none" stroke-linecap="round"/>
</svg>`;

function heroMessage(allDone, doneCount, pct) {
  if (allDone) return '今日任務全數達成，你就是今天的多益超人！';
  if (pct >= 50) return `已完成 ${pct}%，勝利就在眼前，衝啊！`;
  if (doneCount > 0) return '暖身完成，保持這個節奏繼續前進！';
  return '多益超人已就位，一起完成今天的訓練吧！';
}

function renderHome(container) {
  const streak = currentStreak();
  const activity = getActivity();
  const days = recentDays(7, activity);
  const maxTotal = Math.max(1, ...days.map((d) => d.total));
  const today = days[days.length - 1];

  const states = load('srs', {});
  const reviewsDue = data.vocab.packs
    .flatMap((p) => p.words)
    .filter((w) => states[w.id] && isDue(states[w.id])).length;

  const vNew = todayCount('vocabNew');
  const g = todayCount('grammar');
  const l = todayCount('listening');
  const qV = quota('vocabNew');
  const qG = quota('grammar');
  const qL = quota('listening');
  const allDone = vNew >= qV && g >= qG && l >= qL && reviewsDue === 0;

  const doneCount = Math.min(vNew, qV) + Math.min(g, qG) + Math.min(l, qL);
  const pct = Math.round((doneCount / (qV + qG + qL)) * 100);
  const hour = new Date().getHours();
  const timeGreet = hour < 5 ? '夜深了' : hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安';

  const tasks = [
    { go: 'vocab', ico: '📚', name: '單字', cls: 'task-vocab', done: Math.min(vNew, qV), quota: qV, meta: `新字 ${Math.min(vNew, qV)}/${qV}・待複習 ${reviewsDue}` },
    { go: 'grammar', ico: '📝', name: '文法測驗', cls: 'task-grammar', done: Math.min(g, qG), quota: qG, meta: `${Math.min(g, qG)}/${qG} 題` },
    { go: 'listening', ico: '🎧', name: '聽力訓練', cls: 'task-listening', done: Math.min(l, qL), quota: qL, meta: `${Math.min(l, qL)}/${qL} 題` },
  ];
  const taskRows = tasks
    .map((t) => {
      const p = Math.round((t.done / t.quota) * 100);
      return `
      <button class="task-row ${t.cls}" data-go="${t.go}">
        <span class="task-ico">${t.ico}</span>
        <span class="task-info">
          <span class="task-name">${t.name}${p >= 100 ? ' <span class="task-check">✓</span>' : ''}</span>
          <span class="task-meta">${t.meta}</span>
          <span class="task-track"><span class="task-fill" style="width:${p}%"></span></span>
        </span>
        <span class="task-arrow">›</span>
      </button>`;
    })
    .join('');

  const bars = days
    .map((d, i) => {
      const h = Math.round((d.total / maxTotal) * 100);
      const wd = WEEKDAYS[new Date(d.date + 'T00:00:00').getDay()];
      const isToday = i === days.length - 1;
      return `
        <div class="bar-col${isToday ? ' today' : ''}">
          <div class="bar-track"><div class="bar-fill" style="height:${Math.max(h, d.total > 0 ? 10 : 0)}%"></div></div>
          <span class="bar-label">${isToday ? '今天' : wd}</span>
        </div>`;
    })
    .join('');

  container.innerHTML = `
    <section class="hero-card">
      <span class="hero-bubble b1"></span><span class="hero-bubble b2"></span><span class="hero-bubble b3"></span>
      <div class="hero-main">
        <div class="hero-text">
          <p class="hero-greet">${timeGreet}！</p>
          <p class="hero-msg">${heroMessage(allDone, doneCount, pct)}</p>
          <div class="streak-pill">🔥 連續學習 <b>${streak}</b> 天</div>
        </div>
        <div class="mascot-box">${MASCOT_SVG}<div class="mascot-shadow"></div></div>
      </div>
      <div class="hero-progress">
        <div class="hp-track"><div class="hp-fill" style="width:${pct}%"></div></div>
        <span class="hp-label">今日進度 ${pct}%</span>
      </div>
    </section>
    ${allDone ? `
    <div class="card home-card center-card done-card">
      <div class="big-emoji">🏅</div>
      <p><strong>今日份量全部完成，太棒了！</strong></p>
      <p class="hint">想趁勝追擊嗎？可以追加半天的份量。</p>
      <button class="btn exam-btn btn-block" id="add-extra">${extraButtonLabel()}</button>
    </div>` : `
    <div class="card home-card">
      <h3 class="home-h3">📋 今日任務</h3>
      ${taskRows}
    </div>`}
    <div class="card home-card">
      <h3 class="home-h3">📈 最近 7 天學習量</h3>
      <div class="bar-chart">${bars}</div>
      <p class="hint chart-hint">今天已完成 ${today.total} 次練習</p>
    </div>
    <div class="card home-card">
      <h3 class="home-h3">🎯 考試模式</h3>
      <p class="hint">模擬真實多益流程：聽力只播一次、閱讀限時作答，考前衝刺專用。</p>
      <button class="btn exam-btn task-btn" data-go="exam">開始迷你模擬考 →</button>
    </div>`;

  container.querySelectorAll('[data-go]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.go));
  });
  const extraBtn = container.querySelector('#add-extra');
  if (extraBtn) extraBtn.addEventListener('click', () => { addExtra(); renderHome(container); });
}

const routes = {
  home: (c) => renderHome(c),
  vocab: (c) => renderVocab(c, data.vocab),
  grammar: (c) => renderGrammar(c, data.grammar),
  listening: (c) => renderListening(c, data.listening),
  exam: (c) => renderExam(c, data),
  settings: (c) => renderSettings(c),
};

export function navigate(page) {
  stopSpeaking();
  if (!routes[page]) page = 'home';
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
  routes[page](view);
  window.scrollTo(0, 0);
  if (location.hash !== '#' + page) history.replaceState(null, '', '#' + page);
}

async function init() {
  try {
    await loadData();
  } catch (e) {
    view.innerHTML = '<p class="warn">⚠️ 資料載入失敗，請用本機伺服器開啟（不能直接雙擊 index.html）。</p>';
    return;
  }

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  navigate(location.hash.replace('#', '') || 'home');
  startReminderLoop();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();
