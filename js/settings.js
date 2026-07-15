// 設定模組：每日提醒（時間 + 自訂文案）與資料管理
import { load, save, remove, todayStr, exportAll, importAll } from './storage.js';

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
      <h3>資料備份</h3>
      <p class="hint">進度存在這台裝置的瀏覽器裡，清瀏覽器資料會遺失。建議定期匯出備份，換裝置時匯入即可還原。</p>
      <button class="btn btn-block" id="export-data">📤 匯出備份檔</button>
      <button class="btn btn-block" id="import-data" style="margin-top:8px">📥 匯入備份檔</button>
      <input type="file" id="import-file" accept=".json,application/json" class="hidden">
      <p class="hint hidden" id="backup-status"></p>
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
    // 若設定的時間今天已過，跳過今天的提醒，避免一儲存就立刻跳通知
    const [hh, mm] = time.split(':').map(Number);
    const now = new Date();
    const passedToday = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
    const prev = getReminder();
    const lastFired = enabled && passedToday ? todayStr() : prev.lastFired;
    save(KEY, { ...prev, enabled, time, message, lastFired });
    container.querySelector('#perm-status').textContent =
      permissionText('Notification' in window ? Notification.permission : 'unsupported') + '　✅ 已儲存';
  });

  // 匯出：把所有進度打包成 JSON 檔下載
  container.querySelector('#export-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toeic-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const status = container.querySelector('#backup-status');
    status.classList.remove('hidden');
    status.textContent = '✅ 備份檔已下載，請妥善保存。';
  });

  // 匯入：選檔 → 確認覆蓋 → 還原並重新載入
  container.querySelector('#import-data').addEventListener('click', () => {
    container.querySelector('#import-file').click();
  });
  container.querySelector('#import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // 允許重選同一個檔案
    const status = container.querySelector('#backup-status');
    status.classList.remove('hidden');
    let backup;
    try {
      backup = JSON.parse(await file.text());
    } catch {
      status.textContent = '❌ 檔案不是有效的 JSON，請確認選對備份檔。';
      return;
    }
    if (!backup || backup.app !== 'tla') {
      status.textContent = '❌ 這不是本 App 的備份檔。';
      return;
    }
    const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString() : '未知時間';
    if (!confirm(`確定要匯入 ${when} 的備份嗎？\n目前這台裝置上的進度會被覆蓋。`)) return;
    if (importAll(backup)) {
      alert('匯入完成，將重新載入 App。');
      location.reload();
    } else {
      status.textContent = '❌ 匯入失敗，備份檔格式不正確。';
    }
  });

  container.querySelector('#reset-data').addEventListener('click', () => {
    if (confirm('確定要清除所有單字進度與學習紀錄嗎？此動作無法復原。')) {
      remove('srs');
      remove('activity');
      remove('grammarSeen');
      remove('listeningDone');
      remove('dailyExtra');
      remove('history');
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
