# Task: 清理 detail 頁「返回」按鈕（dead code on desktop）

> 開始日：2026-05-15
> 發起：user（透過 main assistant）
> 路由：team-lead
> 目前狀態：active

---

## task spec

**使用者原話**（節錄）：
> 清理 detail 頁的 `detail-actions` 那個「返回」按鈕（`onclick="switchTab('contacts')"`）。桌機（>=1024px）已經用 CSS 隱藏，但按鈕本身還存在 DOM。這是 UX 提案 X.4 + 過去 commit 留下的潛在 dead code。

**Acceptance criteria**：
- 桌機（≥1024px）看不到「返回」按鈕（既有 CSS 已做到，可保留亦可刪）
- 手機（<1024px）仍然看得到、點下去仍正確切回 contacts 列表
- 不留純粹給「桌機隱藏」用的 CSS hack（如可乾淨刪掉，請刪）
- 不影響其他既有功能（contact list / detail / sheet / FAB / tab bar）

**現況線索**（已調查）：
- `index.html:2526` — `showDetail` 函式 HTML 拼接「返回」按鈕：
  `<button class="btn btn-secondary" onclick="switchTab('contacts')">返回</button>`
- `index.html:1153-1155` — 桌機（≥1024px）內 CSS hack 強制隱藏該按鈕
- `index.html:1310` — tab bar 的「人脈」tab button（同樣 `switchTab('contacts')`，**勿動**）
- `index.html:2674` — `deleteEntry` 結束後 `switchTab('contacts')`（**勿動**）

**拆出來的工作項**：
1. 在 `showDetail` 模板字串裡，依視窗寬度條件渲染「返回」按鈕：
   - 簡單做法：用 `window.matchMedia('(max-width: 1023px)').matches` 判斷
   - 或：用 CSS 隱藏即可（既有方案）但**改成放在 component-level、不算 hack**
2. 若採「JS 條件渲染」路線，可刪掉 1153-1155 那段 CSS hack
3. 若採「CSS only」路線，把 selector 改寫得更乾淨（例如用 `.detail-actions .btn-back` 類別、避免靠 `[onclick*=...]` attribute selector）—— 屬於 refactor 而非 hack
4. 跑既有同步：`cp index.html 人脈手札-v3.html`（由 deployer 確保）

**路由計畫**：ui-designer → reviewer → deployer

**Next**: ui-designer

**For ui-designer**：
- 讀本檔 task spec
- 採你判斷最乾淨的路線（建議：給「返回」按鈕加 `.btn-back` class，CSS 規則改用 class selector 而非 attribute selector；屬於 refactor 不算 hack；或乾脆改成 JS 條件渲染、CSS 刪掉）
- **不要**動 1310 / 2674 那兩處 `switchTab('contacts')`
- 桌機 1280 + 手機 375 都檢查一遍（refresh detail 頁）
- Append `## ui-designer — DONE` section
- Next: reviewer

---

## ui-designer — DONE
**Updated**: 2026-05-15
**Files changed**: index.html（CSS −4 行 / JS +4 行，淨變動接近 0）+ 人脈手札-v3.html 同步
**Tasks done**:
- 刪除 1153-1155 的 CSS attribute-selector hack（`.page#pageDetail .detail-actions button.btn-secondary[onclick*="switchTab"] { display: none; }`）
- 把 `showDetail` 模板的「返回」按鈕改成 JS 條件渲染：用 `matchMedia('(max-width: 1023px)').matches` 判斷，桌機完全不 emit 該 button DOM
- 保留 tab bar L1305、`deleteEntry` L2673 兩處未動的 `switchTab('contacts')`（這兩個是必要功能）
- `cp index.html 人脈手札-v3.html` 同步完成，`diff -q` 確認一致

**為什麼選 JS 條件渲染而非 class refactor**：
- 既有 code 已有先例（L2528 `_isDesktop = matchMedia('(min-width: 1024px)').matches`），延用同模式
- 桌機完全沒 DOM > CSS display:none 更乾淨（沒 dead button）
- trade-off：viewport resize 後不會即時切，但 detail 任何 action（編輯/移除）會 re-render

**Tests run（Preview MCP）**:
- 手機 375×812：detail-actions 渲染出 3 顆 button（移除 / 返回 / 編輯）✓
- 桌機 1280×800：detail-actions 渲染 2 顆 button（移除 / 編輯），無「返回」✓
- `matchMedia` 結果與按鈕數量對應，DOM eval 確認

**Known limits**:
- viewport resize 跨斷點時，已渲染的 detail 不會即時加/減「返回」按鈕；下次 re-render 才會更新（與既有 _isDesktop 同樣模式，可接受）

**Next**: reviewer
**For reviewer**: index.html 約 ±4 行改動（CSS hack 刪除 + JS 條件渲染）。請檢查：
- 沒有引入新外部依賴
- 沒破壞 east/west 主題（這次 0 顏色變動）
- v3 同步狀態 OK
- 手機/桌機回歸都過（ui-designer 已用 Preview MCP 驗證）

---

## reviewer — PASS
**Updated**: 2026-05-15
**Diff scope**: index.html +5/-6（淨 -1 行）、人脈手札-v3.html 同步
**Blockers**: 0
**Warnings**: 0

**檢查清單結果**:
1. ✅ 單檔架構：未引入新 CDN / framework；Cloudflare beacon 與 Anthropic console link 為既有，非本次新增
2. ✅ 部署檔同步：`diff -q index.html 人脈手札-v3.html` 空
3. ✅ 東/西主題：0 顏色變動、無寫死色；fortune.method 不受影響
4. ✅ 響應式：CSS 規則刪除（master-detail 區塊 1153-1155）、JS 用 matchMedia 條件渲染；手機 (375) 顯示 3 按鈕、桌機 (1280) 顯示 2 按鈕，符合 acceptance criteria
5. ✅ 命理算法：0 算法改動，回歸測試 N/A
6. ✅ 安全：`_backBtn` 為 hard-coded template literal、無 user input；無 eval / new Function；無新 innerHTML 注入點（沿用既有 `$('pageDetail').innerHTML=html` 模式，內容皆走 `esc()`）
7. ✅ Performance：0 新 timer / setInterval；matchMedia 為一次性同步呼叫

**Other notes**:
- 與 L2528 既有 `_isDesktop = matchMedia('(min-width: 1024px)').matches` 模式一致，code style 統一
- L2673 `deleteEntry` 內的 `switchTab('contacts')` 在桌機 master-detail 下會切回列表頁 — 邊緣 case 但既有行為，本次不擴大 scope

**Next**: deployer
**For deployer**: commit message 建議「清理 detail 頁桌機殘留的『返回』按鈕：CSS hack 刪除、改 JS 條件渲染」。Push 後驗證 live 大小與本地一致。

---

## deployer — LIVE
**Updated**: 2026-05-15
**Commits**: 0727dc8「清理 detail 頁桌機殘留的『返回』按鈕：CSS hack 刪除、改 JS 條件渲染」
**Live URL**: https://ninja886.coinnow888.workers.dev/
**Verification**:
- HTTP 200 ✓
- Size match deployed=159940 local=159940 ✓
- CSS hack `detail-actions button.btn-secondary[onclick*=...]` 0 occurrences on live ✓（成功刪除）
- 「返回」字串 live 仍有 3 處（detail page 動態渲染、tab bar「人脈」label、其他保留位）— 預期
**Next**: team-lead

---

## team-lead — CLOSED
**Updated**: 2026-05-15
**Summary for user**:
- ui-designer 改 JS 條件渲染 + 刪掉 CSS hack（net +5/-6 = -1 行）
- reviewer 0 blockers / 0 warnings PASS
- deployer commit `0727dc8`、live 部署驗證通過
**Archive moved to**: .claude/team/archive/2026-05-15-cleanup-detail-back-btn.md
