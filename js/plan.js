// 每日學習份量：打開 App 只出「今天的量」，做完可追加半日份
// 額度按「今天已完成量」計算，跨模組共用同一個追加次數
import { load, save, todayStr } from './storage.js';

const KEY = 'dailyExtra'; // { date, extra }

// 一天的基本份量 / 每次追加的半日份量
export const BASE = { vocabNew: 10, grammar: 10, listening: 3 };
export const EXTRA = { vocabNew: 5, grammar: 5, listening: 2 };

export function getExtra() {
  const d = load(KEY, null);
  return d && d.date === todayStr() ? d.extra : 0;
}

// 追加半日份（單字 +5、文法 +5、聽力 +2）
export function addExtra() {
  save(KEY, { date: todayStr(), extra: getExtra() + 1 });
}

export function quota(kind) {
  return BASE[kind] + EXTRA[kind] * getExtra();
}

// 追加按鈕的共用文案
export function extraButtonLabel() {
  return `➕ 繼續學習：追加半日份（單字 +${EXTRA.vocabNew}、文法 +${EXTRA.grammar}、聽力 +${EXTRA.listening}）`;
}
