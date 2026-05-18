---
name: renmai-deploy
description: Deploy the 人脈手札 project — sync v3 archive, bump SW cache if code changed, git commit with HEREDOC + Co-Authored-By, push, then verify live URL size match and content markers. Use when user says 「上版」/「部署」/「commit + push」/「發版」or any phrase meaning "ship to live". Takes commit message subject as args.
---

# /renmai-deploy

部署一個 commit 到 live（`https://ninja886.coinnow888.workers.dev/`）。包裝整個 deploy 流程避免漏步驟（最常出包：忘 bump SW、漏 cp v3、commit message 格式不一致）。

## 觸發 / 使用

```
/renmai-deploy <commit message subject>
```

例如：
```
/renmai-deploy 修 detail 頁桌機按鈕協調
/renmai-deploy 新增「家人」role 選項
```

如果沒給 args，先問使用者 commit subject 是什麼。**禁止**在沒有明確 subject 時自動 commit。

## Pre-flight 檢查

切到專案目錄 `/Users/kuanyenho/Documents/Claude/Projects/人脈資料庫`，然後：

1. `git status --short` 看有什麼改動。如果完全空 → 回報「沒有改動可以 commit」並停止。
2. 不要 `git add .` — 後面只 add 「specific staged or changed files」。
3. 看哪些檔案被改：
   - `index.html` 改了 → 走完整 deploy
   - 只有 `*.md` 改了（文件、待辦清單）→ skip SW bump、可選擇是否跑 verify
   - `worker.js` / `wrangler.jsonc` / `sw.js` 改了 → 提醒使用者「這次動到 worker / 部署設定」，二次確認

## Step 1：Sync v3.html

如果 `index.html` 被改：

```bash
cp index.html "人脈手札-v3.html"
diff -q index.html "人脈手札-v3.html"
```

`diff -q` 必須回空字串才繼續，否則停下。

## Step 2：決定是否 bump SW cache

讀 `sw.js` 的 `const CACHE = 'renmai-vN'`。

**bump 規則**（按優先順序判斷）：
- ✅ Bump：index.html 有實質 code 改動（JS / HTML structure / CSS rules）→ N+1
- ✅ Bump：index.html 改了但內容是「邏輯修正」(bug fix / 算法更新) → N+1
- ❌ 不 bump：只改 *.md / handoff / 註解 / .claude/agents 內容
- ⚠️ 看情況：純 inline 文案微調（如改一個按鈕字串）→ 預設 bump，但可詢問使用者

如果決定 bump：
```
Edit sw.js: const CACHE = 'renmai-vN' → 'renmai-v(N+1)'
```

## Step 3：Stage specific files

**不要 git add .**。一定要列出來：

```bash
git add index.html "人脈手札-v3.html"
# 如果改了 sw.js：
git add sw.js
# 如果改了文件：
git add 待辦清單.md 商業策略/...md ...
# 等等
```

`git status --short` 再看一次，確認沒有 unwanted 檔案被 staged。

## Step 4：Commit with HEREDOC

格式（一律繁體中文）：

```
<subject — 從 args 抄過來>

<body — 多行說明，「為什麼」勝於「改什麼」>
- 重點 1
- 重點 2

【其他】
sw.js cache vN → v(N+1)（如果 bumped）

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

實際指令用 HEREDOC（保留換行）：

```bash
git commit -m "$(cat <<'EOF'
<subject>

<body>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

如果 body 該寫什麼不確定，就根據 git diff 寫出修了什麼 + 為什麼。**不允許**空 body commit。

## Step 5：Push

```bash
git push 2>&1 | tail -3
```

確認看到 `<old-sha>..<new-sha>  main -> main`。如失敗 → 回報錯誤，停下不要硬重試。

## Step 6：Verify live

```bash
sleep 35  # 等 Cloudflare 部署
deployed=$(curl -s --max-time 15 "https://ninja886.coinnow888.workers.dev/" | wc -c | tr -d ' ')
local=$(wc -c < index.html | tr -d ' ')
echo "deployed=$deployed local=$local"
```

`deployed === local` → ✅
不等 → ⚠️ Cloudflare edge cache 還沒更新，再 sleep 20 重試一次

## Step 7：Marker check（可選但推薦）

從 commit message body 找 1-3 個獨特字串當 marker（例如新加的函式名、新文案、新 CSS class）：

```bash
curl -s --max-time 15 "https://ninja886.coinnow888.workers.dev/" | grep -c "<marker1>\|<marker2>"
```

> 0 → ✅
=0 → ⚠️ 部署可能沒生效，再 sleep 20 重試

## Step 8：回報

成功格式：

```
## ✅ 已部署 commit `<sha>`

### 改了什麼
- ...

### Live
- HTTP 200 / size match (deployed=N local=N) ✓
- markers: <list> 命中 X 處 ✓
- SW: renmai-vN → vN+1（或「未 bump」）

### 您的下一步
- 手機強制刷新 https://ninja886.coinnow888.workers.dev/
- ...（如果需要 user 做什麼）
```

失敗格式：

```
## ❌ 部署中斷在 Step <N>

原因：...
已做：commit <sha> 但未 push / push 了但 verify 失敗 / ...
下一步：手動執行 ... 或叫我 retry
```

## 例外處理

| 情境 | 處理 |
|---|---|
| working tree dirty 但有 unstaged changes | 列給 user 看，問是否 `git add -A`（auto mode 下用判斷力，公文檔/lock 檔不要 add） |
| commit 失敗（pre-commit hook） | 不要 `--no-verify` 跳過。回報 hook 訊息給 user，停下 |
| push 被拒（non-fast-forward） | **絕對不要** force push。回報並建議 `git pull --rebase` |
| Cloudflare verify 連兩次失敗 | 回報「部署可能還沒完成或失敗」+ 給 Cloudflare Dashboard 連結 |
| 改到 worker.js / wrangler.jsonc | 二次確認 + 提醒「worker 改動，使用者可能需要在 Cloudflare 後台再 redeploy」 |
| handoff.md 還在 .claude/team/（沒 archive） | 提醒 user 「Team workflow 還沒收尾，要先 archive 嗎？」 |

## 約束

- ❌ **不要 force push**
- ❌ **不要 git add .**（specific files only）
- ❌ **不要 --no-verify**（pre-commit hook 失敗就停）
- ❌ **不要跳過 SW bump 後 verify**（已部署 + size match 才算完成）
- ❌ **不要在 main 之外建分支**（這個專案 single-branch workflow）
- ✅ 一律繁體中文
- ✅ 失敗時清楚告訴 user 已做到哪一步，方便手動接手
- ✅ commit message body 寫「為什麼」優先（CLAUDE.md 的 commit style 規範）
