// 歷史回顧：記錄每次練習到的英文（單字 / 文法例句 / 聽力句子），首頁由新到舊條列
import { load, save } from './storage.js';

const KEY = 'history'; // [{ t, kind, id, text, zh }] 新的在前
const MAX = 100;

// 記一筆練習紀錄；同一題重複練習時移除舊紀錄、只留最新
export function recordHistory(kind, id, text, zh) {
  const list = load(KEY, []).filter((e) => !(e.kind === kind && e.id === id));
  list.unshift({ t: Date.now(), kind, id, text, zh });
  save(KEY, list.slice(0, MAX));
}

export function getHistory() {
  return load(KEY, []);
}
