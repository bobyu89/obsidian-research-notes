// 單堂頁：簡報翻頁與「學完了」的勾選。各門課共用。
import { getDone, setDone } from "./progress";

// 簡報：1920×1080 的舞台等比縮進容器
const deck = document.querySelector<HTMLElement>("[data-deck]")!;
const stage = deck.querySelector<HTMLElement>("#stage")!;
const scenes = [...stage.querySelectorAll<HTMLElement>(".scene")];
const current = document.querySelector<HTMLElement>("[data-deck-current]")!;
const prevBtn = document.querySelector<HTMLButtonElement>("[data-deck-prev]")!;
const nextBtn = document.querySelector<HTMLButtonElement>("[data-deck-next]")!;
let index = 0;

const fit = () => {
  const k = Math.min(deck.clientWidth / 1920, deck.clientHeight / 1080);
  stage.style.transform = `scale(${k})`;
  stage.style.left = `${(deck.clientWidth - 1920 * k) / 2}px`;
  stage.style.top = `${(deck.clientHeight - 1080 * k) / 2}px`;
};
const show = (i: number) => {
  index = Math.max(0, Math.min(scenes.length - 1, i));
  scenes.forEach((s, j) => s.classList.toggle("active", j === index));
  current.textContent = String(index + 1);
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === scenes.length - 1;
  history.replaceState(null, "", index ? `#s${index + 1}` : location.pathname);
};
new ResizeObserver(fit).observe(deck);
prevBtn.addEventListener("click", () => show(index - 1));
nextBtn.addEventListener("click", () => show(index + 1));
deck.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown") (e.preventDefault(), show(index + 1));
  else if (e.key === "ArrowLeft" || e.key === "PageUp") (e.preventDefault(), show(index - 1));
  else if (e.key === "Home") (e.preventDefault(), show(0));
  else if (e.key === "End") (e.preventDefault(), show(scenes.length - 1));
});
deck.addEventListener("click", (e) => {
  const r = deck.getBoundingClientRect();
  show(index + (e.clientX - r.left < r.width / 3 ? -1 : 1));
});
const full = document.querySelector<HTMLButtonElement>("[data-deck-full]")!;
if (!document.fullscreenEnabled) full.hidden = true;
full.addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else deck.requestFullscreen().then(() => deck.focus()).catch(() => {});
});
const m = /^#s(\d+)$/.exec(location.hash);
fit();
show(m ? Number(m[1]) - 1 : 0);

// 進度
const page = document.querySelector<HTMLElement>("[data-lesson-no]")!;
const no = Number(page.dataset.lessonNo);
const course = page.dataset.course ?? "obsidian";
const toggle = document.querySelector<HTMLInputElement>("[data-done-toggle]")!;
toggle.checked = getDone(course).has(no);
toggle.addEventListener("change", () => setDone(no, toggle.checked, course));
