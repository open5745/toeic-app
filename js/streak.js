// 連續學習天數與每日活動量統計
import { load, save, todayStr } from './storage.js';

const KEY = 'activity'; // { "2026-07-11": { vocab: 5, grammar: 2, listening: 1 }, ... }

export function recordActivity(kind, count = 1) {
  const activity = load(KEY, {});
  const today = todayStr();
  if (!activity[today]) activity[today] = {};
  activity[today][kind] = (activity[today][kind] || 0) + count;
  save(KEY, activity);
}

export function getActivity() {
  return load(KEY, {});
}

function dateOffset(base, offsetDays) {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + offsetDays);
  return todayStr(d);
}

function dayTotal(activity, dateStr) {
  const day = activity[dateStr];
  if (!day) return 0;
  return Object.values(day).reduce((a, b) => a + b, 0);
}

// 連續學習天數：從今天（或昨天）往回數有活動的天數
export function currentStreak(activity = getActivity(), today = todayStr()) {
  let start = today;
  if (dayTotal(activity, today) === 0) {
    // 今天還沒學不中斷 streak，從昨天開始算
    start = dateOffset(today, -1);
    if (dayTotal(activity, start) === 0) return 0;
  }
  let streak = 0;
  let cursor = start;
  while (dayTotal(activity, cursor) > 0) {
    streak += 1;
    cursor = dateOffset(cursor, -1);
  }
  return streak;
}

// 今天某類活動已完成的次數（用於每日份量檢查）
export function todayCount(kind) {
  const day = getActivity()[todayStr()];
  return day ? day[kind] || 0 : 0;
}

// 最近 N 天每日總量，用於進度長條圖（由舊到新）
export function recentDays(n = 7, activity = getActivity(), today = todayStr()) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = dateOffset(today, -i);
    days.push({ date, total: dayTotal(activity, date) });
  }
  return days;
}
