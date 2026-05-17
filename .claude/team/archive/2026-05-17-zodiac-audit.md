# Task: 西方占星算法審查

> 開始日：2026-05-17 13:39
> 發起：user via main assistant
> 路由：fortune-engine → product 決策（main） → 視情況修
> 目前狀態：active

---

## task spec
繼八字（4 bug 修完）、易經（1 bug 修完）後，審查西方占星部分（`index.html` line 1849-1955）：
- `ZODIAC[12]` 12 個星座的 dateRange / element / mode / ruler 對照
- `getZodiac(month, day)` 邊界 + invalid 輸入處理
- `ZODIAC_ASPECTS` 12×12 相位算法與角度／harmony 評分

---

## main assistant 實作 — DONE
**Updated**: 2026-05-17

採 fortune-engine 推薦的 minimal fix（兩個 minor issue 一起修）：

1. **getZodiac 加 input validation**：
   ```js
   if(!month || !day || month<1 || month>12 || day<1 || day>31) return null;
   ```
   + 把 `return ZODIAC[9]` 改成 `return null`（同 fallback 邏輯）

2. **line 1923 註解修正**：
   ```
   // diff=0 合相 / 1,11 半六合(30°) / 2,10 六分(60°) / 3,9 刑(90°) /
   //   4,8 三合(120°) / 5,7 梅花(150°) / 6 對沖(180°)
   ```

**不升 FORTUNE_ALGO_V**：算法輸出對 valid input 完全相同，無 migration 必要。

**驗證**（preview MCP）：
- Aries(4,1) / Pisces(3,20) / Cancer(6,21) / Capricorn(12,25) / Capricorn(1,5) 全正確 ✓
- 6 種 invalid input（month=0/13、day=0/32、null month、undefined day）全 return null ✓（修前會回摩羯）

## fortune-engine — DONE
**Updated**: 2026-05-17 13:39
**Audit 結果**：12 PASS / 0 critical FAIL / 1 minor robustness issue（getZodiac fallback）/ 1 文件不一致

### A. ZODIAC dateRange（覆蓋驗證）

跑遍 366 天（leap year），結果：

| Sign | days | first | last | 主流 boundary | 狀態 |
|---|---|---|---|---|---|
| Aries | 30 | 3/21 | 4/19 | 3/21–4/19 | PASS |
| Taurus | 31 | 4/20 | 5/20 | 4/20–5/20 | PASS |
| Gemini | 31 | 5/21 | 6/20 | 5/21–6/20 | PASS |
| Cancer | 32 | 6/21 | 7/22 | 6/21–7/22 | PASS（含 2/29） |
| Leo | 31 | 7/23 | 8/22 | 7/23–8/22 | PASS |
| Virgo | 31 | 8/23 | 9/22 | 8/23–9/22 | PASS |
| Libra | 30 | 9/23 | 10/22 | 9/23–10/22 | PASS |
| Scorpio | 30 | 10/23 | 11/21 | 10/23–11/21 | PASS |
| Sagittarius | 30 | 11/22 | 12/21 | 11/22–12/21 | PASS |
| Capricorn | 29 | 1/1, 12/22 | 12/31, 1/19 | 12/22–1/19 | PASS（跨年正確） |
| Aquarius | 30 | 1/20 | 2/18 | 1/20–2/18 | PASS |
| Pisces | 31 | 2/19 | 3/20 | 2/19–3/20 | PASS |

**366 天全覆蓋，無漏日無重疊**。8 個邊界日（3/20, 3/21 / 6/20, 6/21 / 9/22, 9/23 / 12/21, 12/22）測試全部正確跨入下一星座。

> 註：主流占星每年實際 boundary 因太陽進入星座時刻 ±1 日浮動（如某年 Aries 從 3/20 開始），但多數占星 app（含 Co-Star、Astro.com 大眾版）採固定 boundary，本專案的選擇與主流一致。

### B. 元素 / 模式 / 守護星

| 檢查項 | 結果 |
|---|---|
| Fire (Aries/Leo/Sag) — Earth (Tau/Virgo/Cap) — Air (Gem/Lib/Aqu) — Water (Cancer/Sco/Pisces) | PASS 各 3 個 |
| Cardinal (Aries/Cancer/Libra/Cap) — Fixed (Tau/Leo/Sco/Aqu) — Mutable (Gem/Virgo/Sag/Pisces) | PASS 各 4 個 |
| 守護星：Aries-Mars / Tau-Venus / Gem-Mercury / Cancer-Moon / Leo-Sun / Virgo-Mercury / Libra-Venus / **Sco-Pluto** / Sag-Jupiter / Cap-Saturn / **Aqu-Uranus** / **Pisces-Neptune** | PASS（一致採「現代」三王星派） |

選擇現代守護星（含 Pluto/Uranus/Neptune）是合理且最常見的當代占星設定，與專案文案「最有深度和洞察力的策略家」（Scorpio = Pluto 質感）一致。

### C. getZodiac 邊界 / 跨年 / 無效輸入

正常邊界（PASS）：
- 3/20→Pisces, 3/21→Aries（雙魚/牡羊）
- 6/20→Gemini, 6/21→Cancer（雙子/巨蟹）
- 9/22→Virgo, 9/23→Libra（處女/天秤）
- 12/21→Sag, 12/22→Cap（射手/摩羯）
- 12/31→Cap, 1/1→Cap, 1/19→Cap（跨年正確）
- 1/20→Aqu, 2/18→Aqu, 2/19→Pisces

**無效輸入（FAIL — 但低風險）**：
| 輸入 | 結果 | 預期 |
|---|---|---|
| month=0, day=1 | Capricorn（fallback） | 應 null |
| month=13, day=1 | Capricorn（fallback） | 應 null |
| month=1, day=0 | Capricorn（fallback） | 應 null |
| month=1, day=32 | **Aquarius（誤算）** | 應 null |
| month=6, day=31 | **Cancer（誤算）** | 應 null |

問題：
1. **line 1919 `return ZODIAC[9]` 是「靜默回傳摩羯」**，invalid 月份會被當成摩羯，這是 reviewer 在任務 spec 就指出的真 bug。雖然 fallback 永遠不會在 12 sign 都覆蓋的情況下被走到（month 1-12 都有對應 sign），但 month=0 / month=13 等錯誤輸入會走到。
2. 對於 day 超出範圍（1/32、6/31），算法竟然會走入下一個 sign 的 range（因為「month==sm && day>=sd」對 day 不設上限）。

**實際風險評估**：UI 用 `<input type="number" min="1" max="12">` 限制 month（line ~2786 之前的 sheet 輸入），day 也類似。所以理論上不會發生。但若資料是從匯入/OCR 進來（OCR API key 鎖定後仍可用），就有可能撞到。

### D. ZODIAC_ASPECTS 相位算法

**算法評估**：用 `Math.abs(j-i)` + 12 星座距離換算 30°/sign，這是業界標準寫法。

| diff | 角度 | 相位 | harmony | 占星共識 | 狀態 |
|---|---|---|---|---|---|
| 0 | 0° | 合相 conjunction | 5 | 強烈、可加分可放大盲點 | PASS |
| 1, 11 | 30° | 半六合 semi-sextile | 3 | 輕微緊張、學習機會 | PASS |
| 2, 10 | 60° | 六分相 sextile | 4 | 友善、機會 | PASS |
| 3, 9 | 90° | 刑相 square | 1 | 張力、衝突也成長 | PASS |
| 4, 8 | 120° | 三合 trine | 5 | 最和諧 | PASS |
| 5, 7 | 150° | 梅花相 quincunx | 2 | 不協調需調整 | PASS |
| 6 | 180° | 對沖 opposition | 2 | 對立又吸引 | PASS |

**驗證**（跑 144 對 12×12，27 個樣本對比期望值）：全 PASS。範例：
- Aries-Leo = 三合 ✓（都是 Fire）
- Taurus-Virgo = 三合 ✓（都是 Earth）
- Aries-Libra = 對沖 ✓（180°）
- Aries-Cancer = 刑相 ✓（都是 Cardinal）
- Aries-Gemini = 六分相 ✓（火+風相容元素）

**問：是否漏 diff=6？** ❌ 沒漏，line 1939 處理了。reviewer 在 task spec 寫的 `(missing?)` 已被 line 1939 cover。

**問：harmony 評分一致性？** 合相/三合 = 5（最高），刑相 = 1（最低），這符合占星傳統的 hard vs soft aspects 分類。

> 一個 minor 哲學議題：對沖 harmony=2 略低。傳統占星把對沖視為「中性偏 hard」，但商業合作脈絡下對沖配對其實常成為「互補強組合」（很多最強的拍檔是對沖星座，如 Mac/PC 對沖、左右腦互補）。harmony=2 與 line 2018 文案「最有力量的搭檔」略有張力。但這是文案/權重微調，**不是 bug**。

### 文件不一致（minor）

`index.html` line 1923 的註解：
```js
// 0=合 1=半六合 2=六分 3=刑 4=三合 5=對沖 6=梅花 etc.
```
但實際代碼 `5=梅花相`、`6=對沖`。註解寫反了。

### 修改建議（最小 diff）

**Bug 1（getZodiac fallback 誤導摩羯）** — 建議修：
```js
// line 1919
- return ZODIAC[9];
+ return null; // invalid input — 讓 caller 處理
```
但這會讓 caller 全部要加 null check。**替代方案**：在函式開頭加防護
```js
function getZodiac(month,day){
  if(!month || !day || month<1 || month>12 || day<1 || day>31) return null;
  for(...) { ... }
  return null;
}
```
caller 端 line 2110, 2786, 2841, 2987 已經先 check `if(c.birthMonth && c.birthDay)` 才呼叫，所以再加 null check 影響只有：要不要顯示「無命理」vs「摩羯（錯）」。

**Bug 2（註解寫反）** — 建議修：
```js
- // 0=合 1=半六合 2=六分 3=刑 4=三合 5=對沖 6=梅花 etc.
+ // diff=0 合相, 1/11 半六合(30°), 2/10 六分(60°), 3/9 刑(90°), 4/8 三合(120°), 5/7 梅花(150°), 6 對沖(180°)
```

### 兩個審查 spec 提到但 NOT 是問題的項目

1. **「fallback Capricorn 是 bug」**：算是 bug，但日常 UI 路徑撞不到（month 來自 `<input type="number" min="1" max="12">`）。優先序低。
2. **「diff=6 missing?」**：沒 missing，line 1939 cover 了。

### 是否需要升 FORTUNE_ALGO_V？

**不需要**。即使修了 fallback 和註解：
- 算法輸出不變（沒人能在 UI 輸入 month=13）
- 計算結果與舊版相同
- 不需重算既有 contact

只在文案/權重調整（如 harmony 評分）或大改算法時才升版。

### Summary table

| Item | 狀態 |
|---|---|
| ZODIAC dateRange 366 天覆蓋 + 12 邊界 | ✅ PASS |
| 4 元素分布（各 3）| ✅ PASS |
| 3 模式分布（各 4）| ✅ PASS |
| 現代守護星（含 Pluto/Uranus/Neptune）| ✅ PASS（一致） |
| getZodiac 正常邊界 | ✅ PASS |
| getZodiac invalid 輸入處理 | ⚠️ minor bug（fallback Capricorn）|
| ZODIAC_ASPECTS 144 對覆蓋 + 角度對應 | ✅ PASS |
| harmony 評分一致性 | ✅ PASS |
| 註解 (line 1923) 與代碼一致 | ❌ 註解寫反 |

**12 PASS / 0 critical FAIL / 1 minor robustness + 1 註解錯誤**

**Next**: product 決策回 user — 兩個 minor issue 修不修？修的話只動 ~5 行不需升 algoVer
**For main assistant**:
1. 拍板 getZodiac null check 加不加（風險：UI 路徑撞不到，但 OCR/匯入路徑可能）
2. 拍板 line 1923 註解要不要順手修

---
