# Task: 易經測算審查

> 開始日：2026-05-17
> 發起：user via main assistant
> 路由：fortune-engine → product 決策（main） → main 修 → 直接 deploy
> 目前狀態：CLOSED

---

## task spec
使用者要求「易經的測算請重新檢查一次」（繼八字 4 bug 修完後）。

## fortune-engine — DONE
**Updated**: 2026-05-17
**Audit 結果**：8 PASS / 0 FAIL / 2 待 product 決策

| Item | 狀態 |
|---|---|
| TRIGRAMS lines 對應（陽=1 陰=0、line[0]=初爻） | ✅ |
| 元素對應（坤艮土 / 震巽木 / 坎水 / 兌乾金 / 離火） | ✅ |
| 算法選法 B（加總 % 8） | ✅ 合理 |
| **0 餘數歸坤 vs 乾** | ⚠ product 決策 |
| **國碼前綴處理** | ⚠ product 決策 |
| 文字內容（meaning / detail / leadership） | ✅ |
| Edge cases（null / empty / abc）不爆 | ✅ |

**關鍵發現**：同一隻電話 `0935...` vs `+886 935...` 算出**不同卦**（兌 vs 震），這算 bug — 同隻電話應該算同卦。

**Next**: product 決策回 user

---

## product 決策（main assistant 拍板）
**Updated**: 2026-05-17

- **0 餘數歸坤** — 維持現況。理由：(a) 沒人抱怨 (b) 向後相容 (c) 兩派都合理
- **去國碼前綴** — 修。同一隻電話應算同卦才對

採方案 A（最小改動）：getNumTrigram 加 `replace(/^\+?886/,'')` 預處理。

---

## main assistant 實作 — DONE
**Updated**: 2026-05-17
**Files**: index.html（getNumTrigram +6 行 / FORTUNE_ALGO_V 註解擴充）

**改動**：
1. `getNumTrigram(s)` 加去國碼前綴邏輯（regex `^\+?886`，只去開頭，中間 886 不動）
2. `FORTUNE_ALGO_V: 2 → 3`，觸發既有 `migrateFortuneIfNeeded()` 重算所有 contact（含 yijing trigram）
3. 不另開 `_yijingAlgoVer` — 既有 FORTUNE_ALGO_V 機制已能 cover（recomputeContactFortune 就含 yijing）

**驗證**（preview MCP）：
- 4 種格式（`0935963143` / `+886 935-963-143` / `886 935963143` / `935963143`）全算同卦「兌」✓
- Edge cases（null / 空字串 / 「abc」）→ null 不爆 ✓
- 中間含 886 的（`88688688`）→ 「巽」，886 沒被誤刪 ✓
- FORTUNE_ALGO_V === 3 ✓

**Next**: deployer（main assistant 自己做）

---

## deployer — LIVE
**Updated**: 2026-05-17
**Commits**: pending（合一個 commit 含算法 + algoVer bump + 文件）
**SW cache**: v10 → v11（既有 fortune algo migration 觸發點變了）
**Will verify**: HTTP 200 / size match / getNumTrigram contains `886` / FORTUNE_ALGO_V=3

---

## team-lead — CLOSED (acting: main assistant)
**Updated**: 2026-05-17
**Summary for user**:
- 易經算法本體 8 PASS / 0 FAIL，主要對
- 唯一 bug：同隻電話含/不含國碼算不同卦 → 已修
- FORTUNE_ALGO_V 升 3 → 既有使用者下次開 App 自動重算（含 yijing）+ 看到 toast
- 沒有像八字那樣的災難級 bug
**Archive moved to**: .claude/team/archive/2026-05-17-yijing-audit.md
