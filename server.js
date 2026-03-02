const express = require("express");
const { io } = require("socket.io-client");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const FREESHOW_SOCKET = process.env.FREESHOW_SOCKET || "http://localhost:5505";

const FREESHOW_DIR =
  process.env.FREESHOW_DATA_DIR || path.join(os.homedir(), "Documents", "FreeShow");
const SHOWS_DIR = path.join(FREESHOW_DIR, "Shows");

const socket = io(FREESHOW_SOCKET, {
  transports: ["polling", "websocket"],
  timeout: 3000,
});

let projectsData = null;
let lastError = null;
let lastProjectsAt = 0;

let showNameById = new Map();
let lastShowsScan = 0;
let lastShowsError = null;

// =============================
// UTIL
// =============================
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

function emitAction(action, data = {}) {
  socket.emit("data", JSON.stringify({ action, ...data }));
}
function requestProjects() {
  emitAction("get_projects");
}

function pickMostRecentProjectId(data) {
  if (!data || typeof data !== "object") return null;
  const list = Object.entries(data).map(([id, p]) => ({ id, ...p }));
  list.sort((a, b) => (b.used || 0) - (a.used || 0));
  return list[0]?.id || null;
}

function isSection(item) {
  return String(item?.type || "").toLowerCase() === "section";
}
function isPdf(item) {
  return String(item?.type || "").toLowerCase() === "pdf";
}
function isRealShow(item) {
  return !!item?.id && !isSection(item) && !isPdf(item);
}

function titleAndSuffix(rawText) {
  const raw = String(rawText || "");
  const idx = raw.indexOf(" - ");
  const left = idx >= 0 ? raw.slice(0, idx) : raw; // título
  const right = idx >= 0 ? raw.slice(idx) : "";    // sufijo (acorde) tal cual
  return { left, right };
}

function toTokenObj(text) {
  const { left, right } = titleAndSuffix(text);
  return { leftUpper: left.toUpperCase(), suffix: right };
}

function getActiveProject() {
  const projectId = pickMostRecentProjectId(projectsData);
  const project = projectId ? projectsData?.[projectId] : null;
  return { projectId, project };
}

function commonNote() {
  if (!socket.connected) return "No conectado a FreeShow (WS).";
  if (!projectsData) return "Esperando get_projects...";
  return "";
}

// =============================
// Scan .show
// =============================
function scanShowsFolder() {
  try {
    lastShowsError = null;

    if (!fs.existsSync(SHOWS_DIR)) {
      lastShowsError = `No existe carpeta Shows: ${SHOWS_DIR}`;
      showNameById = new Map();
      lastShowsScan = Date.now();
      return;
    }

    const files = fs.readdirSync(SHOWS_DIR);
    const map = new Map();

    for (const file of files) {
      if (!file.toLowerCase().endsWith(".show")) continue;
      const fullPath = path.join(SHOWS_DIR, file);

      try {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const json = JSON.parse(raw);

        let id = null;
        let data = null;

        if (Array.isArray(json) && typeof json[0] === "string" && json[1] && typeof json[1] === "object") {
          id = json[0];
          data = json[1];
        } else if (json && typeof json === "object") {
          id = json.id || json._id;
          data = json;
        }

        const name =
          data?.name ||
          data?.title ||
          data?.meta?.name ||
          data?.meta?.title ||
          path.basename(file, ".show");

        if (id && name) map.set(String(id), String(name));
      } catch {
        // ignore
      }
    }

    showNameById = map;
    lastShowsScan = Date.now();
  } catch (err) {
    lastShowsError = err.message;
    showNameById = new Map();
    lastShowsScan = Date.now();
  }
}

scanShowsFolder();
setInterval(scanShowsFolder, 3000);

// =============================
// Socket
// =============================
socket.on("connect", () => {
  console.log("✅ Conectado a FreeShow WebSocket:", FREESHOW_SOCKET);
  requestProjects();
  setInterval(requestProjects, 2000);
});

socket.on("disconnect", () => console.log("❌ Desconectado de FreeShow"));

socket.on("connect_error", (e) => {
  lastError = e?.message || String(e);
  console.log("❌ connect_error:", lastError);
});

socket.on("error", (e) => {
  lastError = e?.message || String(e);
  console.log("⚠️ FreeShow error:", lastError);
});

socket.on("data", (payload) => {
  lastError = null;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return;
    }
  }

  if (payload?.action === "get_projects" && payload.data && typeof payload.data === "object") {
    projectsData = payload.data;
    lastProjectsAt = Date.now();
  }
});

// =============================
// Build songs by section
// =============================
function buildSongsBySection(project) {
  const items = Array.isArray(project?.shows) ? project.shows : [];
  const ordered = items.slice().sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const out = { coro: [], conjunto: [] };
  let current = null;

  for (const item of ordered) {
    if (isSection(item)) {
      const key = String(item.name || "").trim().toLowerCase();
      current = (key === "coro" || key === "conjunto") ? key : null;
      continue;
    }

    if (current && isRealShow(item)) {
      const id = String(item.id);
      const name = showNameById.get(id) || id;
      out[current].push(name);
    }
  }
  return out;
}

// =============================
// Styles
// =============================
const VERTICAL_STYLE = `
  body{ background:#0b0b0b; color:#fff; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 38px 58px; }
  h1{ font-size: 64px; font-weight: 900; margin: 0 0 18px 0; letter-spacing: .4px; }
  .section{ margin-top: 22px; font-size: 46px; font-weight: 900; letter-spacing: 1px; color:#7dd3fc; text-transform: uppercase;
            text-decoration: underline; text-decoration-thickness: 4px; text-underline-offset: 10px; }
  .section:first-of-type{ margin-top: 8px; }
  .song{ margin-left: 38px; margin-top: 6px; font-size: 40px; font-weight: 900; letter-spacing: .4px; line-height: 1.08;
         white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .song::before{ content: "•"; margin-right: 16px; opacity: .6; }
  .songTitle{ text-transform: uppercase; font-weight: 900; }
  .songSuffix{ font-weight: 900; opacity: .92; color:#fbbf24; }
  .note{ margin-top: 12px; opacity: .75; font-size: 14px; }
`;

// Para tickers: el "encabezado inline" usa MISMO look que .section del vertical
const TICKER_STYLE = `
  body{ background:#0b0b0b; color:#fff; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 34px 58px; overflow:hidden; }
  .tickerWrap{ position: relative; width: 100%; overflow: hidden; border-top: 3px solid rgba(125,211,252,.30); border-bottom: 3px solid rgba(125,211,252,.30); padding: 14px 0; }
  .ticker{ display: inline-block; white-space: nowrap; font-weight: 900; letter-spacing: .5px; will-change: transform; }
  .tokenTitle{ text-transform: uppercase; font-weight: 900; }
  .tokenSuffix{ color:#fbbf24; }
  .sep{ opacity:.55; padding: 0 26px; }
  .note{ margin-top: 12px; opacity: .75; font-size: 14px; }

  /* Inline header (igual al section) */
  .inlineHeader{
    color:#7dd3fc;
    text-transform: uppercase;
    font-weight: 900;
    text-decoration: underline;
    text-decoration-thickness: 4px;
    text-underline-offset: 10px;
    letter-spacing: 1px;
    margin-right: 18px;
  }
`;

// arma lista en HTML para ticker (tokens con sufijo amarillo)
function buildTickerHtmlFromNames(names) {
  const htmlTokens = names.map((nm) => {
    const { leftUpper, suffix } = toTokenObj(nm);
    return `<span class="tokenTitle">${escapeHtml(leftUpper)}</span><span class="tokenSuffix">${escapeHtml(suffix)}</span>`;
  });
  return htmlTokens.join(`<span class="sep">•</span>`);
}

// arma una "línea" completa: InlineHeader + items
function buildLabeledLineHtml(label, names) {
  const itemsHtml = buildTickerHtmlFromNames(names) || "—";
  return `<span class="inlineHeader">${escapeHtml(label)}:</span>${itemsHtml}`;
}

// =============================
// API: datos para tickers (sin refresh)
// =============================
app.get("/api/ticker", (req, res) => {
  const type = String(req.query.type || "both").toLowerCase(); // coro|conjunto|both
  const { project } = getActiveProject();
  const note = commonNote();

  const by = buildSongsBySection(project);

  if (type === "coro") {
    return res.json({ ok: true, note, html: buildLabeledLineHtml("Coro", by.coro) });
  }
  if (type === "conjunto") {
    return res.json({ ok: true, note, html: buildLabeledLineHtml("Conjunto", by.conjunto) });
  }

  // both (1 línea) => CORO: ... — CONJUNTO: ...
  const bothOneLine =
    buildLabeledLineHtml("Coro", by.coro) +
    `<span class="sep">•</span>` +
    buildLabeledLineHtml("Conjunto", by.conjunto);

  return res.json({ ok: true, note, html: bothOneLine });
});

// =============================
// 1) VERTICAL (con título)
app.get("/songs", (req, res) => {
  const { project } = getActiveProject();
  const note = commonNote();
  const title = project?.name || "Domingo";
  const by = buildSongsBySection(project);

  const renderSection = (label, names) => {
    if (!names.length) return "";
    return `
      <div class="section">${escapeHtml(label)}</div>
      ${names.map((nm) => {
        const { leftUpper, suffix } = toTokenObj(nm);
        return `<div class="song">
          <span class="songTitle">${escapeHtml(leftUpper)}</span><span class="songSuffix">${escapeHtml(suffix)}</span>
        </div>`;
      }).join("")}
    `;
  };

  const html = `
<!doctype html>
<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="2">
<style>${VERTICAL_STYLE}</style>
</head><body>
<h1>${escapeHtml(title)}</h1>

${renderSection("Coro", by.coro)}
${renderSection("Conjunto", by.conjunto)}

${note ? `<div class="note">${escapeHtml(note)}</div>` : ""}
</body></html>`;
  res.type("text/html; charset=utf-8").send(html);
});

// Helper: ticker 1 línea con actualización en vivo (sin recargar)
function renderTickerOneLinePage(res, apiType, speedSeconds) {
  const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
${TICKER_STYLE}
.tickerWrap{ height: 120px; }
.ticker{ font-size: 66px; animation: scroll ${speedSeconds}s linear infinite; }
@keyframes scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
</style>
</head>
<body>
  <div class="tickerWrap">
    <div class="ticker" id="ticker">
      <span id="line">—</span>
    </div>
  </div>

  <div class="note" id="note" style="display:none;"></div>

<script>
  async function refresh() {
    try {
      const res = await fetch("/api/ticker?type=${encodeURIComponent(apiType)}", { cache: "no-store" });
      const data = await res.json();
      const lineEl = document.getElementById("line");
      const noteEl = document.getElementById("note");

      const html = (data && data.html) ? data.html : "—";
      lineEl.innerHTML = html + '<span class="sep">•</span>' + html;

      if (data && data.note) {
        noteEl.style.display = "block";
        noteEl.textContent = data.note;
      } else {
        noteEl.style.display = "none";
      }
    } catch (e) {}
  }
  refresh();
  setInterval(refresh, 2000);
</script>
</body>
</html>`;
  res.type("text/html; charset=utf-8").send(html);
}

// 2) TICKER SOLO CORO (inline "CORO:")
app.get("/songs/ticker/coro", (req, res) => {
  renderTickerOneLinePage(res, "coro", 34);
});

// 3) TICKER SOLO CONJUNTO (inline "CONJUNTO:")
app.get("/songs/ticker/conjunto", (req, res) => {
  renderTickerOneLinePage(res, "conjunto", 38);
});

// 4) TICKER AMBOS 1 línea (inline "CORO:" y "CONJUNTO:" en la misma línea)
app.get("/songs/ticker", (req, res) => {
  renderTickerOneLinePage(res, "both", 42);
});

// 5) TICKER 2 líneas: ARRIBA CORO (inline) / ABAJO CONJUNTO (inline)
app.get("/songs/ticker2", (req, res) => {
  const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
${TICKER_STYLE}
.row{ margin-top: 22px; }
.tickerWrap{ height: 112px; }
.ticker{ font-size: 60px; }
.speedA{ animation: scrollA 34s linear infinite; }
.speedB{ animation: scrollB 40s linear infinite; }
@keyframes scrollA { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes scrollB { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
</style>
</head>
<body>

  <div class="row">
    <div class="tickerWrap">
      <div class="ticker speedA"><span id="lineCoro">—</span></div>
    </div>
  </div>

  <div class="row">
    <div class="tickerWrap">
      <div class="ticker speedB"><span id="lineConjunto">—</span></div>
    </div>
  </div>

  <div class="note" id="note" style="display:none;"></div>

<script>
  async function refresh() {
    try {
      const [coroRes, conjRes] = await Promise.all([
        fetch("/api/ticker?type=coro", { cache: "no-store" }),
        fetch("/api/ticker?type=conjunto", { cache: "no-store" })
      ]);

      const coro = await coroRes.json();
      const conj = await conjRes.json();

      const htmlCoro = (coro && coro.html) ? coro.html : "—";
      const htmlConj = (conj && conj.html) ? conj.html : "—";

      document.getElementById("lineCoro").innerHTML = htmlCoro + '<span class="sep">•</span>' + htmlCoro;
      document.getElementById("lineConjunto").innerHTML = htmlConj + '<span class="sep">•</span>' + htmlConj;

      const noteEl = document.getElementById("note");
      const note = (coro && coro.note) || (conj && conj.note) || "";
      if (note) { noteEl.style.display = "block"; noteEl.textContent = note; }
      else { noteEl.style.display = "none"; }
    } catch (e) {}
  }
  refresh();
  setInterval(refresh, 2000);
</script>

</body>
</html>`;
  res.type("text/html; charset=utf-8").send(html);
});

// DEBUG
app.get("/debug", (req, res) => {
  const mostRecentProjectId = pickMostRecentProjectId(projectsData);
  res.json({
    connected: socket.connected,
    lastError,
    lastProjectsAt,
    projectCount: projectsData ? Object.keys(projectsData).length : 0,
    mostRecentProjectId,
    showsFolder: SHOWS_DIR,
    showsIndexed: showNameById.size,
    lastShowsScan,
    lastShowsError,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Bridge listo en http://localhost:${PORT}`);
  console.log(`1) Vertical (con título):       http://localhost:${PORT}/songs`);
  console.log(`2) Ticker CORO inline:          http://localhost:${PORT}/songs/ticker/coro`);
  console.log(`3) Ticker CONJUNTO inline:      http://localhost:${PORT}/songs/ticker/conjunto`);
  console.log(`4) Ticker ambos 1 línea inline: http://localhost:${PORT}/songs/ticker`);
  console.log(`5) Ticker 2 líneas inline:      http://localhost:${PORT}/songs/ticker2`);
  console.log(`🧪 Debug:                       http://localhost:${PORT}/debug`);
});