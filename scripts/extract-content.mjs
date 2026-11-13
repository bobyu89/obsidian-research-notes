// 用法：node scripts/extract-content.mjs <課程原始碼資料夾>
// 讀取課程原始碼的 data/m1.js … m4.js，去掉逐字稿（notes）後寫成 src/data/lessons.json。
// 課程原始碼含完整逐字稿，不放在這個公開 repo；這支腳本只在本機執行。
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("請提供課程原始碼資料夾，例如：node scripts/extract-content.mjs ../obsidian-course");
  process.exit(1);
}

const MODULES = [
  { key: "m1", id: "start", name: "模組一", label: "起步" },
  { key: "m2", id: "link", name: "模組二", label: "連結" },
  { key: "m3", id: "structure", name: "模組三", label: "結構" },
  { key: "m4", id: "extend", name: "課後延伸", label: "輸出與 AI" },
];

const lessons = [];
for (const m of MODULES) {
  const code = fs.readFileSync(path.join(src, "data", `${m.key}.js`), "utf8");
  const list = new Function(code + "; return LESSONS;")();
  for (const L of list) {
    const slides = L.slides.map((s) => {
      const { notes, shot, ...rest } = s;
      return shot ? { ...rest, replace: shot[2] } : rest;
    });
    const why = slides.find((s) => s.type === "why");
    const cards = slides.filter((s) => s.type === "cards" && /^換你做/.test(s.title)).pop();
    const end = slides.find((s) => s.type === "end");
    lessons.push({
      no: L.no,
      title: L.title,
      module: m.id,
      mod: m.name,
      modName: m.label,
      why: why ? why.q : null,
      practice: cards ? { title: cards.title, a: cards.a, b: cards.b } : null,
      question: end ? end.q : null,
      slides,
    });
  }
}
lessons.sort((a, b) => a.no - b.no);

const out = path.resolve("src/data/lessons.json");
const json = JSON.stringify({ modules: MODULES.map(({ key, ...m }) => m), lessons }, null, 1);
if (/"notes"/.test(json)) throw new Error("輸出仍含逐字稿欄位，已中止");
fs.writeFileSync(out, json + "\n");
console.log(`已寫入 ${out}：${lessons.length} 堂，${lessons.reduce((n, l) => n + l.slides.length, 0)} 張投影片`);
