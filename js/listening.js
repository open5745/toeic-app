// 聽力模組：Part 1–4 模擬題、多國口音、變速播放、單句重複、逐字稿開關
import { speakSequence, speak, stopSpeaking, speechAvailable, speakerVoiceOpts } from './speech.js';
import { recordActivity, todayCount } from './streak.js';
import { load, save } from './storage.js';
import { quota, addExtra, extraButtonLabel } from './plan.js';
import { navigate } from './app.js';
import { SCENES } from './scenes.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const DONE_KEY = 'listeningDone';

// 口音分類（聽力首頁的入口格子）
const ACCENTS = [
  { code: 'en-US', label: '美式', flag: '🇺🇸' },
  { code: 'en-GB', label: '英式', flag: '🇬🇧' },
  { code: 'en-AU', label: '澳式', flag: '🇦🇺' },
  { code: 'en-CA', label: '加拿大', flag: '🇨🇦' },
];

// 題型分類（對應多益聽力 Part 1–4）
const PARTS = [
  { part: 1, icon: '🖼️', label: '照片描述' },
  { part: 2, icon: '💬', label: '應答問題' },
  { part: 3, icon: '🗣️', label: '簡短對話' },
  { part: 4, icon: '📢', label: '簡短獨白' },
];

function markDone(id) {
  const done = load(DONE_KEY, []);
  if (!done.includes(id)) {
    done.push(id);
    save(DONE_KEY, done);
  }
}

export function renderListening(container, listeningData) {
  stopSpeaking();
  const done = new Set(load(DONE_KEY, []));
  const doneCount = listeningData.items.filter((it) => done.has(it.id)).length;
  const doneToday = todayCount('listening');
  const dailyQuota = quota('listening');

  // 今日份量已完成 → 顯示追加提示
  if (doneToday >= dailyQuota) {
    container.innerHTML = `
      <h2>聽力練習</h2>
      <div class="card center-card">
        <div class="big-emoji">🎉</div>
        <h2>今日聽力份量完成！</h2>
        <p>你今天已完成 <strong>${doneToday}</strong> 題聽力，耳朵可以休息囉。</p>
        <button class="btn btn-primary btn-block" id="add-extra">${extraButtonLabel()}</button>
        <button class="btn task-btn" data-go="vocab">📚 去複習單字 →</button>
        <button class="btn task-btn" data-go="grammar">📝 去做文法測驗 →</button>
        <button class="btn task-btn" data-go="exam">🎯 考試模式（不受份量限制）→</button>
      </div>`;
    container.querySelector('#add-extra').addEventListener('click', () => {
      addExtra();
      renderListening(container, listeningData);
    });
    container.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => navigate(b.dataset.go)));
    return;
  }

  const tileBtn = (attr, value, icon, label, items) => {
    const undone = items.filter((it) => !done.has(it.id)).length;
    const badge = undone > 0
      ? `<span class="tile-badge">${undone}</span>`
      : '<span class="tile-badge done">✓</span>';
    return `
      <button class="pack-tile" ${attr}="${value}">
        <span class="tile-icon">${icon}</span>
        <span class="tile-name">${label}</span>
        ${badge}
      </button>`;
  };

  const partTiles = PARTS
    .map((p) => tileBtn('data-part', p.part, p.icon, p.label, listeningData.items.filter((it) => it.part === p.part)))
    .join('');
  const accentTiles = ACCENTS
    .map((acc) => tileBtn('data-accent', acc.code, acc.flag, acc.label + '口音', listeningData.items.filter((it) => it.accent === acc.code)))
    .join('');

  container.innerHTML = `
    <h2>聽力練習</h2>
    <p class="hint">今日進度 ${doneToday} / ${dailyQuota} 題・題庫完成 ${doneCount} / ${listeningData.items.length} 題</p>
    ${speechAvailable() ? '' : '<p class="warn">⚠️ 此瀏覽器不支援語音合成，聽力播放無法使用。</p>'}
    <button class="btn btn-primary btn-block" id="random-item" style="margin-bottom:14px">🎲 隨機來一題（混合所有題型）</button>
    <h3 class="section-title">題型分類練習（Part 1–4）</h3>
    <div class="pack-grid" style="margin-bottom:14px">${partTiles}</div>
    <h3 class="section-title">口音分類練習</h3>
    <div class="pack-grid">${accentTiles}</div>`;

  container.querySelector('#random-item').addEventListener('click', () => {
    const unseen = listeningData.items.filter((it) => !done.has(it.id));
    const pool = unseen.length ? unseen : listeningData.items;
    const item = pool[Math.floor(Math.random() * pool.length)];
    renderPlayer(container, item, listeningData);
  });

  container.querySelectorAll('[data-accent]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const acc = ACCENTS.find((a) => a.code === btn.dataset.accent);
      renderGroupList(container, listeningData, {
        icon: acc.flag,
        label: acc.label + '口音',
        match: (it) => it.accent === acc.code,
      });
    });
  });
  container.querySelectorAll('[data-part]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = PARTS.find((x) => x.part === Number(btn.dataset.part));
      renderGroupList(container, listeningData, {
        icon: p.icon,
        label: `Part ${p.part} ${p.label}`,
        match: (it) => it.part === p.part,
      });
    });
  });
}

// 分類（口音或題型）的題目清單
function renderGroupList(container, listeningData, group) {
  stopSpeaking();
  const done = new Set(load(DONE_KEY, []));
  const items = listeningData.items.filter(group.match);
  const undone = items.filter((it) => !done.has(it.id));
  const ctx = {
    pool: items,
    back: () => renderGroupList(container, listeningData, group),
  };

  const itemsHtml = items
    .map(
      (item) => `
      <button class="card pack-card" data-item="${item.id}">
        <span class="pack-icon">${item.part === 1 ? '🖼️' : '🎧'}</span>
        <span class="pack-name">${item.title}</span>
        <span class="pack-meta">Part ${item.part}・${item.accentLabel}口音</span>
        ${done.has(item.id) ? '<span class="badge badge-done">✓</span>' : ''}
      </button>`
    )
    .join('');

  container.innerHTML = `
    <div class="session-top">
      <button class="link-btn" id="back-btn">← 返回</button>
      <span class="progress-text">${group.icon} ${group.label}・完成 ${items.length - undone.length} / ${items.length}</span>
    </div>
    <button class="btn btn-primary btn-block" id="random-group" style="margin-bottom:12px">🎲 隨機一題（此分類，未做過優先）</button>
    <div class="pack-list">${itemsHtml}</div>`;

  container.querySelector('#back-btn').addEventListener('click', () => renderListening(container, listeningData));
  container.querySelector('#random-group').addEventListener('click', () => {
    const pool = undone.length ? undone : items;
    const item = pool[Math.floor(Math.random() * pool.length)];
    renderPlayer(container, item, listeningData, ctx);
  });
  container.querySelectorAll('.pack-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = items.find((it) => it.id === btn.dataset.item);
      renderPlayer(container, item, listeningData, ctx);
    });
  });
}

function renderPlayer(container, item, listeningData, ctx = null) {
  // ctx = { pool, back }：從口音分類進入時，下一題與返回都限定在該分類
  const pool = ctx ? ctx.pool : listeningData.items;
  const goBack = ctx ? ctx.back : () => renderListening(container, listeningData);
  let rate = 1.0;
  let transcriptVisible = false;
  let answered = false;

  const sentenceRows = item.sentences
    .map(
      (s, i) => `
      <div class="sentence-row">
        <button class="btn sentence-play" data-i="${i}">▶</button>
        <span class="sentence-text masked" data-text-i="${i}">${s.speaker !== 'N' && s.speaker !== 'Q' ? `<b>${s.speaker === 'M' ? '男' : '女'}：</b>` : ''}${s.text}</span>
      </div>`
    )
    .join('');

  const sceneHtml = item.part === 1 && SCENES[item.scene]
    ? `<div class="scene-box">${SCENES[item.scene]}</div>`
    : '';

  container.innerHTML = `
    <div class="session-top">
      <button class="link-btn" id="back-btn">← 返回</button>
      <span class="progress-text">Part ${item.part}・${item.accentLabel}口音</span>
    </div>
    <div class="card">
      <h3>${item.title}</h3>
      ${sceneHtml}
      <div class="player-controls">
        <button class="btn btn-primary" id="play-all">▶ 播放全部</button>
        <button class="btn" id="stop-play">■ 停止</button>
      </div>
      <label class="rate-label">語速 <span id="rate-val">1.0x</span>
        <input type="range" id="rate-slider" min="0.8" max="1.2" step="0.1" value="1.0">
      </label>
      <button class="link-btn" id="toggle-transcript">顯示逐字稿</button>
      <div class="transcript">${sentenceRows}</div>
    </div>
    <div class="card">
      <p class="q-text">${item.question}</p>
      <div class="option-list${item.part === 1 ? ' p1-hidden' : ''}">
        ${item.options
          .map((opt, i) => `<button class="btn option-btn" data-i="${i}"><span class="opt-letter">${LETTERS[i]}</span><span class="opt-en masked-opt">${opt}</span></button>`)
          .join('')}
      </div>
      <div id="feedback" class="hidden"></div>
    </div>`;

  const speakOpts = () => ({ lang: item.accent, rate });

  container.querySelector('#back-btn').addEventListener('click', () => {
    stopSpeaking();
    goBack();
  });
  container.querySelector('#play-all').addEventListener('click', () => {
    speakSequence(item.sentences.map((s) => ({ text: s.text, ...speakerVoiceOpts(s.speaker) })), speakOpts());
  });
  container.querySelector('#stop-play').addEventListener('click', stopSpeaking);

  container.querySelector('#rate-slider').addEventListener('input', (e) => {
    rate = Number(e.target.value);
    container.querySelector('#rate-val').textContent = rate.toFixed(1) + 'x';
  });

  const toggleBtn = container.querySelector('#toggle-transcript');
  toggleBtn.addEventListener('click', () => {
    transcriptVisible = !transcriptVisible;
    toggleBtn.textContent = transcriptVisible ? '隱藏逐字稿' : '顯示逐字稿';
    container.querySelectorAll('.sentence-text').forEach((el) => el.classList.toggle('masked', !transcriptVisible));
  });

  container.querySelectorAll('.sentence-play').forEach((btn) => {
    btn.addEventListener('click', () => {
      stopSpeaking();
      const s = item.sentences[Number(btn.dataset.i)];
      speak(s.text, { ...speakOpts(), ...speakerVoiceOpts(s.speaker) });
    });
  });

  container.querySelectorAll('.option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const picked = Number(btn.dataset.i);
      const isCorrect = picked === item.answer;
      recordActivity('listening');
      markDone(item.id);

      container.querySelectorAll('.option-btn').forEach((b) => {
        b.disabled = true;
        const i = Number(b.dataset.i);
        if (i === item.answer) b.classList.add('opt-correct');
        else if (i === picked) b.classList.add('opt-wrong');
      });
      // Part 1：作答後才顯示四句描述的文字
      container.querySelectorAll('.p1-hidden').forEach((el) => el.classList.remove('p1-hidden'));

      const fb = container.querySelector('#feedback');
      fb.classList.remove('hidden');
      const quotaReached = todayCount('listening') >= quota('listening');
      const doneSet = new Set(load(DONE_KEY, []));
      const unseenPool = pool.filter((it) => !doneSet.has(it.id));
      const nextItem = unseenPool[Math.floor(Math.random() * unseenPool.length)] || null;

      let footerHtml;
      if (quotaReached) {
        footerHtml = `
          <p class="fb-verdict ok">🎉 今日聽力份量完成！</p>
          <button class="btn btn-primary btn-block" id="add-extra">${extraButtonLabel()}</button>
          <button class="btn task-btn" data-go="grammar">📝 去做文法測驗 →</button>
          <button class="btn task-btn" data-go="vocab">📚 去複習單字 →</button>
          <button class="btn task-btn" id="back-list">🎧 回聽力列表</button>`;
      } else if (nextItem) {
        footerHtml = '<button class="btn btn-primary btn-block" id="next-item">下一題 →</button>';
      } else {
        footerHtml = `
          <p class="fb-verdict ok">🎉 這一區的題目全部完成！要不要挑戰更多？</p>
          <button class="btn task-btn" data-go="grammar">📝 來一回文法測驗 →</button>
          <button class="btn task-btn" data-go="vocab">📚 複習單字 →</button>
          <button class="btn task-btn" data-go="exam">🎯 挑戰迷你模擬考 →</button>
          <button class="btn task-btn" id="back-list">🎧 返回列表</button>`;
      }

      fb.innerHTML = `
        <p class="fb-verdict ${isCorrect ? 'ok' : 'ng'}">${isCorrect ? '✅ 答對了！' : `❌ 答錯了，正解是 (${LETTERS[item.answer]})`}</p>
        <p class="fb-explanation"><b>選項翻譯：</b>${item.optionsZh.map((z, i) => `(${LETTERS[i]}) ${z}`).join('　')}</p>
        <p class="fb-explanation"><b>中文語意：</b>${item.transcriptZh}</p>
        <p class="fb-tip">💡 破題技巧：${item.tip}</p>
        ${footerHtml}`;

      const nextBtn = fb.querySelector('#next-item');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          stopSpeaking();
          renderPlayer(container, nextItem, listeningData, ctx);
        });
      }
      const extraBtn = fb.querySelector('#add-extra');
      if (extraBtn) {
        extraBtn.addEventListener('click', () => {
          addExtra();
          stopSpeaking();
          renderListening(container, listeningData);
        });
      }
      fb.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => navigate(b.dataset.go)));
      const backBtn = fb.querySelector('#back-list');
      if (backBtn) backBtn.addEventListener('click', () => {
        stopSpeaking();
        goBack();
      });
    });
  });
}
