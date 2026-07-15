// 可點擊查詢單字：把文字裡的英文單字包成 span，點擊後直接發音並顯示中文意思
// 單字卡例句、文法例句、聽力逐字稿共用
import { lookupWord } from './dict.js';
import { speak, speechAvailable } from './speech.js';

// 文字裡的英文單字包成可點擊的 span
export function tappable(text) {
  return text
    .split(/(\s+)/)
    .map((tok) => (/[A-Za-z]/.test(tok) ? `<span class="tap-word">${tok}</span>` : tok))
    .join('');
}

// 綁定 scope 內所有 .tap-word：點擊 → 唸出該字（原字形），並在 pop 顯示意思
export function bindTapWords(scope, pop) {
  scope.addEventListener('click', (e) => {
    const t = e.target.closest('.tap-word');
    if (!t) return;
    scope.querySelectorAll('.tap-word.active').forEach((el) => el.classList.remove('active'));
    t.classList.add('active');
    if (speechAvailable()) speak(t.textContent.replace(/[^A-Za-z'\- ]/g, ''), { lang: 'en-US' });
    const info = lookupWord(t.textContent);
    if (!info) return;
    pop.classList.remove('hidden');
    pop.innerHTML = `
      <span class="pop-word">${info.word}</span>
      ${info.pos ? `<span class="fc-pos">${info.pos}</span>` : ''}
      <span class="pop-zh">${info.zh || '（不在字典裡）'}</span>`;
  });
}
