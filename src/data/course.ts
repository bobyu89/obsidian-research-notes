import data from "./lessons.json";

export type Role = "a" | "b";

export interface PracticeCard {
  tag: string;
  head: string;
  lines: string[];
}

export interface Lesson {
  no: number;
  title: string;
  module: string;
  mod: string;
  modName: string;
  why: string | null;
  practice: { title: string; a: PracticeCard; b: PracticeCard } | null;
  question: string | null;
  slides: Record<string, unknown>[];
}

export const lessons = data.lessons as unknown as Lesson[];
export const modules = data.modules as { id: string; name: string; label: string }[];

export const lessonsOf = (moduleId: string) => lessons.filter((l) => l.module === moduleId);

/** 四個階段。時間分配來自已定案的課程設計。 */
export const stages = [
  {
    id: "live",
    name: "線上直播",
    length: "90 分鐘",
    job: "想學",
    summary: "聽講者的故事，先看終點長什麼樣子，全員一起安裝、寫下第一則筆記。",
  },
  {
    id: "core",
    name: "預錄核心",
    length: "第 0–12 堂",
    job: "會用",
    summary: "每堂 10 到 15 分鐘，一次學一個動作。影片共用，練習分研究生與老師兩張卡。",
  },
  {
    id: "workshop",
    name: "實體工作坊",
    length: "3 小時",
    job: "用在自己身上",
    summary: "不重講功能。帶自己的文獻來，做出自己的成品，師生互看。",
  },
  {
    id: "extend",
    name: "預錄延伸",
    length: "第 13–16 堂",
    job: "輸出與 AI",
    summary: "把筆記組成文字，讓 AI 讀你的筆記，最後談隱私與查核。",
  },
] as const;

export const liveFlow: [string, number][] = [
  ["講者的故事：筆記怎麼亂、後來怎麼解決", 10],
  ["終點先看：「研究生的一週」與「老師的一週」", 15],
  ["全員一起安裝、建立 vault、寫下第一則筆記", 20],
  ["匿名投票：身分，以及最想解決的筆記問題", 10],
  ["問答", 25],
  ["說明預錄怎麼看、實體課要帶哪些文獻", 10],
];

export const workshopFlow: [string, number][] = [
  ["開場：每人一句話說自己的筆記困境", 15],
  ["排障站：依身分分桌，處理預錄卡關的問題", 20],
  ["ZotMax 一篇驗證：全員同步成功一篇文獻", 35],
  ["做自己的成品：研究生做文獻矩陣，老師做指導追蹤看板", 45],
  ["交叉分享：師生互看成果", 20],
  ["分桌深化：主題來自直播投票結果", 35],
  ["收尾：下一步", 10],
];

/** 每堂預錄固定的五段。 */
export const lessonShape = [
  ["學員會問的「為什麼」", "先回答你心裡的疑問，再開始教。"],
  ["臨床比喻", "用護理人員都熟的情境，說明這個功能在做什麼。"],
  ["示範一個動作", "一堂只學一個動作，新術語不超過兩個。"],
  ["換你做", "按暫停練習。研究生做 A 卡，老師做 B 卡。"],
  ["想更懂", "功能背後的道理，最後留一個問題給你。"],
] as const;

/** 兩種身分。內容取自第 0 堂的對照卡與工作坊的成品安排。 */
export const roles: Record<Role, { name: string; scene: string[]; makes: string; makesNote: string }> = {
  a: {
    name: "研究生",
    scene: ["期末報告前一晚，想引用一篇讀過的文獻", "記得結論，卻想不起作者和年份", "只好重新搜尋、重新讀一次"],
    makes: "文獻矩陣",
    makesNote: "每篇文獻一列，研究設計、樣本數、閱讀狀態各一欄，還能切成看板。",
  },
  b: {
    name: "老師",
    scene: ["meeting 前五分鐘，學生已經在門口", "想不起上次建議他改哪一段", "只好請學生自己先報告一次"],
    makes: "指導追蹤看板",
    makesNote: "每位學生一張卡，從選題到學位口試分欄，點進去就是歷次 meeting 紀錄。",
  },
};

/**
 * 選修工具：不在 17 堂課裡，學完對應的課之後可以自己試。
 * 說明依各專案 GitHub 頁面撰寫（2026-11 查閱），版本需求以專案頁面為準。
 */
export const tools = [
  {
    id: "notebook-navigator",
    name: "Notebook Navigator",
    kind: "Obsidian 社群外掛",
    url: "https://github.com/johansan/notebook-navigator",
    after: [7, 10],
    summary: "把 Obsidian 左邊的檔案清單換成兩欄式的瀏覽器：一欄是資料夾、標籤與屬性，一欄是筆記清單，清單上直接看得到每則筆記的開頭幾行。",
    why: "第 7 堂學了資料夾、標籤、連結怎麼分工，第 10 堂學了搜尋。筆記變多之後，這個外掛讓你用同一個畫面在資料夾與標籤之間切換，還能把常用的筆記釘選起來。",
    steps: ["設定 → 社群外掛，開啟社群外掛", "按「瀏覽」，搜尋 Notebook Navigator", "安裝並啟用"],
    note: "需要較新版的 Obsidian，安裝前先看外掛頁面標示的最低版本。先在「練習用」vault 試。",
  },
  {
    id: "obsidian-skills",
    name: "Obsidian Skills",
    kind: "給 AI agent 用的技能包",
    url: "https://github.com/obsidianmd/obsidian-skills",
    after: [15, 16],
    summary: "Obsidian 官方提供的一組 agent skills，教 Claude Code 這類 AI agent 看懂並寫出 Obsidian 的格式：Markdown 的連結與屬性、Bases 的 .base 檔、Canvas 的 .canvas 檔。",
    why: "第 15 堂談讓 AI 讀你的筆記。裝了這組技能，AI 幫你整理筆記時會照 Obsidian 的寫法來，例如用雙中括號建立連結、把欄位寫進 Properties，而不是寫成一般的 Markdown。",
    steps: ["先確定你已經在用 Claude Code 或其他支援 skills 的 agent", "照專案頁面的安裝說明加入技能", "請 AI 在「練習用」vault 建一則有連結與屬性的筆記，檢查格式對不對"],
    note: "這是進階選修，需要會用終端機。動手前先看完第 16 堂：哪些筆記不該交給 AI。",
  },
  {
    id: "kepano-vault",
    name: "kepano 的 vault 範本",
    kind: "可以下載來看的 vault",
    url: "https://github.com/kepano/kepano-obsidian",
    after: [7, 9, 12],
    summary: "kepano 公開的個人 vault 範本，作者形容是「由下而上」的筆記方式。裡面有 Categories、Clippings、Daily、Notes、References、Templates 等資料夾，可以直接打開來看別人怎麼安排。",
    why: "你已經學會資料夾與標籤的分工（第 7 堂）、範本（第 9 堂）和 Bases（第 11、12 堂）。這時候看一個完整的 vault，比較看得出哪些做法值得搬回自己的筆記。作者自己也說這套做法不是教條，挑喜歡的部分用就好。",
    steps: ["到專案頁面下載 zip 並解壓縮", "在 Obsidian 選「開啟資料夾作為儲存庫」，指向解壓縮後的資料夾", "逛一圈，把想學的做法記成一則筆記，再回自己的 vault 試"],
    note: "把它當成另一個獨立的 vault 打開，不要把檔案倒進你自己的 vault。選單文字以你的畫面為準。",
  },
] as const;

// ───────────────────────── 白板 ─────────────────────────

export interface BoardNode {
  id: string;
  kind: "lesson" | "event" | "tool";
  no?: number;
  title: string;
  sub: string;
  x: number;
  y: number;
}

export interface BoardEdge {
  from: string;
  to: string;
  /** 有 label 的是跨堂呼應，沒有的是單純的上課順序。 */
  label?: string;
  /** 標籤放在連線的哪個位置，0 是起點、1 是終點。 */
  labelAt?: number;
}

export const CARD_W = 236;
export const CARD_H = 124;

const rows: Record<string, { x: number; y: number }> = {
  start: { x: 390, y: 80 },
  link: { x: 390, y: 350 },
  structure: { x: 110, y: 620 },
  extend: { x: 390, y: 900 },
};
const wobble = [0, 20, -6, 14, -10];

const lessonNodes: BoardNode[] = modules.flatMap((m) =>
  lessonsOf(m.id).map((l, i) => ({
    id: `l${l.no}`,
    kind: "lesson" as const,
    no: l.no,
    title: l.title,
    sub: l.why ?? "",
    x: rows[m.id].x + i * 280,
    y: rows[m.id].y + wobble[i % wobble.length],
  })),
);

export const boardNodes: BoardNode[] = [
  { id: "live", kind: "event", title: "線上直播", sub: "90 分鐘，全員一起安裝", x: 60, y: 86 },
  ...lessonNodes,
  { id: "workshop", kind: "event", title: "實體工作坊", sub: "3 小時，做自己的成品", x: 60, y: 906 },
  { id: "notebook-navigator", kind: "tool", title: "Notebook Navigator", sub: "選修外掛", x: 1660, y: 372 },
  { id: "kepano-vault", kind: "tool", title: "kepano 的 vault 範本", sub: "選修：看別人怎麼排", x: 1660, y: 636 },
  { id: "obsidian-skills", kind: "tool", title: "Obsidian Skills", sub: "選修：給 AI 的技能包", x: 1660, y: 916 },
];

/** 白板上的分區外框，依模組包住卡片。 */
export const boardRegions = modules.map((m) => {
  const ns = lessonNodes.filter((n) => lessons[n.no!].module === m.id);
  const x0 = Math.min(...ns.map((n) => n.x)) - 34;
  const y0 = Math.min(...ns.map((n) => n.y)) - 62;
  const x1 = Math.max(...ns.map((n) => n.x)) + CARD_W + 34;
  const y1 = Math.max(...ns.map((n) => n.y)) + CARD_H + 34;
  return { id: m.id, label: `${m.name}　${m.label}`, x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
});

export const BOARD_W = 1950;
export const BOARD_H = 1100;

const sequence: BoardEdge[] = [];
const order = ["live", ...lessons.slice(0, 13).map((l) => `l${l.no}`), "workshop", ...lessons.slice(13).map((l) => `l${l.no}`)];
const labelled: Record<string, [string, number]> = {
  "l3>l4": ["「哪個詞值得有自己的筆記」是這堂練習的起點", 0.3],
  "l7>l8": ["用標籤記的狀態，改成欄位", 0.76],
  "l12>workshop": ["帶三到五篇文獻來", 0.5],
};
for (let i = 0; i < order.length - 1; i++) {
  const key = `${order[i]}>${order[i + 1]}`;
  sequence.push({ from: order[i], to: order[i + 1], label: labelled[key]?.[0], labelAt: labelled[key]?.[1] });
}

export const boardEdges: BoardEdge[] = [
  ...sequence,
  { from: "l0", to: "l10", label: "回頭找那則「找不到的筆記」", labelAt: 0.84 },
  { from: "l2", to: "l16", label: "打開「我的第一則筆記」", labelAt: 0.5 },
  { from: "l4", to: "l6", label: "怎麼從概念走回文獻" },
  { from: "l7", to: "notebook-navigator", label: "筆記多了以後" },
  { from: "l12", to: "kepano-vault", label: "看別人怎麼排" },
  { from: "l16", to: "obsidian-skills", label: "想讓 AI 動手整理" },
];
