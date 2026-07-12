// 設定模組：每日提醒（時間 + 自訂文案）與資料管理
import { load, save, remove, todayStr } from './storage.js';

const KEY = 'reminder'; // { enabled, time: "08:00", message, lastFired: "YYYY-MM-DD" }

export function getReminder() {
  return load(KEY, { enabled: false, time: '08:00', message: '通勤時間到！背 10 個單字囉 📚', lastFired: '' });
}

export function renderSettings(container) {
  const r = getReminder();
  const permission = 'Notification' in window ? Notification.permission : 'unsupported';

  container.innerHTML = `
    <h2>設定</h2>
    <div class="card">
      <h3>每日學習提醒</h3>
      <label class="switch-row">
        <span>開啟提醒</span>
        <input type="checkbox" id="reminder-enabled" ${r.enabled ? 'checked' : ''}>
      </label>
      <label class="field-label">提醒時間
        <input type="time" id="reminder-time" value="${r.time}">
      </label>
      <label class="field-label">推播文案
        <input type="text" id="reminder-message" value="${r.message.replace(/"/g, '&quot;')}" maxlength="60">
      </label>
      <button class="btn btn-primary btn-block" id="save-reminder">儲存設定</button>
      <p class="hint" id="perm-status">${permissionText(permission)}</p>
      <p class="hint">📌 目前為 PWA 版本：App 或瀏覽器開啟時會準時提醒；完全關閉時的推播需等日後串接伺服器推播服務。</p>
    </div>
    <div class="card">
      <h3>資料管理</h3>
      <button class="btn btn-danger btn-block" id="reset-data">清除所有學習紀錄</button>
    </div>`;

  container.querySelector('#save-reminder').addEventListener('click', async () => {
    const enabled = container.querySelector('#reminder-enabled').checked;
    const time = container.querySelector('#reminder-time').value || '08:00';
    const message = container.querySelector('#reminder-message').value.trim() || '該學英文囉！';

    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    save(KEY, { ...getReminder(), enabled, time, message });
    container.querySelector('#perm-status').textContent =
      permissionText('Notification' in window ? Notification.permission : 'unsupported') + '　✅ 已儲存';
  });

  container.querySelector('#reset-data').addEventListener('click', () => {
    if (confirm('確定要清除所有單字進度與學習紀錄嗎？此動作無法復原。')) {
      remove('srs');
      remove('activity');
      remove('grammarSeen');
      remove('listeningDone');
      remove('dailyExtra');
      alert('已清除學習紀錄。');
    }
  });
}

function permissionText(p) {
  switch (p) {
    case 'granted': return '🔔 通知權限：已允許';
    case 'denied': return '🔕 通知權限：已被封鎖（請到瀏覽器網站設定重新開啟）';
    case 'default': return '🔔 通知權限：尚未授權（開啟提醒並儲存時會詢問）';
    default: return '⚠️ 此瀏覽器不支援通知';
  }
}

// 每分鐘檢查一次是否到了提醒時間（App 開啟期間有效）
export function startReminderLoop() {
  const check = async () => {
    const r = getReminder();
    if (!r.enabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = new Date();
    const [hh, mm] = r.time.split(':').map(Number);
    const today = todayStr();
    const passed = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);

    if (passed && r.lastFired !== today) {
      save(KEY, { ...r, lastFired: today });
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg) {
          reg.showNotification('多益行動學習助手', { body: r.message, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' });
        } else {
          new Notification('多益行動學習助手', { body: r.message });
        }
      } catch {
        /* 通知失敗不影響 App 運作 */
      }
    }
  };
  check();
  setInterval(check, 60 * 1000);
}
