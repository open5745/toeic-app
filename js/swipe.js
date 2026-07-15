// 卡片滑動手勢：左滑/右滑觸發回呼，未達門檻回彈
// 卡片跟著手指移動並微幅旋轉，拖曳距離越遠、方向標籤越明顯
const THRESHOLD = 90; // 觸發滑動判定的水平距離（px）

export function attachSwipe(card, { canSwipe = () => true, onLeft, onRight, leftTag = '', rightTag = '' } = {}) {
  const tagL = document.createElement('span');
  tagL.className = 'swipe-tag swipe-tag-left';
  tagL.textContent = leftTag;
  const tagR = document.createElement('span');
  tagR.className = 'swipe-tag swipe-tag-right';
  tagR.textContent = rightTag;
  card.append(tagL, tagR);

  let startX = 0;
  let startY = 0;
  let dx = 0;
  let tracking = false;
  let dragging = false;
  let suppressClick = false;
  let done = false;

  // 拖曳後放開不應觸發卡片內按鈕的 click
  card.addEventListener('click', (e) => {
    if (suppressClick) {
      suppressClick = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  card.addEventListener('pointerdown', (e) => {
    if (done || !canSwipe() || e.target.closest('button, .tap-word, input')) return;
    tracking = true;
    dragging = false;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    card.classList.remove('snap-back');
  });

  card.addEventListener('pointermove', (e) => {
    if (!tracking) return;
    dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!dragging) {
      // 垂直位移較大 → 使用者在捲動頁面，放棄本次手勢
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) { tracking = false; return; }
      if (Math.abs(dx) <= 8) return;
      dragging = true;
      try { card.setPointerCapture(e.pointerId); } catch { /* 舊瀏覽器忽略 */ }
    }
    card.style.transform = `translateX(${dx}px) rotate(${dx * 0.04}deg)`;
    const p = Math.min(1, Math.abs(dx) / THRESHOLD);
    tagL.style.opacity = dx < 0 ? p : 0;
    tagR.style.opacity = dx > 0 ? p : 0;
  });

  function end() {
    if (!tracking) return;
    tracking = false;
    if (!dragging) return;
    dragging = false;
    suppressClick = true;
    if (Math.abs(dx) >= THRESHOLD) {
      done = true; // 防止飛出動畫期間再次觸發
      const dir = dx < 0 ? -1 : 1;
      card.classList.add('fly-out');
      card.style.transform = `translateX(${dir * window.innerWidth}px) rotate(${dir * 18}deg)`;
      setTimeout(() => (dir < 0 ? onLeft : onRight)(), 240);
    } else {
      card.classList.add('snap-back');
      card.style.transform = '';
      tagL.style.opacity = 0;
      tagR.style.opacity = 0;
    }
  }
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}
