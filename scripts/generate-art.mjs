// 用法：node scripts/generate-art.mjs <looseleaf 原始碼資料夾>
// 用 kevintngo/looseleaf（MIT）的繪圖程式，把選定的貼紙與塗鴉畫成獨立的 SVG 檔，放進 public/art/，
// 並把尺寸清單寫進 src/data/art.json。
// looseleaf 的原始碼不放在這個 repo；要增減貼紙時，先 git clone 它，再執行這支腳本。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build } from "rolldown";

const src = process.argv[2] && path.resolve(process.argv[2]);
if (!src) {
  console.error("請提供 looseleaf 原始碼資料夾，例如：node scripts/generate-art.mjs ../looseleaf");
  process.exit(1);
}

const DOODLES = [
  "star", "sparkle", "sparkle-trio", "light-bulb", "pencil", "book", "key", "sprout", "paper-plane", "eye", "cup",
  "arrow-swoop", "arrow-loop", "arrow-bounce", "underline-scribble", "underline-flourish", "asterisk-burst",
  "exclaim-burst", "confetti", "dotted-trail", "corner-flourish", "squiggle-border", "heart", "smiley",
];
const STICKERS = [
  "done", "new", "wip", "ok", "wow", "notebook", "laptop-open", "highlighter", "magnifier", "pencil-cup", "tape-roll",
  "desk-lamp", "coffee-to-go", "potted-plant", "cat-loaf", "owl", "thinking-face", "thumbs-up", "party-popper",
  "stamp-approved", "stamp-draft", "stamp-new", "a-plus", "hundred", "first-place", "rocket", "hand-point-right",
  "arrow-curved", "scribble-circle", "question-badge", "exclamation-badge", "sunflower", "envelope-heart",
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "art-"));
const entry = path.join(tmp, "entry.ts");
fs.writeFileSync(
  entry,
  `export { doodles } from "@/lib/ink/art/doodles"
export { stickers } from "@/lib/ink/art/stickers"
export { drawSkeleton, renderSticker } from "@/lib/ink/art-draw"
`,
);
const out = path.join(tmp, "art.mjs");
await build({
  input: entry,
  platform: "node",
  resolve: { alias: { "@": path.join(src, "src") } },
  output: { file: out, format: "esm" },
  logLevel: "silent",
});
const ll = await import(out);

// looseleaf 的圖用 CSS 變數上色，並共用一組紙紋遮罩。這裡輸出成獨立檔案：
// 顏色換成實際色碼，遮罩拿掉（遮罩是一包約 100 KB 的點陣圖，每頁都要帶，不划算）。
const COLORS = {
  "--ll-ink": "#2a2420", "--ll-ink-soft": "#4a423b", "--ll-ink-you": "#2c4f9e", "--ll-pencil": "#6b6660",
  "--ll-pencil-mark": "#8e887f", "--ll-paper": "#f8f5ee", "--ll-photo": "#fffdf6", "--ll-kraft": "#dcc8a3",
  "--ll-desk": "#a8c8bb", "--ll-hi": "#f8dc4c", "--ll-marker": "#df6b3c", "--ll-red": "#c2412d",
  "--ll-green": "#3b7a4b", "--ll-tomato": "#e8483a", "--ll-tangerine": "#f59a2f", "--ll-lemon": "#fbd63a",
  "--ll-grass": "#5db85c", "--ll-teal": "#2fb1a3", "--ll-sky": "#4aa8e8", "--ll-grape": "#8f6fd6",
  "--ll-bubblegum": "#f38bb8", "--ll-blend": "multiply",
};
const standalone = (r) => {
  const body = r.svg
    .replace(/ mask="url\(#ll-(?:marker|felt)-\d+\)"/g, "")
    .replace(/var\((--ll-[a-z0-9-]+)(?:,[^)]*)?\)/g, (m, name) => {
      if (!COLORS[name]) throw new Error(`沒有對應的顏色：${name}`);
      return COLORS[name];
    });
  if (/url\(#ll-(?:marker|felt)/.test(body) || body.includes("var(--")) throw new Error("還有沒處理的參照");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.w} ${r.h}" width="${r.w}" height="${r.h}">${body}</svg>\n`;
};

const dir = path.resolve("public/art");
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const manifest = { doodle: {}, sticker: {} };
let bytes = 0;
const save = (kind, name, r) => {
  const svg = standalone(r);
  fs.writeFileSync(path.join(dir, `${kind}-${name}.svg`), svg);
  manifest[kind][name] = { w: Math.round(r.w), h: Math.round(r.h) };
  bytes += Buffer.byteLength(svg);
};
for (const name of DOODLES) {
  const def = ll.doodles[name];
  if (!def) throw new Error(`找不到塗鴉：${name}`);
  save("doodle", name, ll.drawSkeleton(def, 96, name, { tone: "doodle", kind: "doodle" }));
}
for (const name of STICKERS) {
  const def = ll.stickers[name];
  if (!def) throw new Error(`找不到貼紙：${name}`);
  save("sticker", name, ll.renderSticker(def, 96, name, { idPrefix: `ll-${name}` }));
}
fs.writeFileSync(
  path.join(dir, "README.md"),
  "# 貼紙與塗鴉\n\n這個資料夾的 SVG 由 `scripts/generate-art.mjs` 用 [kevintngo/looseleaf](https://github.com/kevintngo/looseleaf) 的繪圖程式產生，MIT 授權，Copyright (c) 2026 Looseleaf contributors。請不要手動修改，要增減請改腳本裡的清單後重新產生。\n",
);
fs.writeFileSync(path.resolve("src/data/art.json"), JSON.stringify(manifest, null, 1) + "\n");
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`已寫入 public/art/：${DOODLES.length} 個塗鴉、${STICKERS.length} 張貼紙，共 ${Math.round(bytes / 1024)} KB`);
