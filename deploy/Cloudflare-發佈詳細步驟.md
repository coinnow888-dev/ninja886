# Cloudflare Pages 發佈完整步驟（2026 最新版）

照著做就會成功。每一步都有「看到什麼畫面 → 要做什麼動作」。
全程免費，不需要信用卡，預計 15–20 分鐘。

---

## 準備工作

請先打開您電腦上的「人脈資料庫」資料夾，找到：

```
人脈資料庫/
└── deploy/
    └── index.html   ← 這個檔案等下要用
```

確認看得到 `index.html`。準備好後就可以開始。

---

## 第 1 階段：註冊 Cloudflare 帳號（5 分鐘）

### 1.1 打開註冊頁

在瀏覽器網址列輸入：

```
https://dash.cloudflare.com/sign-up
```

按 Enter。

### 1.2 填寫註冊資料

您會看到一個畫面，要求輸入：

| 欄位 | 怎麼填 |
|------|--------|
| **Email** | 您常用的 Email |
| **Password** | 至少 8 個字，要有大小寫和數字，例如 `Renmai2026!` |

⚠️ 注意：密碼欄位下方可能有「prove you are human」的驗證框，記得勾。

填完按下藍色按鈕 **「Sign Up」**（註冊）。

### 1.3 驗證 Email

1. 打開您的 Email 信箱
2. 找一封來自 **Cloudflare** 的信，標題類似 "Verify your email"
3. 點信裡的 **「Verify email」** 連結
4. 瀏覽器會自動跳回 Cloudflare，顯示「Email verified」

### 1.4 登入後第一個畫面

登入後，Cloudflare 可能會問您：

- 「Do you want to add a website?」（要不要綁網域？）
  → **不要做任何選擇，直接關掉這個提示**，或點「Skip」、「Not now」
- 「Choose a plan」（選方案？）
  → **選 Free（免費）**

最後您會進到 Cloudflare 主控台（Dashboard），畫面長這樣：

```
┌─────────────────────────────────────────────────────┐
│  ☁ Cloudflare    [搜尋]            [您的 Email] ▼ │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│ Account Home │   Welcome to Cloudflare              │
│              │                                       │
│ Websites     │   [Add a site]                       │
│              │                                       │
│ Workers &    │   Recent activity                    │
│ Pages   ←━━━━ ← 等下要點這個                       │
│              │                                       │
│ R2           │                                       │
│ ...          │                                       │
└──────────────┴──────────────────────────────────────┘
```

---

## 第 2 階段：建立 Pages 專案（5 分鐘）

### 2.1 進入 Workers & Pages

在左側選單點 **「Workers & Pages」**

> 💡 找不到？也可能叫 **「Compute (Workers)」** 或就是 **「Workers」**。
> 點開後右方會出現「Workers」和「Pages」兩個選項。

### 2.2 開啟建立流程

進到 Workers & Pages 頁面後，您會看到：

- 如果是新帳號，可能會直接顯示一個歡迎頁，找 **「Create application」** 或 **「Create」** 按鈕
- 如果之前有用過，點右上角的 **「Create」** 藍色按鈕

點下去。

### 2.3 選擇上傳方式

接下來的畫面會給您兩三個選項：

```
┌──────────────────────────────────────────┐
│  Get started                              │
├──────────────────────────────────────────┤
│  □ Import an existing Git repository     │
│  □ Drag and drop your files     ← 點這個 │
│  □ Use a framework starter               │
└──────────────────────────────────────────┘
```

點 **「Drag and drop your files」**（也可能寫成 **「Direct Upload」** 或 **「Upload assets」**）。

### 2.4 輸入專案名稱

接下來會要您輸入 **Project name**（專案名稱）：

```
┌──────────────────────────────────────────────┐
│  Create a project                             │
├──────────────────────────────────────────────┤
│  Project name                                 │
│  ┌────────────────────────────────────────┐  │
│  │ renmai-shouzha                         │  │
│  └────────────────────────────────────────┘  │
│  Your site will be available at:              │
│  renmai-shouzha.pages.dev                     │
│                                                │
│  Production branch:  [main]                   │
│                                                │
│              [Continue / Create project]      │
└──────────────────────────────────────────────┘
```

**命名規則：**

✅ 可以用：
- 小寫英文字母 `a–z`
- 數字 `0–9`
- 連字號 `-`

❌ 不能用：
- 中文
- 空格
- 大寫
- 底線、句點、符號

**建議命名：**

| 想要的網址 | 填這個 |
|-----------|--------|
| `renmai-shouzha.pages.dev` | `renmai-shouzha` |
| `kuanyen-crm.pages.dev` | `kuanyen-crm` |
| `connections-app.pages.dev` | `connections-app` |

> ⚠️ 名字之後**不能改**！要改就只能砍掉重做。請想好再填。

填完按 **「Create project」** 或 **「Continue」**。

---

## 第 3 階段：上傳 index.html（2 分鐘）

### 3.1 看到拖放區

下一個畫面會出現一個大方框，類似這樣：

```
┌────────────────────────────────────────────┐
│                                             │
│         ⬆                                   │
│      Drag and drop your folder              │
│      (or a zip file) here                   │
│                                             │
│         or  [select from computer]          │
│                                             │
└────────────────────────────────────────────┘
```

### 3.2 拖入檔案

**方法 A：拖放（推薦）**

1. 打開兩個視窗並排：
   - 左邊：您的「人脈資料庫」資料夾（深入到 `deploy/` 子資料夾）
   - 右邊：瀏覽器上的 Cloudflare 頁面
2. 用滑鼠把 `index.html` **拖到** 拖放區放開

**方法 B：點按鈕選擇**

1. 點 **「select from computer」**（從電腦選擇）
2. 跳出選檔視窗 → 找到 `index.html` → 點「開啟」

### 3.3 確認上傳成功

成功的話，畫面會列出檔案：

```
┌────────────────────────────────────────────┐
│  Files to upload (1)                        │
│                                             │
│  ✓ index.html             119 KB            │
│                                             │
│              [Deploy site]                  │
└────────────────────────────────────────────┘
```

確認看到綠色勾勾。

### 3.4 點 Deploy site

點藍色的 **「Deploy site」** 按鈕，開始部署。

畫面會切換到部署進度，類似：

```
✓ Initializing build environment
✓ Uploading assets
⏳ Deploying to Cloudflare's global network...
```

等待約 30 秒到 1 分鐘。

---

## 第 4 階段：拿到網址（1 分鐘）

### 4.1 部署完成畫面

部署成功後，您會看到：

```
┌─────────────────────────────────────────────────┐
│  🎉 Success! Your site is live.                  │
│                                                  │
│  Your site is now available at:                  │
│  https://renmai-shouzha.pages.dev   [Visit site] │
│                                                  │
│  [Continue to project]                           │
└─────────────────────────────────────────────────┘
```

### 4.2 測試一下

**先自己用手機和電腦都打開測試**：

1. 點 **「Visit site」**，或自己把網址打進瀏覽器
2. 看到「人脈手札」的歡迎畫面 ✓
3. 用手機開同一個網址 → 確認手機版也正常 ✓
4. 試著新增一筆人脈 → 確認能存能讀 ✓

### 4.3 找不到網址了？

下次要找這個網址：

1. 登入 Cloudflare
2. 左側 **Workers & Pages**
3. 點您的專案名稱（例如 `renmai-shouzha`）
4. 上方就會顯示網址

---

## 第 5 階段：分享給朋友

複製這段範本，傳給朋友：

```
給您推薦一個工具 — 人脈手札

結合東西方命理分析的人脈管理工具，幫您快速判斷合作適配度。

🔗 https://renmai-shouzha.pages.dev
   （把上面換成您自己的網址）

使用提醒：
- 用 Chrome 或 Safari 開
- 資料只存在您的手機/電腦上，不會上傳
- 建議按「加到主畫面」變成 App 一樣方便
- 記得定期用「匯出」備份資料
```

---

## 之後想更新檔案怎麼辦？

每次您修改了 `index.html`：

1. 登入 Cloudflare → 左側 **Workers & Pages**
2. 點您的專案名稱
3. 上方分頁切到 **「Deployments」** 或 **「Create deployment」**
4. 點 **「Create a new deployment」**
5. 把新的 `index.html` 拖進去 → **Deploy**
6. 等 30 秒，網址自動更新

**舊使用者要重新整理才會看到新版**（瀏覽器有快取，按 Ctrl+Shift+R 或關掉重開即可）。

---

## 常見問題

### Q1：註冊時 Cloudflare 要我綁定信用卡？

不用！Pages 完全免費，免費方案不需要信用卡。如果跳出付費頁面，找「Free」或「Skip」選項。

### Q2：專案名稱被搶走了？

Cloudflare 會在前面顯示 ❌ 或紅字。換個名字，例如加上您的英文名 `kuanyen-renmai`。

### Q3：拖檔案進去沒反應？

- 確認您拖的是 **`index.html` 檔案本身**（不是整個 deploy 資料夾，雖然兩種都可以）
- 用滑鼠左鍵按住不放再拖
- 如果還是不行，改用「select from computer」按鈕

### Q4：「This project cannot switch to Git integration later」這個警告是什麼？

意思是：用這種「拖檔上傳」方式建的專案，之後不能改成自動從 GitHub 部署。**對您完全沒影響**，繼續就好。

### Q5：可以給網址加上自己的域名（例如 renmai.com）嗎？

可以，免費的。但要先去買域名（NT$300-500/年）。買到後：

1. 進專案 → **Custom domains** → **Set up a custom domain**
2. 輸入您的域名 → 跟著畫面指示
3. 等 5–10 分鐘，HTTPS 也會自動設定好

### Q6：流量大會被收費嗎？

免費方案的額度：
- 每月 **500 次部署**（您手動上傳新版才算一次）
- **不限頻寬**、不限訪問次數

送朋友用的規模絕對綽綽有餘。

### Q7：想砍掉重做？

進專案 → **Settings**（設定）→ 滑到最底下 → **Delete project**。
網址會立刻失效。

### Q8：使用者打開很慢？

Cloudflare 在台灣有節點，第一次打開可能要 1–2 秒（下載 120KB），之後瀏覽器有快取就很快。如果真的慢，可能是使用者網路問題。

---

## 卡關時怎麼辦

任何一步看到的畫面跟我描述的不一樣（Cloudflare 常常微調介面），請：

1. 截圖目前的畫面
2. 把畫面傳給我
3. 我會看圖告訴您下一步點哪裡

別硬猜，省得一不小心建錯。
