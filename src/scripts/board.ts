// 學習白板：拖曳移動畫面、縮放、拖動卡片、選取卡片、學習進度。
import { CARD_W, CARD_H } from "../data/course";
import { edgeGeometry } from "../lib/edges";
import { getDone, setDone, nextLesson, getPositions, setPositions, clearPositions } from "./progress";

const app = document.querySelector<HTMLElement>("[data-board]")!;
const canvas = app.querySelector<HTMLElement>("[data-canvas]")!;
const world = app.querySelector<HTMLElement>("[data-world]")!;
const inspector = app.querySelector<HTMLElement>("[data-inspector]")!;
const zoomOut = app.querySelector<HTMLOutputElement>("[data-zoom]")!;
const cards = [...world.querySelectorAll<HTMLElement>(".card")];
const cardById = new Map(cards.map((c) => [c.dataset.node!, c]));
const lessonCount = cards.filter((c) => c.dataset.no !== undefined).length;
// 這張白板屬於哪門課、畫布多大、要不要記錄進度，都寫在頁面上
const course = app.dataset.course ?? "obsidian";
const tracksProgress = app.dataset.progress !== "off";
const embedded = app.dataset.embed !== undefined;
const BOARD_W = Number(world.dataset.w);
const BOARD_H = Number(world.dataset.h);

const MIN = 0.25;
const MAX = 1.6;
const view = { x: 0, y: 0, k: 1 };
const pos = new Map<string, { x: number; y: number }>();
let selected: string | null = null;

// ───────── 卡片位置與連線 ─────────

function loadPositions() {
  const saved = getPositions(course);
  for (const c of cards) {
    const id = c.dataset.node!;
    const home = { x: Number(c.dataset.x), y: Number(c.dataset.y) };
    const p = saved[id];
    pos.set(id, p && Number.isFinite(p.x) && Number.isFinite(p.y) ? { x: p.x, y: p.y } : home);
    place(id);
  }
}

function place(id: string) {
  const p = pos.get(id)!;
  const c = cardById.get(id)!;
  c.style.left = `${p.x}px`;
  c.style.top = `${p.y}px`;
}

function drawEdges(only?: string) {
  world.querySelectorAll<SVGPathElement>("[data-edge]").forEach((path) => {
    const { from, to, edge } = path.dataset;
    if (only && from !== only && to !== only) return;
    const g = edgeGeometry(pos.get(from!)!, pos.get(to!)!, CARD_W, CARD_H, Number(edge) + 1);
    path.setAttribute("d", g.d);
    const label = world.querySelector<HTMLElement>(`[data-edge-label="${edge}"]`);
    if (label) {
      const at = g.at(Number(label.dataset.at) || 0.5);
      label.style.left = `${at.x}px`;
      label.style.top = `${at.y}px`;
    }
  });
}

// ───────── 畫面移動與縮放 ─────────

function apply() {
  world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`;
  zoomOut.textContent = `${Math.round(view.k * 100)}%`;
}

function zoomAt(cx: number, cy: number, k: number) {
  const next = Math.max(MIN, Math.min(MAX, k));
  view.x = cx - ((cx - view.x) / view.k) * next;
  view.y = cy - ((cy - view.y) / view.k) * next;
  view.k = next;
  apply();
}

function fitAll() {
  const pad = 28;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  view.k = Math.max(MIN, Math.min(1, (w - pad * 2) / BOARD_W, (h - pad * 2) / BOARD_H));
  view.x = (w - BOARD_W * view.k) / 2;
  view.y = (h - BOARD_H * view.k) / 2;
  apply();
}

const narrow = window.matchMedia("(max-width: 900px)");

/** 把卡片帶到畫面中央。小螢幕上內容面板會從下方蓋上來，所以卡片要停在上方。 */
function centerOn(id: string, k = view.k, upper = false) {
  const p = pos.get(id);
  if (!p) return;
  view.k = k;
  view.x = canvas.clientWidth / 2 - (p.x + CARD_W / 2) * k;
  view.y = canvas.clientHeight * (upper ? 0.16 : 0.5) - (p.y + CARD_H / 2) * k;
  apply();
}

function glideTo(id: string, k = Math.max(view.k, 0.7), upper = false) {
  world.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
  centerOn(id, k, upper);
  window.setTimeout(() => (world.style.transition = ""), 520);
}

/** 第一次進來：看得到全貌就看全貌；螢幕太小就停在下一堂。 */
function initialView() {
  fitAll();
  if (view.k < 0.42) {
    const next = tracksProgress ? nextLesson(lessonCount, getDone(course)) : 0;
    centerOn(next === null ? "l0" : `l${next}`, 0.62, true);
  }
}

const pointers = new Map<number, { x: number; y: number }>();
let pinch: { d: number; k: number } | null = null;
let drag: { id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;
let pan: { sx: number; sy: number; ox: number; oy: number } | null = null;

const local = (e: PointerEvent | WheelEvent) => {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};

canvas.addEventListener("pointerdown", (e) => {
  if ((e.target as HTMLElement).closest(".board-tools")) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.k };
    drag = null;
    pan = null;
    return;
  }
  const card = (e.target as HTMLElement).closest<HTMLElement>(".card");
  if (card && e.button === 0) {
    const p = pos.get(card.dataset.node!)!;
    drag = { id: card.dataset.node!, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false };
  } else {
    pan = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
    canvas.classList.add("is-panning");
  }
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const r = canvas.getBoundingClientRect();
    zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, (pinch.k * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d);
    return;
  }
  if (drag) {
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    cardById.get(drag.id)!.classList.add("is-dragging");
    pos.set(drag.id, { x: drag.ox + dx / view.k, y: drag.oy + dy / view.k });
    place(drag.id);
    drawEdges(drag.id);
  } else if (pan) {
    view.x = pan.ox + e.clientX - pan.sx;
    view.y = pan.oy + e.clientY - pan.sy;
    apply();
  }
});

function release(e: PointerEvent) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (drag) {
    const card = cardById.get(drag.id)!;
    card.classList.remove("is-dragging");
    if (drag.moved) setPositions(Object.fromEntries(pos), course);
    else {
      select(drag.id);
      if (narrow.matches) glideTo(drag.id, view.k, true);
    }
    drag = null;
  }
  if (pan) {
    const still = Math.hypot(e.clientX - pan.sx, e.clientY - pan.sy) < 5;
    pan = null;
    canvas.classList.remove("is-panning");
    if (still && e.target === canvas) select(null);
  }
}
canvas.addEventListener("pointerup", release);
canvas.addEventListener("pointercancel", release);

canvas.addEventListener(
  "wheel",
  (e) => {
    // 嵌在課程首頁時，滾輪留給頁面捲動；要縮放就按住 Ctrl，或用工具列
    if (embedded && !e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const p = local(e);
      zoomAt(p.x, p.y, view.k * Math.exp(-e.deltaY * 0.01));
    } else {
      view.x -= e.deltaX;
      view.y -= e.deltaY;
      apply();
    }
  },
  { passive: false },
);

canvas.addEventListener("keydown", (e) => {
  if (e.target !== canvas) return;
  const step = 80;
  const cx = canvas.clientWidth / 2;
  const cy = canvas.clientHeight / 2;
  if (e.key === "ArrowLeft") view.x += step;
  else if (e.key === "ArrowRight") view.x -= step;
  else if (e.key === "ArrowUp") view.y += step;
  else if (e.key === "ArrowDown") view.y -= step;
  else if (e.key === "+" || e.key === "=") return zoomAt(cx, cy, view.k * 1.2);
  else if (e.key === "-") return zoomAt(cx, cy, view.k / 1.2);
  else if (e.key === "0") return fitAll();
  else return;
  e.preventDefault();
  apply();
});

app.querySelectorAll<HTMLButtonElement>("[data-tool]").forEach((b) => {
  b.addEventListener("click", () => {
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    if (b.dataset.tool === "in") zoomAt(cx, cy, view.k * 1.25);
    else if (b.dataset.tool === "out") zoomAt(cx, cy, view.k / 1.25);
    else if (b.dataset.tool === "fit") fitAll();
    else if (b.dataset.tool === "reset") {
      clearPositions(course);
      loadPositions();
      drawEdges();
      fitAll();
    }
  });
});

// ───────── 選取 ─────────

function select(id: string | null) {
  selected = id;
  app.classList.toggle("has-selection", id !== null);
  cards.forEach((c) => {
    const on = c.dataset.node === id;
    c.classList.toggle("is-selected", on);
    c.setAttribute("aria-pressed", String(on));
  });
  inspector.querySelectorAll<HTMLElement>("[data-panel]").forEach((p) => {
    p.hidden = p.dataset.panel !== (id ?? "intro");
  });
  world.querySelectorAll<HTMLElement>("[data-from]").forEach((el) => {
    el.classList.toggle("is-related", id !== null && (el.dataset.from === id || el.dataset.to === id));
  });
  inspector.scrollTop = 0;
}

cards.forEach((c) => {
  // 滑鼠與觸控的選取在 pointerup 處理；這裡只接鍵盤的 Enter／空白鍵
  c.addEventListener("click", (e) => {
    if (e.detail === 0) select(c.dataset.node!);
  });
  // 鍵盤走到畫面外的卡片時，把它帶進畫面
  c.addEventListener("focus", () => {
    if (!c.matches(":focus-visible")) return;
    const r = c.getBoundingClientRect();
    const v = canvas.getBoundingClientRect();
    if (r.left < v.left || r.right > v.right || r.top < v.top || r.bottom > v.bottom) centerOn(c.dataset.node!);
  });
});
inspector.querySelector("[data-inspector-close]")!.addEventListener("click", () => {
  const id = selected;
  select(null);
  if (id) cardById.get(id)?.focus();
});
inspector.querySelectorAll<HTMLButtonElement>("[data-goto]").forEach((b) => {
  b.addEventListener("click", () => {
    select(b.dataset.goto!);
    glideTo(b.dataset.goto!, Math.max(view.k, narrow.matches ? 0.62 : 0.7), narrow.matches);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && selected) {
    const id = selected;
    select(null);
    cardById.get(id)?.focus();
  }
});

// ───────── 進度 ─────────

function paintProgress() {
  if (!tracksProgress) return;
  const done = getDone(course);
  const next = nextLesson(lessonCount, done);
  cards.forEach((c) => {
    if (c.dataset.no === undefined) return;
    const no = Number(c.dataset.no);
    c.classList.toggle("is-done", done.has(no));
    c.classList.toggle("is-next", no === next);
    const text = c.querySelector("[data-state-text]");
    if (text) text.textContent = done.has(no) ? "，已學完" : no === next ? "，接著學這一堂" : "";
  });
  app.querySelectorAll<HTMLInputElement>("[data-done]").forEach((box) => {
    box.checked = done.has(Number(box.dataset.done));
  });
  app.querySelectorAll<HTMLElement>("[data-list-item]").forEach((li) => {
    li.classList.toggle("is-done", done.has(Number(li.dataset.listItem)));
  });
  app.querySelector<HTMLElement>("[data-progress-text]")!.textContent = `學完 ${done.size} / ${lessonCount} 堂`;
  app.querySelector<HTMLElement>("[data-progress-bar]")!.style.width = `${(done.size / lessonCount) * 100}%`;
  const link = app.querySelector<HTMLAnchorElement>("[data-next-link]")!;
  const base = link.getAttribute("href")!.replace(/\d+\/$/, "");
  if (next === null) {
    link.textContent = `${lessonCount} 堂都學完了，再看一次第 0 堂`;
    link.href = `${base}0/`;
  } else {
    link.textContent = done.size ? `接著學第 ${next} 堂` : "開始第 0 堂";
    link.href = `${base}${next}/`;
  }
}

app.querySelectorAll<HTMLInputElement>("[data-done]").forEach((box) => {
  box.addEventListener("change", () => setDone(Number(box.dataset.done), box.checked, course));
});
document.addEventListener("lb:progress", paintProgress);

// ───────── 檢視切換 ─────────

app.querySelectorAll<HTMLButtonElement>("[data-view-btn]").forEach((b) => {
  b.addEventListener("click", () => {
    app.dataset.view = b.dataset.viewBtn;
    app.querySelectorAll<HTMLButtonElement>("[data-view-btn]").forEach((x) => {
      x.setAttribute("aria-pressed", String(x === b));
    });
    if (b.dataset.viewBtn === "board") apply();
  });
});

loadPositions();
drawEdges();
select(null);
paintProgress();
initialView();

// 網址帶 #l3 這類錨點時，直接打開那張卡片
function openFromHash() {
  const wanted = location.hash.slice(1);
  if (!cardById.has(wanted)) return;
  select(wanted);
  centerOn(wanted, Math.max(view.k, narrow.matches ? 0.62 : 0.7), narrow.matches);
}
openFromHash();
window.addEventListener("hashchange", openFromHash);
