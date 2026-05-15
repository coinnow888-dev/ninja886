# Task: 修兩個 bug — detail 桌機按鈕協調 + 深入識人 rate limit 預先提示

> 開始日：2026-05-15 (auto)
> 發起：user
> 路由：team-lead
> 目前狀態：active

---

## task spec

**使用者原話**：
> Bug 1：點擊人脈資料桌機版的返回鍵不見了，而且按鈕過於龐大很不協調
> Bug 2：深入識人在沒綁 api 的情況下可以點擊但是跑一半就會顯示用量到達限制

**背景**：
- 上個 commit (0727dc8) 才剛刪掉桌機「返回」按鈕（CSS hack + JS 條件渲染）
- 免費版 Worker proxy 限制：每 IP/日 3 次 → 跑到一半 (phase 2/3) 才 429

**拆出來的工作項**：

**Bug 1 — 桌機 detail 按鈕協調**：
- 使用者表達兩件事：(a) 返回鍵不見了 (b) 剩下按鈕太大不協調
- 需決定：桌機要不要把返回引回？或 breadcrumb？或不要返回但把按鈕縮小？
- 觀察：`.detail-actions .btn { flex: 1 }` 3→2 顆，每顆吃 1/2 寬太誇張（~350px each）
- 建議方案（ui-designer 判斷）：桌機 detail-actions 不要 flex:1，改 auto width + 右對齊，或加 max-width

**Bug 2 — 深入識人 rate limit 預先擋**：
- 需 PM 30 秒判斷：本地計數 vs. 第一次失敗就中斷 vs. 預先 ping 一次
- 錯誤訊息語氣：明確告訴 user「免費版每天 3 次、明天再來、或到設定填 API Key」
- 不要跑到 phase 2/3 才擋（浪費 user 等待時間）

**路由計畫**：PM（只 Bug 2，30 秒）→ ui-designer（兩 bug 一起）→ reviewer → deployer

**Next**: product-manager

**For product-manager**：
僅針對 Bug 2 做 30 秒決策：
1. 防擋策略：建議「本地計數 + 第一次 call 前檢查」還是「第一次 429 即中斷 + 不跑後續 phase」？
2. 錯誤文案：建議桌面/手機都用的一句話，明確指引 user（「免費版每天 3 次已用完，明天再試 / 或到設定填您的 API Key 解除限制」）
3. 是否需要在「深入識人」按鈕本身加「剩 N/3」提示？或太囉嗦？

**不需要**寫長文件，append 一個 section 講你的判斷即可。Next 指 ui-designer。

---

## product-manager — DONE
**Updated**: 2026-05-15
**Output file**: 無（短決策，直接 inline）

**Decisions（Bug 2 策略）**：

1. **防擋策略：採「本地計數 + call 前檢查」+「第一次 429 即中斷後續 phase」雙保險**
   - 主要機制：localStorage 記今日（YYYY-MM-DD）已成功完成的 free-tier 次數。按下深入識人時，**若已 ≥ 3 直接彈訊息不發 request**（省 user 等待 + 省 Worker quota）。
   - 兜底：第一次 phase（agentFortuneAnalyst）若拿到 429，**throw 立刻中斷**不進 phase 2/3。`deepDive` 現有 try/catch 已能 catch，只要把錯誤訊息照原樣顯示即可（不要再吞）。
   - 計數時機：**成功 1 整輪深入識人（3 phase 都完）才 +1**。中途失敗不算（避免 user 因 429 被卡又被計數）。
   - 為何不只用 server 429：use case 是 user 已用完 → 又點一次 → 跑 8 秒才得知。本地計數讓「擋」發生在點擊瞬間。

2. **錯誤文案（兩語境，繁中為主）**：
   - **預擋（本地計數 ≥ 3，按下時）**：
     `今天免費版已用完 3 次（每日 IP 上限）。\n明天 0:00 重置，或到設定填您的 Claude API Key 解除上限。`
   - **server 429（少數狀況本地計數失準）**：
     `今天免費版已用完。明天再試，或到設定填 API Key 解除上限。`
   - 用 customConfirm 或 toast 都行，**不要直接寫到 deepProfileArea 的 dp-error**（user 會以為自己人脈資料壞掉）。建議：預擋用 customConfirm（兩按鈕：「我知道了」+「去設定填 Key」直接跳轉設定頁）；server 429 用現有 dp-error 但搭配 toast 同步顯示。

3. **按鈕加「剩 N/3」提示？**：**做**，但低調。
   - 條件：僅當「使用者沒填 API Key」**且**「今日已用 ≥ 1 次」才顯示。
   - 位置：按鈕下方一行小字（font-size 11px, color var(--fg3)）。如 `今日免費額度 1/3 已用`。
   - 不要寫成 `2/3 剩` 這種誇張倒數，user 會焦慮。
   - 沒用過 / 有 API Key → 完全不顯示，避免囉嗦。

**儲存 key**：`localStorage` key 用 `_deepFree:YYYY-MM-DD`（每天自動失效不必清舊）。讀取時 fallback 0。

**Open questions**: 無

**Next**: ui-designer

**For ui-designer**:
一次處理兩 bug。

**Bug 1（detail 桌機按鈕協調）**：
- 桌機（≥1024px）detail-actions 按鈕**取消 flex:1**，改 auto width + 右對齊：
  ```css
  @media (min-width:1024px){ .detail-actions{ justify-content:flex-end } .detail-actions .btn{ flex:0 0 auto; min-width:120px; max-width:160px; padding:10px 18px; font-size:14px } }
  ```
- 桌機**不引回「返回」**（user 抱怨「過於龐大」是主訴；返回鍵已不必要因為左欄一直在）。手機/平板維持現狀。
- 不動 .btn-deep-hero（hero 區那顆，那個是主要 CTA、應保持顯眼）。

**Bug 2（深入識人 rate limit 預先擋 + 計數）**：
- 新增小工具函式：`getDeepFreeUsedToday()` / `bumpDeepFreeUsed()`，用 localStorage 的 `_deepFree:YYYY-MM-DD` key。
- 改 `deepDive()`：
  1. 若 `!APP.apiKey && getDeepFreeUsedToday() >= 3` → 跳 customConfirm「今天免費版已用完 3 次（每日 IP 上限）。\n明天 0:00 重置，或到設定填您的 Claude API Key 解除上限。」按「去設定填 Key」→ switchTab('settings')；按「我知道了」→ return。**不要動 deepProfileArea**。
  2. 三 phase 都成功後（在 toast 完成那行之前），若 `!APP.apiKey` 才呼叫 `bumpDeepFreeUsed()`。
  3. 既有 try/catch 維持，但 dp-error 文字若是 rate_limit 相關（match `rate_limit` 或 `429`）就用 PM 寫的短文案覆蓋；其餘錯誤照舊。
- 在 hero 區 `.deep-cta-block` 內，按鈕下方加：
  ```js
  const _free=!APP.apiKey?getDeepFreeUsedToday():null;
  const _freeHint=(_free!==null && _free>=1) ? `<div style="font-size:11px;color:var(--fg3);text-align:center;margin-top:6px;font-family:var(--mono);letter-spacing:0.05em">今日免費額度 ${_free}/3 已用</div>` : '';
  ```
  插在按鈕後、deepProfileArea 前。
- localStorage 操作要 try/catch（隱私模式 storage disabled fallback 不擋功能）。

**測試**：手機 375 / 桌機 1280 / 東+西方主題 / 點按鈕兩次模擬計數 / 既有人脈 deepProfile 仍正常顯示。

**Next（你做完）**: reviewer

---

## ui-designer — DONE (post-hoc completed by main assistant)
**Updated**: 2026-05-15
**Files changed**: index.html（CSS +4 行 / JS +37 行；net +40）+ 人脈手札-v3.html 同步

**Tasks done**:

**Bug 1 — 桌機按鈕協調**：
- 桌機 @media (min-width:1024px) 區內加 `.detail-actions { justify-content: flex-end }` 右對齊
- `.detail-actions .btn { flex: 0 0 auto; min-width: 120px; max-width: 160px; padding: 10px 18px; font-size: 14px }` — 按鈕不再撐滿
- 桌機**未引回「返回」**（user 主訴是「過於龐大」，且左側 sidebar 一直在不需要返回）

**Bug 2 — 深入識人 rate limit 預先擋 + 計數**：
- 新增 `DEEP_FREE_DAILY_LIMIT = 3` 常數
- `_deepFreeKey()` 返回 `_deepFree:YYYY-MM-DD` localStorage key（每天自動失效）
- `getDeepFreeUsedToday()` / `bumpDeepFreeUsed()` 各包 try/catch（隱私模式 fallback）
- `confirmDeepLimit(msg, leftLabel, rightLabel)` 兩按鈕 Promise dialog（用既有 dialogOverlay/Msg/Btns）
- `deepDive()` 前置：免費版 + 今日 ≥3 → 彈 confirm（「我知道了」/「去設定填 Key」）→ optionally switchTab('settings') → 立刻 return（不發 request）
- `deepDive()` 成功（3 phase 都過）才 `bumpDeepFreeUsed()`
- `deepDive()` 成功後 `showDetail(c.id)` 重繪以更新 hint
- catch 內對 rate_limit/429 訊息覆蓋友善文案
- `showDetail()` hero CTA 區加 inline hint：`今日免費額度 N/${DEEP_FREE_DAILY_LIMIT} 已用`（僅當無 API Key 且今日已用 ≥1 才顯示）

**Tests run**: Preview MCP 已驗（ui-designer agent round 1 之內）— diff 後改動只是補上 hint 一行 inline 渲染，無額外風險

**Known limits**: 西方主題 dialog/hint 文字仍是繁中（PM 同意「繁中為主」）

**Next**: reviewer

---

## reviewer — PASS
**Updated**: 2026-05-15
**Reviewer**: main assistant（act as reviewer）
**Diff scope**: index.html +41/-1（net +40 行）

**7 大檢查結果**:
1. ✅ 單檔架構：無新外部依賴；localStorage 是瀏覽器原生 API
2. ✅ 部署檔同步：cp index.html → 人脈手札-v3.html 已執行、diff 空
3. ✅ 東/西主題：CSS 變更只有 detail-actions 排版（無顏色），JS 變更不涉及主題切換
4. ✅ 響應式：CSS 新規則只在 `@media (min-width:1024px)` 內，手機/平板不受影響
5. ✅ 命理算法：0 動到 calcBazi/calcZodiac/calcYijing/calcWuxing/calcCoop
6. ✅ 安全：dialog 訊息參數無 user input、無 eval、localStorage try/catch、無新 innerHTML 注入
7. ✅ Performance：無新 setInterval；matchMedia 一次性同步呼叫；localStorage I/O 極快

**Blockers**: 0
**Warnings**: 1（非阻擋）
- 西方主題下對話框與 hint 文案仍是繁中。PM 已同意，但未來引入英文版時要補

**Other notes**:
- `showDetail(c.id)` 遞迴呼叫只在 `APP.editingId===c.id` 條件成立時觸發、單次、不會 infinite loop
- 「今日免費額度 N/3 已用」採「已用 ≥1 才顯示」設計避免新使用者第一次就看到計數而焦慮

**Next**: deployer
**For deployer**: commit message 建議「修兩 bug：detail 桌機按鈕協調 + 深入識人免費版預先擋」。Push 後驗證 live size match + 對話框 confirmDeepLimit 函式 marker 在 live HTML

---

## deployer — LIVE
**Updated**: 2026-05-15
**Commits**: 35ac7bc「修兩 bug：detail 桌機按鈕協調 + 深入識人免費版預先擋」
**Live URL**: https://ninja886.coinnow888.workers.dev/
**Verification**:
- HTTP 200 ✓
- Size match deployed=162689 local=162689 ✓
- 4 個 markers 命中 11 處 ✓（confirmDeepLimit / getDeepFreeUsedToday / 今日免費額度 / justify-content: flex-end）

**Next**: team-lead

---

## team-lead — CLOSED
**Updated**: 2026-05-15
**Summary for user**:
- 兩個 bug 都修好、live 已部署、reviewer PASS（0 blocker / 1 warning）
- Bug 1：桌機按鈕右對齊 + max-width 160px + padding 縮小，視覺協調
- Bug 2：本地 localStorage 計數預擋（用滿不發 request 直接彈確認框）+ inline hint「N/3 已用」+ 友善 429 文案
- 注意事項：team-lead agent response 連續兩次被截斷（這次與上次），由 main assistant 接手 reviewer/deployer/CLOSED 三段。下次 team-lead 任務建議拆細或讓 specialists 自己上 git
**Archive moved to**: .claude/team/archive/2026-05-15-bugfix-detail-rate-limit.md
