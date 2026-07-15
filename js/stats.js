// 學習統計：30 天趨勢面積圖與摘要（純 SVG，零依賴）
import { recentDays, getActivity } from './streak.js';
import { todayStr } from './storage.js';

const KIND_LABELS = [
  { kind: 'vocab', name: '單字', color: '#8b5cf6' },
  { kind: 'grammar', name: '文法', color: '#f59e0b' },
  { kind: 'listening', name: '聽力', color: '#14b8a6' },
];

// 最近 n 天各類活動總量
function kindTotals(n = 30) {
  const activity = getActivity();
  const dates = recentDays(n, activity).map((d) => d.date);
  const totals = { vocab: 0, grammar: 0, listening: 0 };
  for (const date of dates) {
    const day = activity[date];
    if (!day) continue;
    for (const k of Object.keys(totals)) totals[k] += day[k] || 0;
  }
  return totals;
}

// 30 天趨勢面積圖 SVG 字串
export function trendSvg(n = 30) {
  const days = recentDays(n);
  const W = 320;
  const H = 110;
  const PAD_X = 8;
  const PAD_TOP = 12;
  const PAD_BOT = 8;
  const max = Math.max(1, ...days.map((d) => d.total));

  const pts = days.map((d, i) => {
    const x = PAD_X + (i / (days.length - 1)) * (W - PAD_X * 2);
    const y = H - PAD_BOT - (d.total / max) * (H - PAD_TOP - PAD_BOT);
    return [x, y];
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - PAD_BOT} L${pts[0][0].toFixed(1)},${H - PAD_BOT} Z`;
  const [tx, ty] = pts[pts.length - 1];

  return `
    <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="最近 ${n} 天學習量趨勢">
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#84a59d" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#84a59d" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#trend-fill)"/>
      <path d="${line}" fill="none" stroke="#6b8c84" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="4" fill="#6b8c84" stroke="var(--surface)" stroke-width="2"/>
    </svg>`;
}

// 30 天摘要：總量、日均、最佳日、有學習的天數 + 各類佔比條
export function summaryHtml(n = 30) {
  const days = recentDays(n);
  const total = days.reduce((a, d) => a + d.total, 0);
  const activeDays = days.filter((d) => d.total > 0).length;
  const avg = activeDays ? Math.round(total / activeDays) : 0;
  const best = days.reduce((a, d) => (d.total > a.total ? d : a), days[0]);
  const bestLabel = best.total > 0
    ? (best.date === todayStr() ? '今天' : `${Number(best.date.slice(5, 7))}/${Number(best.date.slice(8, 10))}`)
    : '—';

  const totals = kindTotals(n);
  const kindSum = Math.max(1, totals.vocab + totals.grammar + totals.listening);
  const segments = KIND_LABELS
    .filter((k) => totals[k.kind] > 0)
    .map((k) => `<span style="display:block; height:100%; width:${(totals[k.kind] / kindSum) * 100}%; background:${k.color}"></span>`)
    .join('');
  const legend = KIND_LABELS
    .map((k) => `<span class="trend-legend-item"><span class="trend-dot" style="background:${k.color}"></span>${k.name} ${totals[k.kind]}</span>`)
    .join('');

  return `
    <div class="trend-stats">
      <div class="trend-stat"><b>${total}</b><span>30天總量</span></div>
      <div class="trend-stat"><b>${avg}</b><span>學習日平均</span></div>
      <div class="trend-stat"><b>${best.total}</b><span>最佳（${bestLabel}）</span></div>
      <div class="trend-stat"><b>${activeDays}</b><span>有學習天數</span></div>
    </div>
    ${total > 0 ? `
    <div class="trend-mix">${segments}</div>
    <div class="trend-legend">${legend}</div>` : '<p class="hint" style="margin:8px 0 0">開始學習後，這裡會顯示 30 天趨勢。</p>'}`;
}
