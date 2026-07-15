// Service Worker：離線快取（App Shell + 內容資料）
const CACHE = 'tla-v32';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/storage.js',
  './js/srs.js',
  './js/streak.js',
  './js/speech.js',
  './js/scenes.js',
  './js/vocab.js',
  './js/grammar.js',
  './js/listening.js',
  './js/settings.js',
  './js/exam.js',
  './js/plan.js',
  './js/dict.js',
  './js/util.js',
  './js/tapword.js',
  './js/history.js',
  './js/sound.js',
  './js/swipe.js',
  './js/stats.js',
  './data/vocab.json',
  './data/grammar.json',
  './data/listening.json',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// 新版啟用：清掉舊快取、接管所有分頁並強制重新載入，使用者不必手動清 Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((list) => Promise.all(list.map((client) => client.navigate(client.url).catch(() => {}))))
  );
});

// 網路優先、失敗才用快取：開發期改檔案能立刻看到更新，離線時仍可完整使用
// cache: 'no-cache' 強制向伺服器確認檔案是否更新，避免瀏覽器 HTTP 快取吐舊檔
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// 點擊通知 → 開啟或聚焦 App
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow('./');
    })
  );
});
