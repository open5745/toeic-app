// localStorage 包裝：所有 key 加上前綴，集中管理
const PREFIX = 'tla:';

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

// 匯出所有學習資料（給備份檔用）
export function exportAll() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k.startsWith(PREFIX)) continue;
    try {
      data[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k));
    } catch { /* 壞掉的值跳過 */ }
  }
  return { app: 'tla', version: 1, exportedAt: new Date().toISOString(), data };
}

// 匯入備份檔內容，覆蓋現有進度。格式不對回傳 false
export function importAll(backup) {
  if (!backup || backup.app !== 'tla' || typeof backup.data !== 'object' || backup.data === null) return false;
  for (const [k, v] of Object.entries(backup.data)) save(k, v);
  return true;
}

// 今天的日期字串（本地時區），格式 YYYY-MM-DD
export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
