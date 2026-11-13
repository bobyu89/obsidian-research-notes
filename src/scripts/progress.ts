// 學習進度只存在這台裝置的瀏覽器裡，沒有帳號、沒有伺服器。
// localStorage 可能被停用（無痕視窗、封鎖網站資料），所以每次讀寫都包起來，失敗時頁面照常運作。

import type { Role } from "../data/course";

const ROLE_KEY = "lb:role";
// 每門課各存各的進度與卡片位置
const doneKey = (course: string) => `lb:${course}:done`;
const posKey = (course: string) => `lb:${course}:positions`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 存不進去就算了，這次的狀態只留在畫面上 */
  }
}

export function getDone(course = "obsidian"): Set<number> {
  return new Set(read<number[]>(doneKey(course), []).filter((n) => Number.isInteger(n)));
}

export function setDone(no: number, done: boolean, course = "obsidian") {
  const set = getDone(course);
  if (done) set.add(no);
  else set.delete(no);
  write(doneKey(course), [...set].sort((a, b) => a - b));
  document.dispatchEvent(new CustomEvent("lb:progress"));
  return set;
}

export function nextLesson(total: number, done = getDone()): number | null {
  for (let i = 0; i < total; i++) if (!done.has(i)) return i;
  return null;
}

export function getRole(): Role {
  return read<Role>(ROLE_KEY, "a") === "b" ? "b" : "a";
}

export function setRole(role: Role) {
  write(ROLE_KEY, role);
  document.documentElement.dataset.role = role;
  document.dispatchEvent(new CustomEvent("lb:role"));
}

export type Positions = Record<string, { x: number; y: number }>;
export const getPositions = (course = "obsidian") => read<Positions>(posKey(course), {});
export const setPositions = (p: Positions, course = "obsidian") => write(posKey(course), p);
export const clearPositions = (course = "obsidian") => {
  try {
    localStorage.removeItem(posKey(course));
  } catch {
    /* 同上 */
  }
};
