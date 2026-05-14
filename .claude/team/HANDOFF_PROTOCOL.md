# Agent Team — 交接協議

每個 agent 在多步驟工作流中遵守這份協議。**單獨叫 agent 仍可工作**（這份協議只在 team workflow 中觸發）。

## 工作流（典型）

```
User 請求
  ↓
main assistant → 派 team-lead
  ↓
team-lead 寫 handoff.md 初始 task spec
  ↓
team-lead 派 product-manager（需求拆解、排優先序）
  ↓
團隊棒接棒：根據需求性質選 ui-designer / fortune-engine / 其他
  ↓
reviewer（commit 前審查）
  ↓ blocker → 退回上一棒第二輪
  ↓
deployer（commit + push + 部署驗證）
  ↓
team-lead 收尾 → 回報 user
```

非典型：bug 修復可能跳過 PM 直接 ui-designer。team-lead 自己判斷。

## handoff.md 位置 + 生命週期

- 路徑：`.claude/team/handoff.md`（single source of truth）
- 任務開始：team-lead 建立或重置這檔
- 任務進行中：每棒讀 → 做事 → append 自己的 section
- 任務結束：team-lead 改名搬到 `.claude/team/archive/YYYY-MM-DD-<task-slug>.md`（可選保存）

## handoff.md 標準格式

```markdown
# Task: <一句話描述>

> 開始日：2026-MM-DD HH:MM
> 發起：user
> 路由：team-lead
> 目前狀態：active / done / abandoned

---

## task spec
<team-lead 寫>
- 使用者原話（直接 quote）：
- 拆出來的工作項：
- 路由計畫：PM → ui-designer → reviewer → deployer

---

## product-manager — DONE
**Updated**: 2026-MM-DD HH:MM
**Output file**: 需求優先序_2026-MM-DD.md
**Decisions**:
- 做：A, B, C（5 件 P0）
- 不做：D, E（違反產品定位）
- 延後：F
**Open questions**: 無 / 需要 user 拍板 X
**Next**: ui-designer
**For ui-designer**: 實作 A, B, C 按 P0 順序，估 90 分鐘

---

## ui-designer — DONE
**Updated**: 2026-MM-DD HH:MM
**Files changed**: index.html (+190/-36)
**Tasks done**:
- A: ...
- B: ...
**Tests run**: 手機 375 / 桌機 1280 / 東 + 西方主題
**Known limits**: ...
**Next**: reviewer

---

## reviewer — PASS
**Updated**: 2026-MM-DD HH:MM
**Blockers**: 0
**Warnings**: 3
- L2023: dbDel/dbDelete 重複
- L2364-2504: showDetail buffer 寫法
- L1334 vs L2723: scanPrompt 同步靠 trigger
**Next**: deployer

---

## deployer — LIVE
**Updated**: 2026-MM-DD HH:MM
**Commits**: 28d8aaf, 0c3d98f
**Live URL**: https://ninja886.coinnow888.workers.dev/
**Verification**: HTTP 200 ✓ / size match 159930 ✓ / 6 markers ✓ / SW v4 ✓
**Next**: team-lead

---

## team-lead — CLOSED
**Updated**: 2026-MM-DD HH:MM
**Summary for user**:
- 5 件 P0 全上線
- Reviewer 列出 3 件 warnings 入待辦
- Live URL：https://...
**Archive moved to**: .claude/team/archive/2026-05-15-phase1-p0.md
```

## 退回（rework）規則

reviewer 找 blocker、或 ui-designer 卡關需 fortune-engine 支援，**不要覆寫**前面的 section，**append 新 section**：

```
## reviewer — FAIL
**Blockers**: 1
- L1234: 東切西時 fortune.method 沒轉換（regression）
**Next**: ui-designer rework

## ui-designer (round 2) — DONE
**Updated**: ...
**Fix**: 加 method 欄位寫入 L2576
**Next**: reviewer

## reviewer (round 2) — PASS
**Updated**: ...
**Blockers**: 0
**Next**: deployer
```

## 通用規則

- **Status 必須全大寫**：`DONE / IN-PROGRESS / BLOCKED / FAIL / LIVE / PASS / CLOSED`
- **Updated 時間戳一定要有**
- **Next 一定要指明下一棒**（agent 名稱或 user）
- **For <next-agent>** 段：給下一棒 actionable instruction，不是長篇
- **Output file** 段：如果 agent 寫了長文檔（PM 寫優先序提案、ui-designer 寫了 UX 提案）放這
- 每個 section 不要 > 30 行；長內容外接 .md 檔案
- 一律繁體中文

## Agent 啟動時的標準動作

```
1. 讀 .claude/team/handoff.md（不存在 = 我是第一棒，照 user request 走）
2. 找符合自己 role 的 section 標題 OR 找上一棒 section 裡的 "Next: <我>"
3. 讀「For <我>」段拿到指令
4. 做事
5. Append 自己 section 到 handoff.md（按格式）
6. 回 main assistant 一句話 + 標出「下一棒：X」
```
