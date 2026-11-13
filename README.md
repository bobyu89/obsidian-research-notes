# Obsidian 研究筆記課

「Obsidian 研究筆記課」的學習網站，給護理領域的研究生與老師。整門課攤開成一張白板：每一堂是一張卡片，前後呼應的地方畫成連線。

網址：https://bobyu89.github.io/obsidian-research-notes/

## 頁面

| 路徑 | 內容 |
|---|---|
| `/` | 課程介紹：兩種身分、四個階段、嵌入的白板、課程目錄、直播與工作坊 |
| `/board/` | 學習白板：可拖曳縮放，點卡片看內容，勾選學完 |
| `/lessons/0/` … `/16/` | 單堂頁：簡報、A/B 練習卡、留給學員的問題 |

## 開發

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

需要 Node 22 以上。

## 常見修改

**補上直播的 Google Meet 連結、日期**：改 `src/data/site.ts` 的 `obsidianCourse`。欄位留空時，網站顯示「即將公布」。

**調整白板的卡片位置、連線與標籤**：改 `src/data/course.ts` 下半部的 `rows`、`boardNodes`、`boardEdges`。

**更新課程內容**：課程原始碼（`data/m1.js` … `m4.js`）含完整逐字稿，不放在這個公開 repo。在本機執行下面的指令，會產生去掉逐字稿的 `src/data/lessons.json`：

```bash
node scripts/extract-content.mjs <課程原始碼資料夾>
```

**增減貼紙與塗鴉**：先取得 looseleaf 的原始碼，修改 `scripts/generate-art.mjs` 裡的清單，再重新產生 `public/art/`：

```bash
git clone --depth 1 https://github.com/kevintngo/looseleaf.git ../looseleaf
```

```bash
node scripts/generate-art.mjs ../looseleaf
```

## 資料與隱私

- 學習進度、身分選擇、白板卡片位置都存在學員自己瀏覽器的 localStorage，沒有後端，沒有登入。換裝置或清除網站資料就會重來。
- 逐字稿不在這個 repo。pptx 的備忘稿含逐字稿，所以也不提供下載。
- 示範用的文獻 A–D、學生甲、meeting 紀錄都是虛構的示範資料。

## 部署

`.github/workflows/deploy.yml` 會在推送到 `main` 時建置並發布到 GitHub Pages。第一次使用前，要到 repo 的 Settings → Pages，把 Source 設為 **GitHub Actions**。

## 設計

手繪紙張風，視覺參考 [kevintngo/looseleaf](https://github.com/kevintngo/looseleaf)，字型 Kevin Sans 與貼紙、塗鴉取自該專案（MIT）。介面依 [impeccable](https://impeccable.style/) 的流程製作，skill 裝在 `.claude/skills/impeccable/`。產品背景在 `PRODUCT.md`，視覺規範在 `DESIGN.md`。
