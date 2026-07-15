# TOEIC 行動學習助手 — UI 優化交接說明

純前端 PWA,無框架、無建置步驟。用本機伺服器開啟(如 `python -m http.server 8000`),不能直接雙擊 index.html。

## 結構

- `index.html` — 唯一頁面:header + `#view` 容器 + 底部 tab bar
- `css/style.css` — 全部樣式(CSS variables 定義在 `:root`)
- `js/app.js` — 路由(hash)與首頁(hero 卡、今日任務、7 天長條圖、歷史回顧、考試模式入口)
- `js/vocab.js` / `grammar.js` / `listening.js` / `exam.js` / `settings.js` — 各分頁 render 函式,均以 `container.innerHTML` 產生畫面
- `js/scenes.js` — 聽力 Part 1 的場景 SVG 插圖
- `data/*.json` — 題庫資料
- `sw.js` — Service Worker(改動任何檔案清單需同步 ASSETS;改版請 bump CACHE 版本)

## UI 優化時的約束

1. **不要動商業邏輯**:各 js 檔的資料流、localStorage key、SRS 演算法保持不變;優化重點是 CSS 與 HTML 結構
2. HTML 由 JS template string 產生,改 class 名稱時記得 JS/CSS 兩邊同步
3. 行動優先:主要在手機上使用,已有 `viewport-fit=cover` 與底部 tab bar
4. 語音按鈕(🔊)、點字查詢(`.tap-word` / `.word-pop`)是核心互動,不可移除
5. 若新增 js/css 檔案,必須加進 `sw.js` 的 ASSETS 並 bump CACHE 版本
