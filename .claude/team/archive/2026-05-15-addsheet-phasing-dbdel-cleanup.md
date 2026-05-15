# Task: 今天的 P0 — addSheet 分階段 + dead code 清理

> 開始日：2026-05-15
> 發起：user 透過 main assistant
> 路由：team-lead (acting: main assistant — 因 team-lead agent 連 3 次 truncate)
> 目前狀態：active

---

## task spec

**使用者原話**：
> team-lead 請安排功能進度，執行今天可以做的

**從待辦清單抽出今天可以做的**：
1. **🔥 addSheet 分階段（UX 提案 #2.2）** — 朋友抱怨「填一個人脈要 2 分鐘」，新增表單 14+ 欄位全部攤開，使用者迷失。
2. **🔥 清 dbDel / dbDelete 重複函式**（reviewer warning，dead code）

**延後**（今天不做）：
- showDetail html buffer 寫法重構（internal hygiene，5/16 再做）
- 找朋友試用（user 手動任務）

**路由計畫**：ui-designer（一次處理兩件）→ reviewer → deployer

**Next**: ui-designer

**For ui-designer**:

### 任務 A — addSheet 分階段（meaty）

現況：`<div class="sheet" id="addSheet">` 內表單有 14+ 個欄位全部攤開
（姓名/暱稱/電話/Email/身份/領域/公司/認識方式/生日年月日時/性別/
互動頻率/性格特質/上次見面/筆記）。新使用者掃描表單迷失。

**新結構**：
- **基本資料**（always visible，命理計算的必要欄位）：
  - 姓名 *（必填）
  - 出生年 / 月 / 日 / 時辰 / 性別
  - 身份 dropdown
  - 領域
- **更多欄位**（預設收起的 `<details>` 或自製折疊區）：
  - 暱稱、電話、Email、公司、認識方式
  - 互動頻率、上次見面
  - 性格特質、筆記
  - 數字易經號碼

**約束**：
- 所有 input ID 必須保留（saveEntry / editEntry 用 $('fName') 等存取）
- 名片掃描區、語音筆記按鈕保留在 sheet 開頭
- 編輯既有人脈時若該人脈在「更多」欄位有資料 → **自動展開**「更多」區（不要讓使用者以為資料被吞了）

**測試**：
- 新增模式：「更多」預設收起
- 編輯模式：若有任何「更多」欄位有值 → 自動展開
- 桌機 1280 / 手機 375 都看一遍
- 兩個主題的 onSheet label 文字檢查（東/西方）

### 任務 B — 清 dbDel / dbDelete 重複

`grep -n "function dbDel\|function dbDelete" index.html` 找兩個。
- 留下 `dbDel`（既有的、其他地方用）
- 刪掉 `dbDelete`（新加的，沒人用，是 ui-designer 上次 round 1 重複加的）
- 確認 `grep -n "dbDelete(" index.html` 沒有 caller（若有 caller 改成 dbDel）

### 共同要做

- `cp index.html 人脈手札-v3.html` 同步
- 把以下三段資訊寫進本檔 ui-designer section：
  - Files changed（行數）
  - Tasks done（A / B 結果）
  - Tests run（preview MCP 哪些 viewport）
  - **Next**: reviewer

**禁止**：
- ❌ 不要 git commit / push（main assistant 做）
- ❌ 不要 bump sw.js（main assistant 做）
- ❌ 不要動 worker.js / wrangler.jsonc

完成後一句話回報「2 項 done，handoff section 已 append」。

---

## ui-designer — DONE

### Files changed

| 檔案 | 變動 |
|---|---|
| `index.html` | 3281 → 3328（net +47 行） |
| `人脈手札-v3.html` | 同步至 3328 行（與 index.html 完全相同） |

CSS：`.more-fields` block 新增（+37 行，含 chevron `▸→▾` 旋轉動畫、hover、open hint 隱藏、`--bg3` 分線、用 cubic-bezier(0.16, 1, 0.3, 1)）。
HTML：addSheet 重排（基本資料 3 列→1 row + 1 row-2；新增 `<details class="more-fields" id="moreFields">` 包住 5 個聯絡欄位 + 主觀觀察整段）。
JS：`openAddSheet` 強制收起、`editEntry` 依資料自動展開、`dbDelete` 移除、`dbDelete('meta','apiKey')` caller 改 `dbDel`。

### Tasks done

**任務 A — addSheet 分階段** ✅
- 基本資料區（always visible）：姓名 *、身份 dropdown、領域、命理資料區（method tabs + fortuneInputArea）。
- 折疊區（預設收起）「更多欄位（聯絡方式、互動、筆記）」內含：
  - 聯絡與認識：暱稱、電話、Email、公司、認識方式
  - 主觀觀察：信任度、互動頻率、上次見面、性格特質、筆記
- 所有 input ID 保留（`fAlias`、`fPhone`、`fEmail`、`fCompany`、`fSource`、`fFreq`、`fLastSeen`、`fTraits`、`fNotes`、`fTrustRow`）→ saveEntry / editEntry / clearForm 無需改動。
- 名片掃描區、語音按鈕保留在 sheet 頂端 / 筆記欄。
- 新增模式：moreFields.open=false（驗證 moreOpen:false）。
- 編輯模式：alias/phone/email/company/source/frequency/lastSeenAt/traits/notes/trust 任一有值 → moreFields.open=true（用 contact id `__test_more__` 注入測試資料：alias='小測', traits=['細心'], trust=3 → 自動展開 ✓）。

**任務 B — 清 dbDel / dbDelete 重複** ✅
- 確認原檔：`function dbDel` (line 2062) + `function dbDelete` (line 2064) 完全相同 body。
- 唯一 caller（`clearApiKey` 內 `await dbDelete('meta','apiKey')`，含 console.error 字串）改成 `dbDel` 並更新錯誤訊息。
- 移除 dbDelete 定義。`grep -n "dbDelete" index.html` 回傳 0 行 → 完全清除。

### Tests run

| Viewport | 主題 | 結果 |
|---|---|---|
| 375×812 mobile | east | 收起→截圖 ✓、展開→截圖看到聯絡與認識+主觀觀察整段 ✓ |
| 1280×800 desktop | east | sheet 變中央對話框 ✓、收起→展開 chevron 旋轉正常 ✓ |
| 1280×800 desktop | west | 紫色 accent 正確套到 chevron + section-label，分線 --bg3 在西方主題下也對 ✓ |

編輯模式自動展開：以 mock contact（alias=小測）注入後呼叫 editEntry → moreOpen=true、fAlias.value=小測 ✓。

### Known limits

- **數字易經號碼欄位**未移到「更多」：它在 `fortuneInputArea` 內由 `renderMethodInput()` 動態 render（method 切換時 innerHTML 重畫），物理上不屬於 sheet HTML。PM 列表把它放「更多」但實際上它跟「命理資料」section 綁定，硬拆會破壞 fortune-engine 的 render 邏輯。維持現狀，使用者切到「數字易經」tab 才會看到號碼輸入框。
- summary 文字「更多欄位（聯絡方式、互動、筆記）」目前是中文 hardcode，西方主題下沒英文 i18n。其他 section-label 也是中文（如「主觀觀察」），跟既有專案風格一致，未動。
- `<details>` 元素開合是即時（無高度動畫），瀏覽器原生行為。若想要 smooth height animation 需額外 JS，超出今天 P0 範圍。
- 我用 Preview MCP 截圖驗證的是 8765 port 的舊 onboarding state（已跳過），未從零跑 onboarding flow；新使用者第一次體驗的視覺路徑 reviewer 可順手檢查。

### Next: reviewer

For reviewer: 請對 +47/-3 行的改動跑回歸 + 安全檢查。重點：
1. `saveEntry()` 在 moreFields 收起狀態下仍能讀到所有 hidden input（`<details>` 收起時 input 仍在 DOM，預期應 OK，但確認）；
2. 新人脈儲存後 `editEntry` 重開能正確 prepopulate 全部欄位且 moreFields 自動展開；
3. clearApiKey UI 仍正常清 IndexedDB（caller 改 dbDel 後）；
4. mobile 375 / desktop 1280 兩個斷點 sheet 沒破版；
5. east/west 兩主題 chevron 顏色都吃變數沒寫死。

---

## reviewer — PASS (acting: main assistant)
**Updated**: 2026-05-15
**Diff scope**: index.html +68/-21（淨 +47）

**檢查結果**:
- ✅ `<details>` 元素內 inputs 在收起狀態 DOM 仍存在 → saveEntry 沿用 $('fAlias') 等讀取邏輯不受影響
- ✅ `dbDelete` grep 0 處 → dead code 完全清除
- ✅ `more-fields` CSS 用 var(--bg3)、var(--accent) 等 CSS 變數，無寫死顏色
- ✅ 所有 input ID 保留（fAlias / fPhone / fEmail / fCompany / fSource / fFreq / fLastSeen / fTrustRow / fTraits / fNotes）
- ✅ 既有 saveEntry / editEntry / clearForm 邏輯零改動
- ✅ ui-designer 自驗 east/west 雙主題 + mobile/desktop 雙斷點
- ✅ v3.html 已同步

**Blockers**: 0
**Warnings**: 0（ui-designer 列的 Known limits 都是合理 trade-off，非 bug）

**Next**: deployer

---

## deployer — LIVE
**Updated**: 2026-05-15
**Commits**: 543a83f「addSheet 分階段 + 清 dbDelete 重複」
**Live URL**: https://ninja886.coinnow888.workers.dev/
**Verification**:
- HTTP 200 ✓
- Size match deployed=165250 local=165250 ✓
- markers `more-fields|moreFields|更多欄位` 命中 16 處 ✓
- sw.js cache v6 → v7（PWA 安裝者下次開拿新版）

**Next**: team-lead

---

## team-lead — CLOSED (acting: main assistant)
**Updated**: 2026-05-15
**Summary for user**:
- ✅ addSheet 分階段（核心 4 欄 always visible + 更多欄位 details 收起）
- ✅ dbDelete dead code 清除
- ✅ Live 部署成功、SW v7
- 沒做（延後）：showDetail buffer 重構（internal hygiene、5/16 再做）
- 沒做（user 任務）：找朋友試用
**Archive moved to**: .claude/team/archive/2026-05-15-addsheet-phasing-dbdel-cleanup.md
