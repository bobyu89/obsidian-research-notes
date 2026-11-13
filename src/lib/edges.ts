import { CARD_W, CARD_H } from "../data/course";

export interface Pt {
  x: number;
  y: number;
}

/**
 * 兩張卡片之間的連線。回傳 SVG path 與標籤位置。
 * 同一列相鄰：右邊出、左邊進。不同列：下方出、上方進。同一列但隔著卡片：從上方繞過去。
 */
/** 固定種子的亂數，伺服器與瀏覽器畫出同一筆。 */
function rng(seed: number) {
  let t = (seed + 1) * 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 把一串點連成手畫的線：每個點稍微偏一點，再用平滑曲線接起來。 */
function handDrawn(points: Pt[], seed: number, wobble = 2.4) {
  const rand = rng(seed);
  const pts = points.map((p, i) => {
    if (i === 0 || i === points.length - 1) return p;
    const prev = points[i - 1];
    const next = points[i + 1];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const off = (rand() - 0.5) * 2 * wobble;
    return { x: p.x + (-dy / len) * off, y: p.y + (dx / len) * off };
  });
  const r = (n: number) => Math.round(n * 10) / 10;
  let d = `M${r(pts[0].x)} ${r(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${r(p1.x + (p2.x - p0.x) / 6)} ${r(p1.y + (p2.y - p0.y) / 6)} ${r(p2.x - (p3.x - p1.x) / 6)} ${r(p2.y - (p3.y - p1.y) / 6)} ${r(p2.x)} ${r(p2.y)}`;
  }
  return d;
}

export function edgeGeometry(a: Pt, b: Pt, w = CARD_W, h = CARD_H, seed?: number) {
  const ac = { x: a.x + w / 2, y: a.y + h / 2 };
  const bc = { x: b.x + w / 2, y: b.y + h / 2 };
  const dx = bc.x - ac.x;
  const dy = bc.y - ac.y;
  let p0: Pt, p1: Pt, p2: Pt, p3: Pt;

  if (Math.abs(dy) > h * 0.9) {
    const s = Math.sign(dy);
    p0 = { x: ac.x, y: ac.y + (s * h) / 2 };
    p3 = { x: bc.x, y: bc.y - (s * h) / 2 };
    const k = Math.max(56, Math.abs(p3.y - p0.y) * 0.5);
    p1 = { x: p0.x, y: p0.y + s * k };
    p2 = { x: p3.x, y: p3.y - s * k };
  } else if (Math.abs(dx) > w * 1.9) {
    p0 = { x: ac.x + Math.sign(dx) * w * 0.2, y: a.y };
    p3 = { x: bc.x - Math.sign(dx) * w * 0.2, y: b.y };
    const lift = 78;
    p1 = { x: p0.x + dx * 0.12, y: Math.min(p0.y, p3.y) - lift };
    p2 = { x: p3.x - dx * 0.12, y: Math.min(p0.y, p3.y) - lift };
  } else {
    const s = Math.sign(dx) || 1;
    p0 = { x: ac.x + (s * w) / 2, y: ac.y };
    p3 = { x: bc.x - (s * w) / 2, y: bc.y };
    const k = Math.max(24, Math.abs(p3.x - p0.x) * 0.5);
    p1 = { x: p0.x + s * k, y: p0.y };
    p2 = { x: p3.x - s * k, y: p3.y };
  }

  const r = (n: number) => Math.round(n * 10) / 10;
  const at = (t: number) => {
    const u = 1 - t;
    return {
      x: r(u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x),
      y: r(u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y),
    };
  };
  let d = `M${r(p0.x)} ${r(p0.y)} C${r(p1.x)} ${r(p1.y)} ${r(p2.x)} ${r(p2.y)} ${r(p3.x)} ${r(p3.y)}`;
  if (seed !== undefined) {
    const steps = Math.max(4, Math.min(14, Math.round(Math.hypot(p3.x - p0.x, p3.y - p0.y) / 70)));
    d = handDrawn(
      Array.from({ length: steps + 1 }, (_, i) => at(i / steps)),
      seed,
    );
  }
  return { d, mid: at(0.5), at };
}
