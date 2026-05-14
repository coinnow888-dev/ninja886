# 人脈手札 (Fortune-based CRM)

結合東西方命理的個人人脈管理 web app。單檔 HTML，無外部依賴，瀏覽器 IndexedDB 儲存。

## 核心檔案

| 路徑 | 用途 |
|---|---|
| `index.html` | **部署用** — Cloudflare 從根目錄提供服務的檔案。所有 commit 都必須讓這個檔保持最新 |
| `人脈手札-v3.html` | 與 `index.html` 內容相同的版本歸檔副本（v1/v2 是早期版本，唯讀） |
| `deploy/*.md` | 部署 & 持續優化的指南文件（給使用者本人看的） |
| `待辦清單.md` | 工作清單，做完一項就勾起來，新功能寫進「💡 想做」段 |
| `.claude/agents/*.md` | Claude Code 子代理定義（fortune-engine、ui-designer、deployer、reviewer、product-manager） |

## 部署架構

- **GitHub repo**: `coinnow888-dev/ninja886`
- **Hosting**: Cloudflare **Workers + 靜態資源**（不是 Pages，雖然 `deploy/GitHub-版本管理設定.md` 寫的是 Pages）
- **Live URL**: https://ninja886.coinnow888.workers.dev/
- **觸發**: `git push origin main` → 30 秒後自動更新；強制刷新瀏覽器用 `Cmd+Shift+R`

注意：`cloudflare/workers-autoconfig` 分支是 Cloudflare 自動建立的設定分支，不要動。

## 不可違反的約束

1. **單檔 HTML，無外部依賴** — 全部 CSS/JS inline 在 `index.html` 裡。不要拆檔、不要引外部框架。Google Fonts 是唯一例外。
2. **`index.html` 與 `人脈手札-v3.html` 必須同步** — 每次改完，最後一步是 `cp index.html 人脈手札-v3.html`。
3. **資料只存 IndexedDB（瀏覽器端）** — 不發到任何伺服器。例外：使用者自填的 API Key 用於 OCR 時會送 Anthropic。
4. **新增/修改命理算法時，必須驗證已存在的人脈資料還能正常顯示** — 不要破壞欄位結構，新增欄位用 optional。

## 開發工作流

```
改 index.html → 在本地瀏覽器或 Preview MCP 測試 →
cp index.html 人脈手札-v3.html → git add → git commit (中文 message) → git push
```

### Commit Message 風格

中文，敘述「為什麼」勝於「改了什麼」。範例：
- ✓ `修正：切到西方時不會自動轉成星座分析`
- ✓ `新增：八字 + 數字易經可同時顯示`
- ✗ `update`、`fix bug`

### Preview MCP 測試特殊細節

macOS Darwin 25.2 上 Preview MCP 的子程序在沙箱裡：
- 無法讀取 `/Users/kuanyenho/...`
- 用 `/usr/bin/ruby -run -e httpd /tmp/renmai-preview ...`，先把 `index.html` 複製到 `/tmp/renmai-preview/`
- 詳見 `.claude/launch.json`

## 程式碼結構（index.html 內）

```
<head>
  <style>
    /* CSS variables — 主題切換用 */
    :root { --bg, --fg, --accent, ... }
    [data-theme="east"] { ... }   /* 東方主題顏色 */
    [data-theme="west"] { ... }   /* 西方主題顏色 */

    /* Component CSS（mobile-first） */
    .onboarding, .app, .page, .contact-item, .sheet, ...

    /* 響應式斷點 */
    @media (min-width: 768px) and (max-width: 1023px) { ... }  /* tablet */
    @media (min-width: 1024px) { ... }                          /* desktop master-detail */
  </style>
</head>
<body>
  <div class="onboarding">...</div>     <!-- 首次選東/西 -->
  <div class="app">
    <div class="app-header">...</div>
    <div class="app-content">
      <div class="page" id="pageContacts">...</div>
      <div class="page" id="pageDetail"></div>
      <div class="page" id="pageSettings">...</div>
    </div>
  </div>
  <div class="tab-bar">...</div>        <!-- 桌機變左側欄 -->
  <button class="fab">+</button>
  <!-- sheets: addSheet, selfSheet, ... -->
  <script>
    // 命理引擎（東方）：八字、十神、五行、節氣
    function calcBazi() { ... }
    function calcWuxing() { ... }
    // 命理引擎（西方）：星座、相位、元素
    function calcZodiac() { ... }
    // 數字易經
    function calcYijing() { ... }
    // 合作分析（雙向）
    function calcCooperation() { ... }
    // IndexedDB
    function openDB() { ... }
    async function dbGet/dbPut/dbGetAll/dbClear()
    // App state
    const APP = { theme, contacts, self, editingId, filter, ... }
    // UI
    function renderList() { ... }
    function showDetail(id) { ... }
    function switchTab(name) { ... }
    function applyTheme(t) { ... }
  </script>
</body>
```

## 響應式佈局

| 寬度 | 佈局 |
|---|---|
| `<768px` | 手機：垂直堆疊，底部 tab bar，FAB 右下 |
| `768-1023px` | 平板：內容置中 720px，其他同手機 |
| `≥1024px` | 桌機 **master-detail**：左 220px 側邊欄 + 中 380px 人脈列表 + 右側剩餘空間詳情面板 |

桌機 sheet 從底部上滑改成置中對話框（CSS only，JS 不變）。

## 子代理（.claude/agents/）

需要修改命理算法 → `fortune-engine`
需要改 CSS / 佈局 → `ui-designer`
要發版 / 處理 git → `deployer`
寫完功能要 review → `reviewer`
排優先順序 / 規劃功能 → `product-manager`

可以用 `Agent` 工具呼叫，或在對話中問「找 fortune-engine 看看這段」。
