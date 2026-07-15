// 單字模組：情境單字包 → 單字卡 + 間隔重複複習
import { load, save } from './storage.js';
import { GRADE, newCardState, review, isDue } from './srs.js';
import { speak, speechAvailable } from './speech.js';
import { recordActivity, todayCount } from './streak.js';
import { quota, addExtra, extraButtonLabel } from './plan.js';
import { tappable, bindTapWords } from './tapword.js';
import { recordHistory } from './history.js';
import { navigate } from './app.js';
import { shuffle } from './util.js';
import { playSoftClick } from './sound.js';
import { attachSwipe } from './swipe.js';

const SRS_KEY = 'srs';
const SWIPE_INTRO_KEY = 'swipeIntroSeen';

// 首次進入單字卡時顯示滑動手勢教學，看過一次就不再出現
function showSwipeIntroOnce(container) {
  if (load(SWIPE_INTRO_KEY, false)) return;
  const overlay = document.createElement('div');
  overlay.className = 'swipe-intro';
  overlay.innerHTML = `
    <div class="swipe-intro-box">
      <h3>單字卡可以用滑的！</h3>
      <div class="swipe-intro-row"><span class="intro-arrow intro-ng">←</span>太難，稍後再出一次</div>
      <div class="swipe-intro-row"><span class="intro-arrow intro-ok">→</span>記得了，交給排程複習</div>
      <p class="hint" style="margin: 12px 0 16px">不用先看答案也能滑。<br>想看中文與例句，點卡片下方「顯示答案」。</p>
      <button class="btn btn-primary btn-block" id="intro-ok">知道了</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#intro-ok').addEventListener('click', () => {
    save(SWIPE_INTRO_KEY, true);
    overlay.remove();
  });
}

export function renderVocab(container, vocabData) {
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
      <div class="session-top" style="margin-bottom: 24px;">
        <button class="link-btn" id="back-btn" style="color: var(--text-soft); letter-spacing: 0.05em; font-size: 0.8rem; font-weight: 600;">← 結束</button>
      </div>
      <div class="card flashcard card-enter" id="flashcard" style="padding: 0; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px;">
        <div style="padding: 40px 20px 20px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="fc-word">${word.word}</div>
          <div class="fc-phonetic">${word.pos} [${word.phonetic.replace(/[\\/\[\]]/g, '')}]</div>
          <div style="color: var(--text-soft); font-size: 0.95rem; margin-top: 4px;">${word.pos === 'v.' ? '動詞' : word.pos === 'n.' ? '名詞' : word.pos === 'adj.' ? '形容詞' : word.pos === 'adv.' ? '副詞' : '單字'}</div>
          ${speechAvailable() ? '<button class="speak-btn" id="speak-btn" style="margin: 16px auto 0; border: none; font-size: 1.2rem; color: var(--primary);">🔊</button>' : ''}
          <div class="fc-back hidden" id="fc-back">
            <div class="fc-zh">${word.zh}</div>
            ${examplesHtml}
            <p class="tap-hint" style="margin-top: 20px;">👆 點例句中的單字可直接發音並查看意思</p>
            <div class="word-pop hidden" id="word-pop"></div>
          </div>
        </div>
        <div id="reveal-btn" style="cursor: pointer; border-top: 1px solid var(--border); padding: 16px; color: var(--text-soft); font-size: 0.9rem; font-weight: 500;">
          點擊顯示答案 ⌄
        </div>
      </div>
      <p class="swipe-hint">← 太難，稍後再出｜記得了，滑掉 →</p>

      <div style="margin: 24px 0 32px;">
        <div style="font-size: 0.8rem; font-weight: 600; color: var(--text); margin-bottom: 8px;">第 ${index + 1} / ${queue.length} 詞</div>
        <div style="height: 6px; border-radius: 99px; background: var(--border); overflow: hidden;">
          <div style="height: 100%; border-radius: 99px; background: linear-gradient(90deg, #a1c2ba, #6b8c84); width: ${Math.round(((index + 1) / queue.length) * 100)}%; transition: width 0.3s;"></div>
        </div>
      </div>
      
      <div id="fc-actions" style="opacity: 0; pointer-events: none; transition: opacity 0.2s;">
        <div class="grade-row">
          <button class="btn grade-again" data-grade="${GRADE.AGAIN}">太困難</button>
          <button class="btn grade-good" data-grade="${GRADE.GOOD}" style="background: var(--primary); color: white; border: none;">我記得了</button>
          <button class="btn grade-easy" data-grade="${GRADE.EASY}">太簡單</button>
        </div>
      </div>`;

    container.querySelector('#back-btn').addEventListener('click', () => renderVocab(container, vocabData));
    const speakBtn = container.querySelector('#speak-btn');
    if (speakBtn) speakBtn.addEventListener('click', () => speak(word.word, { lang: 'en-US' }));

    // 整句發音
    container.querySelectorAll('.ex-speak[data-ex]').forEach((b) => {
      b.addEventListener('click', () => speak(examples[Number(b.dataset.ex)][0], { lang: 'en-US' }));
    });

    // 點例句單字 → 直接發音 + 顯示意思小卡
    bindTapWords(container.querySelector('#fc-back'), container.querySelector('#word-pop'));

    container.querySelector('#reveal-btn').addEventListener('click', (e) => {
      e.currentTarget.style.display = 'none';
      container.querySelector('#fc-back').classList.remove('hidden');
      const actions = container.querySelector('#fc-actions');
      actions.style.opacity = '1';
      actions.style.pointerEvents = 'auto';
      container.querySelectorAll('.grade-row .btn').forEach((b) => {
        b.addEventListener('click', () => {
          playSoftClick();
          gradeCard(word, Number(b.dataset.grade));
        });
      });
    });

    // 隨時可左右滑卡片評分（不必先看答案）：左＝太難稍後再出、右＝記得了
    attachSwipe(container.querySelector('#flashcard'), {
      leftTag: '太困難',
      rightTag: '記得了',
      // 音效同步播（手勢內），換卡延遲到飛出動畫結束
      onLeft: () => { playSoftClick(); setTimeout(() => gradeCard(word, GRADE.AGAIN), 240); },
      onRight: () => { playSoftClick(); setTimeout(() => gradeCard(word, GRADE.GOOD), 240); },
    });

    showSwipeIntroOnce(container);
  }

  function gradeCard(word, grade) {
    const states = load(SRS_KEY, {});
    const wasNew = !states[word.id];
    const prev = states[word.id] || newCardState();
    states[word.id] = review(prev, grade);
    save(SRS_KEY, states);
    recordHistory('vocab', word.id, word.word, word.zh);
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
    container.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { playSoftClick(); navigate(b.dataset.go); }));
    container.querySelector('#back-btn').addEventListener('click', () => { playSoftClick(); renderVocab(container, vocabData); });
  }

  showCard();
}
