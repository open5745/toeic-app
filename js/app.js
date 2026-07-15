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
import { stopSpeaking, speak } from './speech.js';
import { buildDict } from './dict.js';
import { getHistory } from './history.js';
import { trendSvg, summaryHtml } from './stats.js';

const view = document.getElementById('view');
let data = { vocab: null, grammar: null, listening: null };

async function loadData() {
  const [vocab, grammar, listening] = await Promise.all([
    fetch('data/vocab.json').then((r) => r.json()),
    fetch('data/grammar.json').then((r) => r.json()),
    fetch('data/listening.json').then((r) => r.json()),
  ]);
  data = { vocab, grammar, listening };
  buildDict(vocab); // 點字查詢字典（單字/文法/聽力頁共用）
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 吉祥物已移除，採用極簡介面

const HIST_ICON = { vocab: 'V', grammar: 'G', listening: 'L' };

function histTimeLabel(t) {
  const d = new Date(t);
  const today = new Date();
  const days = Math.floor((new Date(today.getFullYear(), today.getMonth(), today.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function heroMessage(allDone, doneCount, pct) {
  if (allDone) return '今日任務已全部完成，太棒了！';
  if (pct >= 50) return `你已經完成了 ${pct}%，繼續保持！`;
  if (doneCount > 0) return '暖身完畢，保持這個氣勢！';
  return "準備好開始今天的練習了嗎？";
}

function renderHome(container) {
  const activity = getActivity();
  const streak = currentStreak(activity);
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

  const iconVocab = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="12" height="16" rx="3" fill="#84A59D" fill-opacity="0.2"/><rect x="8" y="7" width="12" height="15" rx="3" fill="#84A59D"/><path d="M12 12H16M12 16H14" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
  const iconGrammar = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#84A59D" fill-opacity="0.15"/><path d="M15.5 5.5l3 3-9 9H6.5v-3l9-9z" fill="#84A59D"/><path d="M14 7l3 3" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M6 18L4 20" stroke="#84A59D" stroke-width="2" stroke-linecap="round"/></svg>`;
  const iconListening = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 13V9a8 8 0 0 1 16 0v4" stroke="#84A59D" stroke-width="2" stroke-opacity="0.3" stroke-linecap="round"/><rect x="2" y="11" width="5" height="9" rx="2.5" fill="#84A59D"/><rect x="17" y="11" width="5" height="9" rx="2.5" fill="#84A59D"/></svg>`;

  const tasks = [
    { go: 'vocab', ico: iconVocab, name: '單字', cls: 'task-vocab', done: Math.min(vNew, qV), quota: qV, meta: `新字 ${Math.min(vNew, qV)}/${qV} • 複習 ${reviewsDue}` },
    { go: 'grammar', ico: iconGrammar, name: '文法', cls: 'task-grammar', done: Math.min(g, qG), quota: qG, meta: `${Math.min(g, qG)}/${qG} 題` },
    { go: 'listening', ico: iconListening, name: '聽力', cls: 'task-listening', done: Math.min(l, qL), quota: qL, meta: `${Math.min(l, qL)}/${qL} 題` },
  ];
  const taskRows = tasks
    .map((t) => {
      const p = Math.round((t.done / t.quota) * 100);
      const isDone = p >= 100;
      return `
      <button class="task-row" data-go="${t.go}" style="display: flex; align-items: center; justify-content: space-between; width: 100%; border-radius: 20px; padding: 16px 20px; background: var(--surface); border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.02); margin-bottom: 12px; cursor: pointer; text-align: left; transition: transform 0.2s, box-shadow 0.2s;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="width: 46px; height: 46px; display: grid; place-items: center; border-radius: 14px; background: ${isDone ? 'rgba(47, 133, 90, 0.1)' : 'rgba(132, 165, 157, 0.1)'}; color: ${isDone ? 'var(--ok)' : 'var(--primary)'}; font-size: 1.3rem; flex: none;">${t.ico}</span>
          <div>
            <div style="font-weight: 600; font-size: 1.05rem; color: var(--text);">${t.name}</div>
            <div style="color: var(--text-soft); font-size: 0.85rem; margin-top: 2px;">${t.meta}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          ${isDone ? `<span style="color: var(--ok); font-weight: 700; font-size: 1.1rem;">✓</span>` : `<span style="font-size: 0.85rem; font-weight: 600; color: var(--text);">${p}%</span>`}
          <div style="width: 50px; height: 6px; border-radius: 99px; background: var(--bg); overflow: hidden;">
            <div style="height: 100%; border-radius: 99px; background: ${isDone ? 'var(--ok)' : 'var(--primary)'}; width:${p}%"></div>
          </div>
        </div>
      </button>`;
    })
    .join('');

  const history = getHistory().slice(0, 10);
  const histRows = history
    .map((e, i) => `
      <button class="hist-row" data-h="${i}" style="display: flex; align-items: center; justify-content: space-between; width: 100%; border: none; border-bottom: 1px solid var(--border); border-radius: 0; padding: 12px 4px; background: transparent; cursor: pointer; text-align: left;">
        <span class="hist-info">
          <span class="hist-en" style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--text); font-weight: 400;">${e.text}</span>
          ${e.zh ? `<span class="hist-zh" style="display: block; margin-top: 2px; font-size: 0.85rem; color: var(--text-soft);">${e.zh}</span>` : ''}
        </span>
        <span class="hist-time" style="font-size: 0.75rem; color: var(--text-soft);">${histTimeLabel(e.t)}</span>
      </button>`)
    .join('');

  const bars = days
    .map((d, i) => {
      const h = Math.round((d.total / maxTotal) * 100);
      const wd = ['日', '一', '二', '三', '四', '五', '六'][new Date(d.date + 'T00:00:00').getDay()];
      const isToday = i === days.length - 1;
      return `
        <div class="bar-col${isToday ? ' today' : ''}" style="display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%;">
          <div class="bar-track" style="flex: 1; width: 14px; background: var(--bg); border-radius: 99px; display: flex; align-items: flex-end; overflow: hidden;"><div class="bar-fill" style="width: 100%; background: ${isToday ? 'var(--text)' : 'var(--border)'}; border-radius: 99px; height:${Math.max(h, d.total > 0 ? 10 : 0)}%"></div></div>
          <span class="bar-label" style="font-size: 0.75rem; color: ${isToday ? 'var(--text)' : 'var(--text-soft)'}; font-weight: ${isToday ? '600' : '400'};">${isToday ? '今日' : wd}</span>
        </div>`;
    })
    .join('');

  // 取得每日一字 (根據日期固定選一個字)
  const allWords = data.vocab.packs.flatMap(p => p.words);
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const wotd = allWords[dayIndex % allWords.length];

  const wotdHtml = wotd ? `
    <div style="background: rgba(132, 165, 157, 0.08); border-radius: 20px; padding: 22px 20px; margin-bottom: 24px; position: relative; overflow: hidden; border: 1px solid rgba(132, 165, 157, 0.2);">
      <div style="position: absolute; right: 0px; top: -10px; font-size: 6rem; opacity: 0.03; font-family: var(--font-serif); user-select: none;">A</div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <h3 style="font-size: 0.75rem; font-weight: 700; color: var(--primary); letter-spacing: 0.05em; text-transform: uppercase;">✨ 每日一字 Word of the Day</h3>
      </div>
      <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 2.2rem; font-family: var(--font-serif); font-weight: 400; color: var(--text);">${wotd.word}</span>
        <span style="color: var(--text-soft); font-size: 0.95rem;">${wotd.pos}</span>
      </div>
      <div style="font-size: 1.05rem; color: var(--text); font-weight: 500;">${wotd.zh}</div>
    </div>
  ` : '';

  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
        <div>
          <p class="hero-greet" style="font-size: 1.9rem; font-weight: 400; font-family: var(--font-serif); color: var(--text); letter-spacing: -0.02em; margin-bottom: 4px;">${timeGreet}</p>
          <p class="hero-msg" style="font-size: 0.95rem; color: var(--text-soft);">${heroMessage(allDone, doneCount, pct)}</p>
        </div>
        <div style="text-align: center; background: var(--bg); padding: 10px 16px; border-radius: 16px; border: 1px solid var(--border);">
          <div style="font-size: 0.7rem; color: var(--text-soft); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">🔥 連勝</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text);">${streak} <span style="font-size: 0.75rem; font-weight: 500;">天</span></div>
        </div>
      </div>
      
      ${wotdHtml}
    </div>
    
    ${allDone ? `
    <div class="card center-card" style="border: 1px solid var(--border); box-shadow: none; border-radius: 20px; padding: 32px 20px;">
      <div class="big-emoji" style="opacity: 0.8; font-size: 3rem;">🎉</div>
      <p style="font-weight: 600; font-size: 1.1rem; margin: 12px 0 6px;">今日任務已全部完成</p>
      <p style="color: var(--text-soft); font-size: 0.9rem; margin-bottom: 20px;">太棒了！你的英文又進步了一點。</p>
      <button class="btn btn-primary" id="add-extra">追加更多練習</button>
    </div>` : `
    <div style="margin-bottom: 32px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 0.85rem; font-weight: 600; color: var(--text-soft); letter-spacing: 0.05em; text-transform: uppercase;">今日任務</h3>
        <span style="font-size: 0.75rem; font-weight: 600; color: var(--primary); background: rgba(132, 165, 157, 0.1); padding: 2px 8px; border-radius: 99px;">完成度 ${pct}%</span>
      </div>
      ${taskRows}
    </div>`}
    
    <div style="margin-bottom: 32px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 0.85rem; font-weight: 600; color: var(--text-soft); letter-spacing: 0.05em; text-transform: uppercase;">學習動態</h3>
        <div class="range-toggle">
          <button class="range-btn active" data-range="7">7 天</button>
          <button class="range-btn" data-range="30">30 天</button>
        </div>
      </div>
      <div id="chart-7" class="bar-chart" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; height: 120px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">${bars}</div>
      <div id="chart-30" class="hidden" style="padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
        ${trendSvg(30)}
        ${summaryHtml(30)}
      </div>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 0.85rem; font-weight: 600; color: var(--text-soft); letter-spacing: 0.05em; margin-bottom: 12px; text-transform: uppercase;">歷史回顧</h3>
      ${history.length ? `
      ${histRows}` : '<p class="hint" style="text-align: left; margin-top: 12px;">尚無歷史紀錄。</p>'}
    </div>`;

  container.querySelectorAll('[data-go]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.go));
  });

  // 學習動態 7 天 / 30 天切換
  container.querySelectorAll('.range-btn').forEach((b) => {
    b.addEventListener('click', () => {
      container.querySelectorAll('.range-btn').forEach((x) => x.classList.toggle('active', x === b));
      container.querySelector('#chart-7').classList.toggle('hidden', b.dataset.range !== '7');
      container.querySelector('#chart-30').classList.toggle('hidden', b.dataset.range !== '30');
    });
  });
  const extraBtn = container.querySelector('#add-extra');
  if (extraBtn) extraBtn.addEventListener('click', () => { addExtra(); renderHome(container); });

  // 歷史回顧：點一筆播放英文發音
  container.querySelectorAll('.hist-row').forEach((row) => {
    row.addEventListener('click', () => {
      stopSpeaking();
      speak(history[Number(row.dataset.h)].text, { lang: 'en-US' });
    });
  });
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

function handleSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;
  
  // 如果這次 session 已經播過，就直接隱藏
  if (sessionStorage.getItem('splashShown')) {
    splash.style.display = 'none';
    return;
  }
  
  const hour = new Date().getHours();
  let greetings = [];

  if (hour >= 5 && hour < 12) {
    greetings = [
      { g: '早安', m: '今天也是充滿希望的一天！準備好開始學習了嗎？' },
      { g: '早安', m: '新的一天開始了，用英文為自己充個電吧！' },
      { g: '早晨愉快', m: '一日之計在於晨，讓我們先來背幾個單字！' },
      { g: 'Morning!', m: '一杯咖啡，配上幾句英文，開啟美好的一天。' },
      { g: '早安你好', m: '別忘了今天的學習目標，我們一起努力！' }
    ];
  } else if (hour >= 12 && hour < 18) {
    greetings = [
      { g: '午安', m: '稍作休息後，來點輕鬆的練習吧！' },
      { g: '午後時光', m: '吃飽了嗎？花個五分鐘，保持英文的語感！' },
      { g: '午安', m: '下午好！覺得累的話，我們就挑些簡單的題目做吧。' },
      { g: 'Good Afternoon', m: '保持專注，你離多益高分又更近了一步。' },
      { g: '午安你好', m: '即使只是一小步，每天累積起來也很可觀喔！' }
    ];
  } else {
    greetings = [
      { g: '晚安', m: '辛苦了一天，用幾個單字做個完美的收尾吧！' },
      { g: '夜晚愉快', m: '放鬆心情，我們來做點睡前的輕鬆聽力測驗。' },
      { g: '晚安', m: '今天過得好嗎？不管怎樣，堅持學習的你很棒！' },
      { g: 'Good Evening', m: '學習不用有壓力，跟著自己的步調慢慢來就好。' },
      { g: '夜深了', m: '別讓大腦太累，複習完這回合就去好好休息吧！' }
    ];
  }

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  document.getElementById('splash-greet').textContent = randomGreeting.g;
  document.getElementById('splash-msg').textContent = randomGreeting.m;

  // 停留 2.2 秒後觸發淡出動畫，動畫結束後徹底隱藏
  setTimeout(() => {
    splash.classList.add('fade-out');
    sessionStorage.setItem('splashShown', 'true');
    setTimeout(() => { splash.style.display = 'none'; }, 800);
  }, 2200);
}

async function init() {
  handleSplashScreen();

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
