// 投影片場景的 renderer，移植自課程原始碼的 build_html.js。
// 不輸出逐字稿與估計秒數；逐字稿不在這個 repo。
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let order = 0;
const A = (extra) => `class="anim${extra ? " " + extra : ""}" data-anim-order="${++order}"`;
const h2 = (t) => `<h2 ${A("scene-title")}>${esc(t)}</h2>`;
const win = (title, inner, cls) => `<div class="win ${cls || ""}"><div class="win-bar"><i></i><i></i><i></i><span>${esc(title)}</span></div><div class="win-body">${inner}</div></div>`;
const fig = (d, inner) => `<figure ${A("mock")}${d.replace ? ` data-replace="${d.replace}"` : ""}>${inner}</figure>`;
const legend = (items) => `<ol class="legend">${items.map((it, i) => `<li ${A()}><b class="dot teal">${i + 1}</b><div><strong>${esc(it[0])}</strong><span>${esc(it[1])}</span></div></li>`).join("")}</ol>`;
const uiMock = (d) => {
  const files = (d.files || []).map((f) => `<span>${esc(f)}</span>`).join("");
  const center = d.empty ? `<p class="ui-empty">尚未開啟任何檔案</p>` : `<strong>${esc(d.centerTitle || "文獻A 跌倒預防")}</strong>${[82, 70, 86, 54, 78, 64].map((w) => `<i style="width:${w}%"></i>`).join("")}`;
  const side = `<span>${esc(d.sideLabel || "反向連結")}</span>${d.empty ? "" : (d.sideItems || ["", ""]).map((t) => `<em>${esc(t)}</em>`).join("")}`;
  const marks = d.empty ? ["<b class=\"dot teal mark\">1</b>", "<b class=\"dot teal mark\">2</b>", "<b class=\"dot teal mark\">3</b>"] : ["<b class=\"dot teal mark\">1</b>", "<b class=\"dot teal mark\">2</b>", "<b class=\"dot teal mark\">3</b>"];
  const inner = d.sideItems
    ? `<div class="ui-left"><div class="ui-row"><b class="ui-plus">+</b></div>${files}</div><div class="ui-center"><div class="ui-row end">${marks[0]}</div>${center}</div><div class="ui-right"><div class="ui-row">${marks[1]}</div>${side}<div class="ui-row">${marks[2]}</div></div>`
    : d.empty
    ? `<div class="ui-left"><div class="ui-row"><b class="ui-plus">+</b>${marks[0]}</div><div class="ui-row gap">${marks[1]}</div>${files}</div><div class="ui-center"><div class="ui-row">${marks[2]}</div>${center}</div><div class="ui-right">${side}</div>`
    : `<div class="ui-left"><div class="ui-row"><b class="ui-plus">+</b>${marks[0]}</div>${files}</div><div class="ui-center"><div class="ui-row end">${marks[1]}</div>${center}</div><div class="ui-right"><div class="ui-row">${marks[2]}</div>${side}</div>`;
  return win("練習用 － Obsidian", inner, "ui");
};

const R = {
  title: (d, L) => `<p ${A("kicker")}>${L.mod || "模組一"}　${L.modName || "起步"}　第 ${L.no} 堂</p><h1 ${A()}>${esc(d.title)}</h1><p ${A("sub")}>${esc(d.sub)}</p>
    <svg ${A("graph")} viewBox="0 0 420 760" aria-hidden="true"><g stroke="#5B3FC4" stroke-width="4">
    <line x1="150" y1="40" x2="380" y2="210"/><line x1="150" y1="40" x2="110" y2="360"/><line x1="380" y1="210" x2="110" y2="360"/><line x1="110" y1="360" x2="340" y2="560"/><line x1="340" y1="560" x2="190" y2="680"/><line x1="380" y1="210" x2="340" y2="560"/></g>
    <g fill="#5B3FC4"><circle cx="150" cy="40" r="28"/><circle cx="380" cy="210" r="28"/><circle cx="340" cy="560" r="28"/><circle cx="190" cy="680" r="28"/></g><circle cx="110" cy="360" r="48" fill="#B3A0FF"/></svg>`,
  why: (d) => `<p ${A("kicker")}><b class="dot violet big">?</b>學員會問</p><h1 ${A()}>${esc(d.q)}</h1><p ${A("sub")}>${esc(d.sub)}</p>`,
  grid: (d) => h2(d.title) + `<div class="grid3">${d.items.map((it, i) => `<div ${A("tile")}><div class="tile-head"><b class="dot violet">${i + 1}</b><strong>${esc(it[0])}</strong></div><span>${esc(it[1])}</span></div>`).join("")}</div>`,
  analogy: (d) => h2(d.title) + `<div class="analogy"><div ${A("card teal-bg")}><em class="teal-fg">臨床上</em><strong>${esc(d.left[0])}</strong><p>${esc(d.left[1])}</p></div><b ${A("equals")}>＝</b><div ${A("card violet-bg")}><em class="violet-fg">在這門課</em><strong>${esc(d.right[0])}</strong><p>${esc(d.right[1])}</p></div></div>`,
  three: (d) => h2(d.title) + `<div class="grid3 tall">${d.items.map((it) => `<div ${A("tile")}><b class="glyph">${esc(it[0])}</b><strong>${esc(it[1])}</strong><p>${esc(it[2])}</p></div>`).join("")}</div>`,
  steps: (d) => h2(d.title) + `<ol class="steps${d.items.length > 4 ? " dense" : ""}">${d.items.map((it, i) => `<li ${A()}><b class="dot violet">${i + 1}</b><span>${esc(it)}</span></li>`).join("")}</ol>${d.note ? `<p ${A("notebar")}>${esc(d.note)}</p>` : ""}`,
  cards: (d) => h2(d.title) + `<div class="cards">${[[d.a, "violet"], [d.b, "teal"]].map(([c, k]) => `<div ${A("card " + k + "-bg")}><div class="tile-head"><b class="dot ${k}">${esc(c.tag)}</b><strong>${esc(c.head)}</strong></div><ul>${c.lines.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>${d.common ? `<p ${A("common")}>${esc(d.common)}</p>` : ""}`,
  table: (d) => h2(d.title) + `<table ${A("syntax")}><thead><tr>${d.head.map((t) => `<th>${esc(t)}</th>`).join("")}</tr></thead><tbody>${d.rows.map((r) => `<tr>${r.map((t, i) => `<td${d.mono && i === 0 ? ' class="mono"' : ""}>${esc(t)}</td>`).join("")}</tr>`).join("")}</tbody></table>${d.note ? `<p ${A("caption")}>${esc(d.note)}</p>` : ""}`,
  end: (d) => `<p ${A("kicker")}>留給你的問題</p><h1 ${A()}>${esc(d.q)}</h1><p ${A("sub")}>${esc(d.next)}</p>`,
  mockFolder: (d) => { const rows = d.rows || [["文獻A 跌倒預防.md", 0], ["Morse 跌倒量表.md", 0], ["2026-11-18 meeting.md", 0], ["我的第一則筆記.md", 0]];
    return h2(d.title) + `<div class="split">${fig(d, win(d.winTitle || "文件 › 練習用", rows.map((r) => `<div class="file${r[1] ? " indent" : ""}${r[2] ? " dir" : ""}"><i></i>${esc(r[0])}</div>`).join(""), "folder" + (rows.length > 5 ? " dense" : "")))}${legend(d.legend || [["資料夾就是 vault", "沒有特殊格式"], ["一個檔案是一則筆記", "檔名就是筆記標題"], ["副檔名 .md", "純文字，記事本也能開"]])}</div>`; },
  mockLink: (d) => h2(d.title) + `<div class="split">${fig(d, win("文獻A 跌倒預防", `<div class="r-h2">我的想法</div><div class="ln">可以搭配 [[Mor<b class="dot teal mark">1</b></div><div class="dropdown"><span class="on">Morse 跌倒量表</span><span>Morse 量表切分點</span><b class="dot teal mark">2</b></div><div class="ln">可以搭配 <a>Morse 跌倒量表</a> 篩選高危險病人<b class="dot teal mark">3</b></div>`, "link"))}${legend(d.legend)}</div>`,
  mockGraph: (d) => h2(d.title) + `<div class="split">${fig(d, win("Graph view", `<svg viewBox="0 0 590 297"><g stroke="#D9D6E6" stroke-width="3">${d.edges.map(([a, b]) => `<line x1="${d.nodes[a][1] * 100}" y1="${d.nodes[a][2] * 100}" x2="${d.nodes[b][1] * 100}" y2="${d.nodes[b][2] * 100}"/>`).join("")}</g>${d.nodes.map((n) => `<circle cx="${n[1] * 100}" cy="${n[2] * 100}" r="${n[3] * 50}" fill="${n[4] === 1 ? "#5B3FC4" : n[4] === 2 ? "#D9D6E6" : "#B3A0FF"}"/><text x="${n[1] * 100}" y="${n[2] * 100 + n[3] * 50 + 16}" text-anchor="middle" font-size="13" fill="#5B5670">${esc(n[0])}</text>`).join("")}</svg>`, "svgwin"))}${legend(d.legend)}</div>`,
  mockCanvas: (d) => { const c0 = d.cards[0]; return h2(d.title) + `<div class="split">${fig(d, win("跌倒預防.canvas", `<svg viewBox="0 0 590 297"><g stroke="#5B5670" stroke-width="2.5">${d.cards.slice(1).map((c) => `<line x1="${(c[1] + c[3] / 2) * 100}" y1="${(c[2] + c[4] / 2) * 100}" x2="${(c0[1] + c0[3] / 2) * 100}" y2="${(c0[2] + c0[4] / 2) * 100}"/>`).join("")}</g>${d.cards.map((c) => `<rect x="${c[1] * 100}" y="${c[2] * 100}" width="${c[3] * 100}" height="${c[4] * 100}" rx="8" fill="${c[5] === "center" ? "#E7E1FA" : c[5] === "note" ? "#D8EFEC" : "#fff"}" stroke="${c[5] === "center" ? "#5B3FC4" : "#D9D6E6"}" stroke-width="2"/><text x="${(c[1] + c[3] / 2) * 100}" y="${(c[2] + c[4] / 2) * 100 + 5}" text-anchor="middle" font-size="15" font-weight="${c[5] === "center" ? 700 : 400}" fill="#1E1A2E">${esc(c[0])}</text>`).join("")}</svg>`, "svgwin"))}${legend(d.legend)}</div>`; },
  mockUI: (d) => h2(d.title) + `<div class="split">${fig(d, uiMock(d))}${legend(d.legend)}</div>`,
  mockDialog: (d) => h2(d.title) + fig(d, win("建立新的儲存庫", [["儲存庫名稱", "練習用", "名字提醒自己：這裡可以隨便弄"], ["位置", "文件", "選找得到的地方，先不放雲端同步資料夾"]].map((f, i) => `<div class="field"><div><label>${f[0]}</label><div class="input">${f[1]}</div></div><b class="dot teal">${i + 1}</b><p class="teal-fg">${f[2]}</p></div>`).join("") + `<div class="btn">建立</div>`, "dialog")),
  vaultTree: (d) => h2(d.title) + `<div class="split"><div ${A("tree")}><strong>練習用（vault 資料夾）</strong><div class="violet-bg"><b class="violet-fg">.obsidian</b><span>這個 vault 的設定：外觀、快捷鍵</span></div><div class="teal-bg"><b class="teal-fg">你的筆記</b><span>一則一個 .md 檔</span></div></div><ul class="points">${d.points.map((t) => `<li ${A()}>${esc(t)}</li>`).join("")}</ul></div>`,
  mockProps: (d) => h2(d.title) + `<div class="split">${fig(d, win(d.noteTitle, `<div class="props"><span class="lab">Properties</span>${d.props.map((p, i) => `<div><em>${esc(p[0])}${i === 0 ? '<b class="dot teal mark">1</b>' : ""}</em><span>${esc(p[1])}${i === 0 ? '<b class="dot teal mark">2</b>' : ""}</span></div>`).join("")}</div><div class="ln"><strong>${esc(d.noteTitle)}</strong><b class="dot teal mark">3</b></div><i style="width:70%"></i><i style="width:55%"></i>`, "propwin"))}${legend(d.legend)}</div>`,
  mockSearch: (d) => h2(d.title) + `<div class="split">${fig(d, win("搜尋", `<div class="ln"><div class="sbox">${esc(d.query)}</div><b class="dot teal mark">1</b></div>${d.results.map((r, i) => `<div class="res"><div><strong>${esc(r[0])}</strong><p>${esc(r[1])}<mark>${esc(r[2])}</mark>${esc(r[3])}</p></div>${i === 0 ? '<b class="dot teal mark">2</b>' : i === 2 ? '<b class="dot teal mark">3</b>' : ""}</div>`).join("")}`, "searchwin"))}${legend(d.legend)}</div>`,
  mockBase: (d) => h2(d.title) + `<div class="split">${fig(d, win(d.winTitle, `<div class="bbar"><b>表格</b><b class="dot teal mark">3</b><span>排序</span><span>分組</span><span>篩選</span><span>屬性</span></div><table class="btable"><thead><tr>${d.head.map((t) => `<th>${esc(t)}</th>`).join("")}</tr></thead><tbody>${d.rows.map((r, i) => `<tr>${r.map((t, k) => `<td>${esc(t)}${i === 0 && k === 0 ? '<b class="dot teal mark">1</b>' : i === 1 && k === 2 ? '<b class="dot teal mark">2</b>' : ""}</td>`).join("")}</tr>`).join("")}</tbody></table>`, "basewin"))}${legend(d.legend)}</div>`,
  mockKanban: (d) => h2(d.title) + `<div class="split">${fig(d, win(d.winTitle, `<div class="kan">${d.cols.map((c, i) => `<div class="kcol"><strong>${esc(c[0])}<em>${c[1].length}</em>${i === 0 ? '<b class="dot teal mark">1</b>' : ""}</strong>${c[1].map((t) => `<div class="kcard">${esc(t)}</div>`).join("")}${i === 0 ? '<b class="dot teal mark">2</b>' : i === 2 ? '<b class="dot teal mark">3</b>' : ""}</div>`).join("")}</div>`, "kanwin"))}${legend(d.legend)}</div>`,
  mockPair: (d) => h2(d.title) + fig(d, `<div class="md pair">${[d.a, d.b].map((c) => win(c.title, c.lines.map((t) => `<code>${esc(t)}</code>`).join(""), "src")).join("")}</div>`),
  mockMarkdown: (d) => h2(d.title) + fig(d, `<div class="md">${win("你打的", ["# 文獻A 跌倒預防", "## 主要結果", "- 用自己的話寫一句", "**樣本數**：待補", "> 貼一句原文", "- [ ] 查 Morse 量表"].map((t) => `<code>${esc(t)}</code>`).join(""), "src")}${win("你看到的", `<div class="r-h1">文獻A 跌倒預防</div><div class="r-h2">主要結果</div><div class="r-li">用自己的話寫一句</div><div><b>樣本數</b>：待補</div><div class="r-quote">貼一句原文</div><div class="r-todo"><i></i>查 Morse 量表</div>`, "out")}</div>`),
};


// 對話示意圖：一來一往的對話框，可以在某一句旁邊標號碼
R.mockChat = (d) =>
  h2(d.title) +
  `<div class="split">${fig(
    d,
    win(
      d.winTitle || "和 AI 的對話（示範用的虛構內容）",
      d.turns
        .map(
          ([who, text, mark]) =>
            `<div class="turn ${who === "你" ? "me" : "ai"}"><em>${esc(who)}</em><p>${esc(text)}</p>${mark ? `<b class="dot teal mark">${mark}</b>` : ""}</div>`,
        )
        .join(""),
      "chat" + (d.turns.length > 3 ? " dense" : ""),
    ),
  )}${legend(d.legend)}</div>`;

// 每種投影片右下角貼一張 looseleaf 的貼紙或塗鴉
const DECO = {
  title: ["sticker", "notebook", 210, -7],
  why: ["sticker", "thinking-face", 230, 8],
  analogy: ["doodle", "light-bulb", 150, 8],
  cards: ["sticker", "pencil-cup", 170, -6],
  steps: ["sticker", "hand-point-right", 170, -4],
  grid: ["doodle", "sparkle-trio", 140, 0],
  three: ["doodle", "star", 130, 10],
  table: ["sticker", "highlighter", 160, 6],
  end: ["sticker", "question-badge", 220, 9],
};

export function renderScene(d, L, i, artBase = "") {
  order = 0;
  const dark = d.type === "title" || d.type === "end";
  const tone = dark ? "dark" : d.type === "why" ? "tint" : "light";
  // 滿版的示意圖不貼，免得蓋到內容
  const full = d.type === "mockPair" || d.type === "mockMarkdown" || d.type === "mockDialog";
  const deco = DECO[d.type] || (d.type === "mockChat" ? ["doodle", "eye", 130, 6] : null) || (!full && (d.type.startsWith("mock") || d.type === "vaultTree") ? ["doodle", "pencil", 130, -8] : null);
  const art = deco ? `<img class="deco ${deco[0]}" src="${artBase}${deco[0]}-${deco[1]}.svg" width="${deco[2]}" alt="" aria-hidden="true" style="rotate:${deco[3]}deg">` : "";
  return `<section class="scene ${tone} type-${d.type}${i === 0 ? " active" : ""}" data-scene="${i}" aria-roledescription="投影片" aria-label="第 ${i + 1} 張，共 ${L.slides.length} 張">
${R[d.type](d, L)}
${dark ? "" : `<footer>${L.course || "Obsidian 研究筆記課"}　${L.mod}　第 ${L.no} 堂</footer>`}
${art}
</section>`;
}
