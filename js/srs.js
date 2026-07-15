// 間隔重複系統（簡化版 SM-2）
// 卡片狀態：{ ease, intervalDays, due, reps, lapses }
// 評分：0 = 忘記(Again)、1 = 困難(Hard)、2 = 記得(Good)、3 = 簡單(Easy)

import { todayStr } from './storage.js';

export const GRADE = { AGAIN: 0, HARD: 1, GOOD: 2, EASY: 3 };

export function newCardState() {
  return { ease: 2.5, intervalDays: 0, due: todayStr(), reps: 0, lapses: 0 };
}

// 依評分計算下一次複習狀態（純函式，不碰儲存）
export function review(state, grade, now = new Date()) {
  const s = { ...state };
  s.reps += 1;

  if (grade === GRADE.AGAIN) {
    s.lapses += 1;
    s.ease = Math.max(1.3, s.ease - 0.2);
    s.intervalDays = 0; // 今天之內再出現
  } else if (s.intervalDays === 0) {
    // 學習階段第一次答對
    s.intervalDays = grade === GRADE.EASY ? 4 : 1;
    if (grade === GRADE.HARD) s.ease = Math.max(1.3, s.ease - 0.15);
    if (grade === GRADE.EASY) s.ease += 0.15;
  } else {
    // 複習階段
    if (grade === GRADE.HARD) {
      s.ease = Math.max(1.3, s.ease - 0.15);
      s.intervalDays = Math.max(1, Math.round(s.intervalDays * 1.2));
    } else if (grade === GRADE.GOOD) {
      s.intervalDays = Math.max(1, Math.round(s.intervalDays * s.ease));
    } else {
      s.ease += 0.15;
      s.intervalDays = Math.max(1, Math.round(s.intervalDays * s.ease * 1.3));
    }
    s.intervalDays = Math.min(s.intervalDays, 365);
  }

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + s.intervalDays);
  s.due = todayStr(dueDate);
  return s;
}

// 卡片今天是否到期（due <= 今天，字串比較對 YYYY-MM-DD 有效）
export function isDue(state, today = todayStr()) {
  return state.due <= today;
}
