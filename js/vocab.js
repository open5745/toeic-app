// 單字模組：情境單字包 → 單字卡 + 間隔重複複習
import { load, save } from './storage.js';
import { GRADE, newCardState, review, isDue } from './srs.js';
import { speak, speechAvailable } from './speech.js';
import { recordActivity, todayCount } from './streak.js';
import { quota, addExtra, extraButtonLabel } from './plan.js';
import { buildDict, lookupWord } from './dict.js';
import { navigate } from './app.js';

const SRS_KEY = 'srs';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 例句裡的英文單字包成可點擊的 span
function tappable(text) {
  return text
    .split(/(\s+)/)
    .map((tok) => (/[A-Za-z]/.test(tok) ? `<span class="tap-word">${tok}</span>` : tok))
    .join('');
}

export function renderVocab(container, vocabData) {
  buildDict(vocabData);
  const states = load(SRS_KEY, {});
  const newDone = todayCount('vocabNew');
  const newQuota = quota('vocabNew');
  const allowance = Math.max(0, newQuota - newDone);
  let totalReviews = 0;

  const tilesHtml = vocabData.packs
    .map((pack) => {
      const reviews = pack.words.filter((w) => states[w.id] && isDue(states[w.id])).length;
      const fresh = pack.words.filter((w) => !states[w.id]).length;
      totalReviews += reviews;
      const badge = reviews > 0
        ? `<span class="tile-badge">${reviews}</span>`
        : fresh === 0
          ? '<span class="tile-badge done">✓</span>'
          : '';
      return `
        <button class="pack-tile" data-pack="${pack.id}">
          <span class="tile-icon">${pack.icon}</span>
          <span class="tile-name">${pack.name}</span>
          ${badge}
        </button>`;
    })
    .join('');

  const doneToday = allowance === 0 && totalReviews === 0;
  container.innerHTML = `
    <h2>單字練習</h2>
    <p class="hint">今日新字 ${Math.min(newDone, newQuota)} / ${newQuota}・待複習 ${totalReviews} 張</p>
    ${doneToday ? `
      <div class="card center-card">
        <div class="big-emoji">🎉</div>
        <p><strong>今日單字份量全部完成！</strong></p>
        <button class="btn btn-primary btn-block" id="add-extra">${extraButtonLabel()}</button>
      </div>` : `
      <button class="btn btn-primary btn-block" id="random-study" style="margin-bottom:14px">🎲 隨機學習（混合所有分類）</button>`}
    <h3 class="section-title">分類學習</h3>
    <div class="pack-grid">${tilesHtml}</div>`;

  const extraBtn = container.querySelector('#add-extra');
  if (extraBtn) extraBtn.addEventListener('click', () => { addExtra(); renderVocab(container, vocabData); });

  const randomBtn = container.querySelector('#random-study');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const allWords = vocabData.packs.flatMap((p) => p.words);
      startSession(container, { id: 'random', name: '隨機學習', words: allWords }, vocabData);
    });
  }

  container.querySelectorAll('.pack-tile').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pack = vocabData.packs.find((p) => p.id === btn.dataset.pack);
      startSession(container, pack, vocabData);
    });
  });
}

function startSession(container, pack, vocabData) {
  const states = load(SRS_KEY, {});
  const reviewsDue = pack.words.filter((w) => states[w.id] && isDue(states[w.id]));
  const fresh = pack.words.filter((w) => !states[w.id]);
  const allowance = Math.max(0, quota('vocabNew') - todayCount('vocabNew'));
  let queue = [...shuffle(reviewsDue), ...shuffle(fresh).slice(0, allowance)];
  let freeMode = false;

  let index = 0;
  let doneCount = 0;

  // 本包今日份量已完成 → 詢問追加或自由瀏覽
  if (queue.length === 0) {
    container.innerHTML = `
      <div class="card center-card">
        <div class="big-emoji">🎉</div>
        <h2>今日份量完成！</h2>
        <p>這個單字包今天的複習卡與新字額度都完成了。</p>
        <button class="btn btn-primary btn-block" id="add-extra">${extraButtonLabel()}</button>
        <button class="btn btn-block" id="free-browse">自由瀏覽這一包（不計額度）</button>
        <button class="btn btn-block" id="back-btn">回單字包列表</button>
      </div>`;
    container.querySelector('#add-extra').addEventListener('click', () => {
      addExtra();
      startSession(container, pack, vocabData);
    });
    container.querySelector('#free-browse').addEventListener('click', () => {
      freeMode = true;
      queue = shuffle(pack.words);
      showCard();
    });
    container.querySelector('#back-btn').addEventListener('click', () => renderVocab(container, vocabData));
    return;
  }

  function showCard() {
    if (index >= queue.length) return showSummary();
    const word = queue[index];

    const examples = [[word.exampleEn, word.exampleZh]];
    if (word.exampleEn2) examples.push([word.exampleEn2, word.exampleZh2]);
    const examplesHtml = examples
      .map(
        ([en, zh], i) => `
        <div class="example-block">
          <p class="fc-example-en">${tappable(en)}${speechAvailable() ? ` <button class="ex-speak" data-ex="${i}" title="播放整句">🔊</button>` : ''}</p>
          <p class="fc-example-zh">${zh}</p>
        </div>`
      )
      .join('');

    container.innerHTML = `
      <div class="session-top">
        <button class="link-btn" id="back-btn">← 返回</button>
        <span class="progress-text">${index + 1} / ${queue.length}</span>
      </div>
      <div class="card flashcard" id="flashcard">
        <div class="fc-word">${word.word}</div>
        <div class="fc-phonetic">${word.phonetic} <span class="fc-pos">${word.pos}</span></div>
        ${speechAvailable() ? '<button class="speak-btn" id="speak-btn">🔊 發音</button>' : ''}
        <div class="fc-back hidden" id="fc-back">
          <div class="fc-zh">${word.zh}</div>
          ${examplesHtml}
          <p class="tap-hint">👆 點例句中的單字可查看意思</p>
          <div class="word-pop hidden" id="word-pop"></div>
        </div>
      </div>
      <div id="fc-actions">
        <button class="btn btn-primary btn-block" id="reveal-btn">顯示答案</button>
      </div>`;

    container.querySelector('#back-btn').addEventListener('click', () => renderVocab(container, vocabData));
    const speakBtn = container.querySelector('#speak-btn');
    if (speakBtn) speakBtn.addEventListener('click', () => speak(word.word, { lang: 'en-US' }));

    // 整句發音
    container.querySelectorAll('.ex-speak[data-ex]').forEach((b) => {
      b.addEventListener('click', () => speak(examples[Number(b.dataset.ex)][0], { lang: 'en-US' }));
    });

    // 點例句單字 → 顯示意思小卡
    const backPanel = container.querySelector('#fc-back');
    backPanel.addEventListener('click', (e) => {
      const t = e.target.closest('.tap-word');
      if (!t) return;
      backPanel.querySelectorAll('.tap-word.active').forEach((el) => el.classList.remove('active'));
      t.classList.add('active');
      const info = lookupWord(t.textContent);
      if (!info) return;
      const pop = container.querySelector('#word-pop');
      pop.classList.remove('hidden');
      pop.innerHTML = `
        <span class="pop-word">${info.word}</span>
        ${info.pos ? `<span class="fc-pos">${info.pos}</span>` : ''}
        <span class="pop-zh">${info.zh || '（不在字典裡，點 🔊 聽發音）'}</span>
        ${speechAvailable() ? '<button class="ex-speak" id="pop-speak">🔊</button>' : ''}`;
      const ps = pop.querySelector('#pop-speak');
      if (ps) ps.addEventListener('click', (ev) => {
        ev.stopPropagation();
        speak(info.word, { lang: 'en-US' });
      });
    });

    container.querySelector('#reveal-btn').addEventListener('click', () => {
      container.querySelector('#fc-back').classList.remove('hidden');
      container.querySelector('#fc-actions').innerHTML = `
        <div class="grade-row">
          <button class="btn grade-again" data-grade="${GRADE.AGAIN}">忘記</button>
          <button class="btn grade-hard" data-grade="${GRADE.HARD}">困難</button>
          <button class="btn grade-good" data-grade="${GRADE.GOOD}">記得</button>
          <button class="btn grade-easy" data-grade="${GRADE.EASY}">簡單</button>
        </div>`;
      container.querySelectorAll('.grade-row .btn').forEach((b) => {
        b.addEventListener('click', () => gradeCard(word, Number(b.dataset.grade)));
      });
    });
  }

  function gradeCard(word, grade) {
    const states = load(SRS_KEY, {});
    const wasNew = !states[word.id];
    const prev = states[word.id] || newCardState();
    states[word.id] = review(prev, grade);
    save(SRS_KEY, states);
    recordActivity('vocab');
    if (wasNew && !freeMode) recordActivity('vocabNew');
    doneCount += 1;

    if (grade === GRADE.AGAIN) {
      // 忘記的字排到本輪最後再出現一次
      queue.push(word);
    }
    index += 1;
    showCard();
  }

  function showSummary() {
    container.innerHTML = `
      <div class="card center-card">
        <div class="big-emoji">🎉</div>
        <h2>本輪完成！</h2>
        <p>你複習了 <strong>${doneCount}</strong> 張單字卡。</p>
      </div>
      <div class="card">
        <h3>要不要挑戰更多題目？</h3>
        <button class="btn task-btn" data-go="grammar">📝 來一回文法測驗 →</button>
        <button class="btn task-btn" data-go="listening">🎧 練一題聽力 →</button>
        <button class="btn task-btn" data-go="exam">🎯 挑戰模擬考（迷你/半份）→</button>
        <button class="btn task-btn" id="back-btn">📚 回單字包列表</button>
      </div>`;
    container.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => navigate(b.dataset.go)));
    container.querySelector('#back-btn').addEventListener('click', () => renderVocab(container, vocabData));
  }

  showCard();
}
