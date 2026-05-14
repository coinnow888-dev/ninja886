# GitHub + Cloudflare 自動部署完整設定

設定完成後，您未來的更新流程會變成：

```
Cowork 改檔 → 在 GitHub 網頁更新 → Cloudflare 30 秒內自動上線
```

不用再拖檔到 Cloudflare、不用擔心改壞了找不回舊版。

**全程在瀏覽器完成、不裝任何軟體、不寫程式。預計 30 分鐘。**

---

## 整體流程

```
①建 GitHub 帳號  →  ②建 Repository  →  ③上傳 index.html
                                                ↓
        ⑥日常更新  ←  ⑤確認自動部署  ←  ④Cloudflare 連 GitHub
```

---

## 第 1 階段：建 GitHub 帳號（5 分鐘）

### 1.1 註冊

打開 https://github.com/signup

填三個東西：
- **Email**：建議用跟 Cloudflare 同一個（方便管理）
- **Password**：要記得
- **Username**：會變成您的網址 `github.com/您的名字`，**只能英文+數字+連字號**，建議用 `kuanyen-ho` 之類

按下藍色的 **Create account**，跟著畫面驗證 Email。

### 1.2 跳過廣告問卷

註冊完 GitHub 會問您：
- 「Are you a student?」→ 隨便選
- 「How will you primarily use GitHub?」→ 選 **Personal use**
- 推薦付費方案 → **Continue with Free**
- 興趣問卷 → 全部跳過（點 Skip）

最後進到 GitHub Dashboard，畫面長這樣：

```
┌─────────────────────────────────────────────┐
│ 🐙 GitHub   [搜尋]      [+▼] [圖示][頭像] │
├──────────────────┬──────────────────────────┤
│                  │                           │
│ Recent           │   Welcome to GitHub!     │
│ activity         │                           │
│                  │   [Create your first     │
│                  │    repository]            │
│                  │                           │
└──────────────────┴──────────────────────────┘
```

---

## 第 2 階段：建 Repository（5 分鐘）

Repository（簡稱 repo）就是「程式碼專案」。一個 repo 對應一個產品。

### 2.1 開啟建立頁

點右上角的 **「+」** → **New repository**

或直接前往 https://github.com/new

### 2.2 填寫資料

```
┌─────────────────────────────────────────────┐
│ Create a new repository                      │
├─────────────────────────────────────────────┤
│ Repository name *                            │
│ ┌─────────────────────────────────────┐    │
│ │ renmai-shouzha                       │    │
│ └─────────────────────────────────────┘    │
│ ✓ renmai-shouzha is available                │
│                                                │
│ Description (optional)                        │
│ ┌─────────────────────────────────────┐    │
│ │ 結合命理分析的人脈管理工具              │    │
│ └─────────────────────────────────────┘    │
│                                                │
│ ⦿ Public  ○ Private                          │
│                                                │
│ ☑ Add a README file                          │
│ ☐ Add .gitignore                             │
│ ☐ Choose a license                           │
│                                                │
│         [Create repository]                   │
└─────────────────────────────────────────────┘
```

**逐項填法：**

| 欄位 | 怎麼填 |
|------|--------|
| Repository name | 建議跟您 Cloudflare 專案同名，例如 `renmai-shouzha` |
| Description | 用一句話描述產品 |
| Public / Private | 選 **Public** |
| Add a README file | **勾起來** |
| Add .gitignore | 不勾 |
| Choose a license | 不選 |

按 **Create repository**。

### 2.3 看到空的 Repository

成功的話，您會看到：

```
┌───────────────────────────────────────────────┐
│  您的名字 / renmai-shouzha   [Public]          │
│                                                │
│  📄 README.md                                  │
│                                                │
│  # renmai-shouzha                              │
│  結合命理分析的人脈管理工具                       │
└───────────────────────────────────────────────┘
```

---

## 第 3 階段：上傳 index.html（3 分鐘）

### 3.1 點 Add file → Upload files

在 repo 頁面，找到 **「Add file」** 下拉選單 → **Upload files**

或直接前往 `https://github.com/您的名字/renmai-shouzha/upload/main`

### 3.2 拖入檔案

看到拖放區：

```
┌──────────────────────────────────────────┐
│                                           │
│         ⬆                                  │
│  Drag files here to add them to your       │
│  repository                                │
│                                           │
│         or  [choose your files]            │
│                                           │
└──────────────────────────────────────────┘
```

打開電腦上「人脈資料庫」資料夾的 `deploy/` 子資料夾，把 **`index.html`** 拖進去。

### 3.3 寫 Commit Message（**重要**）

拖完檔案後，下方會出現 commit 訊息欄位：

```
┌──────────────────────────────────────────┐
│ Commit changes                            │
├──────────────────────────────────────────┤
│ Commit message                            │
│ ┌──────────────────────────────────────┐ │
│ │ 初版上線：v3 命理引擎 + 雙主題切換      │ │ ← 寫這裡
│ └──────────────────────────────────────┘ │
│                                            │
│ Extended description (optional)            │
│ ┌──────────────────────────────────────┐ │
│ │                                       │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ ⦿ Commit directly to the main branch     │
│ ○ Create a new branch...                  │
│                                            │
│           [Commit changes]                 │
└──────────────────────────────────────────┘
```

**Commit message 寫得好，未來自己找版本才會輕鬆。範例：**

| 情境 | 推薦 message |
|------|-------------|
| 第一次上傳 | `初版上線：v3 命理引擎 + 雙主題切換` |
| 修 bug | `修正：切到西方時不會自動轉成星座分析` |
| 加功能 | `新功能：八字 + 數字易經可同時顯示` |
| 改 UI | `UI 微調：手機版字體加大` |
| 寫文件 | `新增 Cloudflare 部署指南` |

**爛 message 範例**（自己以後也看不懂）：
- ❌ 更新
- ❌ 修改一下
- ❌ asdf
- ❌ 改 bug

選 **「Commit directly to the main branch」**（直接提交到主分支），然後點 **Commit changes**。

### 3.4 確認上傳成功

回到 repo 首頁，應該會看到：

```
┌────────────────────────────────────────────┐
│ 📄 README.md                                │
│ 📄 index.html       初版上線：v3 命理引擎... │
└────────────────────────────────────────────┘
```

**這就是您的第一個版本快照！** 之後不管改成什麼樣，這個版本永遠存在。

---

## 第 4 階段：Cloudflare 連 GitHub（10 分鐘）

⚠️ **重要：** 您現在 Cloudflare 上的舊專案是用「拖檔」建的，**不能改成 Git 整合**。所以要建一個**新的**專案。

### 4.1 進 Cloudflare 建立新專案

1. 前往 https://dash.cloudflare.com → 左側 **Workers & Pages**
2. 點右上角的 **Create**
3. 選 **Pages** 分頁
4. 這次選 **「Connect to Git」**（不是 Direct Upload）

### 4.2 授權 Cloudflare 連 GitHub

第一次會跳出 GitHub 的授權頁：

```
┌─────────────────────────────────────────────┐
│ Authorize Cloudflare Pages                   │
│                                               │
│ Cloudflare Pages would like permission to:   │
│ ☑ Read your account information              │
│ ☑ Access your repositories                   │
│                                               │
│         [Authorize Cloudflare]                │
└─────────────────────────────────────────────┘
```

點 **Authorize Cloudflare**。

然後選擇要授權哪些 repo：
- **Only select repositories** → 勾選 `renmai-shouzha`
- 點 **Install & Authorize**
- 跳回 Cloudflare 後可能要您輸入 GitHub 密碼確認，照做即可

### 4.3 選 Repository

回到 Cloudflare 後，會看到您的 repo 清單：

```
┌────────────────────────────────────────────┐
│  Select a repository                        │
│  ◯ renmai-shouzha      ← 點這個            │
│                                              │
│           [Begin setup]                      │
└────────────────────────────────────────────┘
```

選 `renmai-shouzha` → **Begin setup**。

### 4.4 設定 Build（**最關鍵的一步**）

接下來會問您怎麼「建構」這個專案。因為 v3 是純 HTML 不需要建構，**全部留空或選 None**：

```
┌────────────────────────────────────────────┐
│ Set up builds and deployments               │
├────────────────────────────────────────────┤
│ Project name                                 │
│ ┌──────────────────────────────────────┐   │
│ │ renmai-shouzha                       │   │ ← 想要的網址前綴
│ └──────────────────────────────────────┘   │
│                                              │
│ Production branch                            │
│ ┌──────────────────────────────────────┐   │
│ │ main                                  │   │ ← 保持 main
│ └──────────────────────────────────────┘   │
│                                              │
│ Build settings                               │
│ Framework preset:  [None ▼]                  │ ← 選 None
│ Build command:     ┌──────────────────┐     │
│                    │ (留空)            │     │
│                    └──────────────────┘     │
│ Build output dir:  ┌──────────────────┐     │
│                    │ /                 │     │ ← 填 / 或留空
│                    └──────────────────┘     │
│                                              │
│         [Save and Deploy]                    │
└────────────────────────────────────────────┘
```

**關鍵：**
- **Framework preset**：選 **None**
- **Build command**：留空
- **Build output directory**：填 `/` 或留空

按 **Save and Deploy**。

### 4.5 等待第一次部署

畫面會顯示部署進度，類似：

```
✓ Cloning repository
✓ Building application (skipped, no build command)
✓ Deploying to Cloudflare's network
✓ Success! Your site is live.
```

等 30 秒到 1 分鐘。完成後會給您新網址，類似：

```
https://renmai-shouzha-abc.pages.dev
```

（後面那串 `-abc` 是因為您之前舊專案佔用了名字。下面第 4.7 段會教您換成乾淨網址。）

### 4.6 測試新網址

打開新網址，確認：
- App 正常載入 ✓
- 可以新增人脈 ✓
- 切換東西方都正常 ✓

### 4.7（可選）想要乾淨的 `renmai-shouzha.pages.dev` 網址

如果想拿回原本的好聽網址：

1. 回到 Workers & Pages 首頁
2. 找到舊的拖檔專案（網址是乾淨那個 `renmai-shouzha.pages.dev`）
3. 點進去 → **Settings** → 滑到最底 → **Delete project** → 確認
4. 回到新的 Git 整合專案 → **Settings** → **General** → 改 Project name 為 `renmai-shouzha`
5. （如果改名功能不開放，就刪掉新專案重新建一次，這次名字就會是乾淨的）

⚠️ **刪舊專案後，原本給朋友的網址會立刻失效。** 確認準備好通知朋友再做。

---

## 第 5 階段：確認自動部署運作（5 分鐘）

來測試一次「改 → 推 → 自動上線」的循環。

### 5.1 在 GitHub 網頁直接編輯

1. 進到您的 repo（例如 `github.com/您的名字/renmai-shouzha`）
2. 點 `index.html` 檔案
3. 右上角找到 **鉛筆圖示**（Edit this file）
4. 隨便改一個小地方（例如把標題的 `人脈手札` 改成 `人脈手札 v3.1`）
5. 滑到最下面，寫 commit message：`測試自動部署`
6. 點 **Commit changes**

### 5.2 看 Cloudflare 自動觸發

1. 回到 Cloudflare → Workers & Pages → 您的專案
2. 點 **Deployments** 分頁
3. 應該會看到一個新的部署「進行中」（Building / Deploying）
4. 等 30 秒到 1 分鐘
5. 狀態變成 **Success**

### 5.3 確認網站更新

打開您的網址，確認剛剛改的地方有出現。

✅ 如果有 → 大功告成！
❌ 如果沒有 → 試試 Ctrl+Shift+R 強制刷新瀏覽器快取。還是不行就把 Cloudflare 那邊的 Deployment Log 截圖傳給我看。

### 5.4 把測試改動還原

剛剛只是測試，記得改回來：
1. 回 GitHub → `index.html` → 鉛筆編輯
2. 把 `人脈手札 v3.1` 改回 `人脈手札`
3. Commit message：`還原測試改動`
4. Commit changes
5. 30 秒後 Cloudflare 自動更新

---

## 第 6 階段：日常更新流程

設定都完成後，每次想更新 App 就走這個流程：

```
1. 在 Cowork 跟 Claude 一起改 → workspace 的 index.html 更新
                                          ↓
2. 把新的 index.html 上傳到 GitHub
                                          ↓
3. 寫好 commit message
                                          ↓
4. Commit → 30 秒後 Cloudflare 自動發佈
```

### 6.1 上傳新版的兩種做法

**做法 A：覆蓋整個檔案（適合大改動）**

1. 進 repo 首頁
2. **Add file** → **Upload files**
3. 拖入新的 `index.html`（會自動取代舊的）
4. 寫 commit message
5. Commit changes

**做法 B：在網頁直接編輯（適合小改動）**

1. 進 repo → 點 `index.html`
2. 點鉛筆圖示 編輯
3. 在網頁上改
4. Commit changes

我們在 Cowork 改完通常是做法 A。

### 6.2 寫 Commit Message 的小技巧

每次改完最好分成「一件事 = 一個 commit」，未來找版本才方便。

✅ 好的習慣：
```
修正：切到西方時不會自動轉成星座分析
新增：八字 + 數字易經可同時顯示
UI：手機版字體加大
```

❌ 壞的習慣：
```
更新（不知道更新什麼）
改了很多東西（包山包海）
fix bug（哪個 bug？）
```

---

## 看歷史、回到舊版

### 看每一次提交了什麼

進 repo → 上方 **Commits** 連結 → 列出所有版本

點任何一個 commit 可以看到當時改了哪幾行（綠色=新增、紅色=刪除）。

### 想還原到舊版

**方法 1：下載舊版檔案覆蓋（最簡單）**

1. 進 repo → Commits → 找到想還原的版本
2. 點該 commit 的代號（一串英文數字）
3. 點 **Browse files** 看當時整個 repo 狀態
4. 點 `index.html` → 右上角 **Raw** → 另存新檔
5. 把這個檔案 Upload 回 repo（覆蓋掉現在的）
6. Commit message 寫：`還原到 yyyy-mm-dd 版本`

**方法 2：用 Cloudflare 一鍵 Rollback**

1. Cloudflare → 您的專案 → **Deployments**
2. 找到想還原的部署 → 點右邊 **⋯** → **Rollback to this deployment**
3. 馬上生效

> 💡 方法 2 比較快但只還原網站，GitHub 上的程式碼歷史還是現在的版本。方法 1 才是真的「程式碼也還原」。

---

## 常見問題

### Q1：我已經設好了，舊的拖檔專案還要留著嗎？

可以保留當作備援，但網址重複時就要選一個刪掉。建議用一段時間確認 Git 整合穩定後，再砍舊的。

### Q2：每次更新都要去 GitHub 網頁很麻煩

兩個改善方法：
- 學一下 **GitHub Desktop**（GUI 軟體，點按鈕就能 commit + push）
- 之後再學

不過老實說，網頁直接編輯對小改動真的很快，不一定需要 Desktop。

### Q3：寫錯 commit message 怎麼辦？

GitHub 網頁上**不能直接改舊的 commit message**，這是 git 的限制。但其實沒差，message 是給未來自己看的，下一次寫好就好。

### Q4：可以多人一起改嗎？

可以。請那個人也註冊 GitHub → 您去 repo 的 **Settings → Collaborators → Add people** → 加他帳號。他就可以一起 commit。

### Q5：API Key 不小心 commit 上去了怎麼辦？

Public repo 上的 API Key 等於公開了，建議：
1. 立刻去申請新的 Key
2. 把舊的 Key 在後台廢除
3. （程式碼裡那個 commit 還在歷史，但已經沒用了）

您現在的 v3 沒有寫死 Key（OCR Key 是使用者自己填），所以沒這個風險。

### Q6：可以同步本地資料夾嗎？

可以但需要裝 GitHub Desktop 或學 Git 指令。目前用網頁上傳就夠用了，等之後更新頻繁了再升級。

---

## 設定完成的成就

跑完這份指南，您就擁有：

✅ 雲端永久備份的程式碼（GitHub）
✅ 完整版本歷史（每次 commit 一個快照）
✅ 一鍵自動部署（推上去 30 秒上線）
✅ 一鍵回到舊版（Cloudflare Rollback）
✅ 視覺化差異對比（看每次改了什麼）
✅ 未來協作的基礎（之後想找人合作隨時可以）

從這個時間點開始，您不會再因為改壞了找不回舊版而頭痛。

---

## 卡關時怎麼辦

任何一步畫面跟我描述的不一樣，截圖丟給我，我會看圖告訴您下一步。

GitHub 和 Cloudflare 介面常常微調，但核心路徑（建 repo → 上傳 → Cloudflare 連 Git → 推上去）幾乎不會變。
