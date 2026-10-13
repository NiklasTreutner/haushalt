// ──────────────────────────────────────────────────────────────
// KLEINE SVG-DIAGRAMME (ohne Bibliothek)
// Linien-/Flächendiagramm mit Fadenkreuz-Tooltip und HTML-Balkenlisten.
// Farben kommen als CSS-Variablen (--series-1 …) aus styles.css.

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (parent) parent.appendChild(el);
  return el;
}

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  });
  children.flat().forEach(c => { if (c != null) el.append(c.nodeType ? c : String(c)); });
  return el;
}

const fmtEUR = (v, digits = 0) => `${v.toLocaleString("de-DE", { maximumFractionDigits: digits, minimumFractionDigits: digits })} €`;
const fmtPct = (v, digits = 1) => `${v.toLocaleString("de-DE", { maximumFractionDigits: digits, minimumFractionDigits: digits })} %`;
const fmtBn = (v, digits = 1) => `${v.toLocaleString("de-DE", { maximumFractionDigits: digits, minimumFractionDigits: digits })} Mrd. €`;
const fmtSigned = (v, fmt) => (v > 0 ? "+" : v < 0 ? "−" : "±") + fmt(Math.abs(v));
const fmtK = v => Math.abs(v) >= 1e6 ? `${(v / 1e6).toLocaleString("de-DE")} Mio.` : Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString("de-DE")} Tsd.` : v.toLocaleString("de-DE");

// Gemeinsamer Tooltip für alle Diagramme
const chartTip = (() => {
  const el = h("div", { class: "chart-tip", role: "status" });
  document.body.appendChild(el);
  return {
    show(html, x, y) {
      el.innerHTML = html;
      el.style.display = "block";
      const r = el.getBoundingClientRect();
      const left = Math.min(x + 14, window.innerWidth - r.width - 8);
      const top = y - r.height - 12 < 8 ? y + 16 : y - r.height - 12;
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    },
    hide() { el.style.display = "none"; }
  };
})();

function niceTicks(min, max, count = 5, integer = false) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const factors = integer ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10];
  const step = Math.max(integer ? 1 : 0, factors.map(m => m * mag).find(s => span / s <= count) || 10 * mag);
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

// opts: { series:[{name, color, points:[[x,y]], dash, area, width}], height,
//         xMin, xMax, yMin, yMax, xFormat, yFormat, xTicks, refLines:[{y,label}],
//         markers:[{x,y,label,color}], tooltip:(x)=>html, xLog }
function lineChart(container, opts) {
  container.innerHTML = "";
  container.classList.add("chart");
  const width = Math.max(280, container.clientWidth);
  const height = opts.height || 280;
  const m = { top: 14, right: 18, bottom: 30, left: opts.yLabelWidth || 48 };
  const iw = width - m.left - m.right, ih = height - m.top - m.bottom;

  const allPts = opts.series.flatMap(s => s.points);
  const xMin = opts.xMin ?? Math.min(...allPts.map(p => p[0]));
  const xMax = opts.xMax ?? Math.max(...allPts.map(p => p[0]));
  const yMin = opts.yMin ?? Math.min(0, ...allPts.map(p => p[1]));
  const yMax = opts.yMax ?? Math.max(...allPts.map(p => p[1])) * 1.05;
  const xs = v => m.left + (v - xMin) / (xMax - xMin) * iw;
  const ys = v => m.top + ih - (v - yMin) / (yMax - yMin) * ih;
  const xInv = px => xMin + (px - m.left) / iw * (xMax - xMin);

  const svg = svgEl("svg", { width, height, viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": opts.label || "" }, container);

  // Raster und Achsen
  const yTicks = niceTicks(yMin, yMax, opts.yTickCount || 5);
  yTicks.forEach(t => {
    svgEl("line", { x1: m.left, x2: m.left + iw, y1: ys(t), y2: ys(t), class: t === 0 ? "axis-base" : "grid" }, svg);
    svgEl("text", { x: m.left - 6, y: ys(t) + 4, class: "tick", "text-anchor": "end" }, svg).textContent = (opts.yFormat || String)(t);
  });
  // Jahresachsen nur mit ganzen Jahren beschriften
  const isYearAxis = Number.isInteger(xMin) && Number.isInteger(xMax) && xMin > 1900 && xMax < 2100;
  (opts.xTicks || niceTicks(xMin, xMax, Math.max(3, Math.floor(iw / 80)), isYearAxis)).forEach(t => {
    svgEl("text", { x: xs(t), y: m.top + ih + 18, class: "tick", "text-anchor": "middle" }, svg).textContent = (opts.xFormat || String)(t);
  });
  (opts.bands || []).forEach(b => {
    svgEl("rect", { x: xs(b.from), y: m.top, width: Math.max(0, xs(b.to) - xs(b.from)), height: ih, class: "band" }, svg);
    if (b.label) svgEl("text", { x: xs(b.from) + 4, y: m.top + 12, class: "ref-label" }, svg).textContent = b.label;
  });

  (opts.refLines || []).forEach(r => {
    svgEl("line", { x1: m.left, x2: m.left + iw, y1: ys(r.y), y2: ys(r.y), class: "ref-line" }, svg);
    svgEl("text", { x: m.left + 6, y: ys(r.y) - 5, class: "ref-label halo" }, svg).textContent = r.label;
  });
  const path = pts => pts.map((p, i) => `${i ? "L" : "M"}${xs(p[0]).toFixed(1)},${ys(p[1]).toFixed(1)}`).join("");
  opts.series.forEach(s => {
    if (s.area) {
      const pts = s.points;
      const base = s.areaBase || pts.map(p => [p[0], yMin]);
      const d = path(pts) + base.slice().reverse().map(p => `L${xs(p[0]).toFixed(1)},${ys(p[1]).toFixed(1)}`).join("") + "Z";
      svgEl("path", { d, fill: s.color, "fill-opacity": s.areaOpacity ?? 0.85, stroke: "var(--surface)", "stroke-width": 1.5 }, svg);
    } else {
      svgEl("path", { d: path(s.points), fill: "none", stroke: s.color, "stroke-width": s.width || 2,
        "stroke-dasharray": s.dash ? "6 4" : "", "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    }
  });

  (opts.markers || []).forEach(mk => {
    const g = svgEl("g", { class: "marker" }, svg);
    svgEl("circle", { cx: xs(mk.x), cy: ys(mk.y), r: 5, fill: mk.color || "var(--ink)", stroke: "var(--surface)", "stroke-width": 2 }, g);
    if (mk.label) {
      const t = svgEl("text", { x: xs(mk.x) + (mk.labelLeft ? -8 : 8), y: ys(mk.y) + (mk.dy || -8), class: "marker-label",
        "text-anchor": mk.labelLeft ? "end" : "start" }, g);
      t.textContent = mk.label;
    }
  });

  // Fadenkreuz
  if (opts.tooltip) {
    const cross = svgEl("line", { y1: m.top, y2: m.top + ih, class: "crosshair", visibility: "hidden" }, svg);
    const dots = opts.series.filter(s => !s.noHover).map(s => svgEl("circle", { r: 4, fill: s.color, stroke: "var(--surface)", "stroke-width": 2, visibility: "hidden" }, svg));
    const hit = svgEl("rect", { x: m.left, y: m.top, width: iw, height: ih, fill: "transparent" }, svg);
    hit.addEventListener("mousemove", e => {
      const rect = svg.getBoundingClientRect();
      let x = xInv(e.clientX - rect.left);
      if (opts.xSnap) x = opts.xSnap(x);
      x = Math.min(xMax, Math.max(xMin, x));
      cross.setAttribute("x1", xs(x)); cross.setAttribute("x2", xs(x));
      cross.setAttribute("visibility", "visible");
      opts.series.filter(s => !s.noHover).forEach((s, i) => {
        const y = valueAt(s.points, x);
        if (y == null) { dots[i].setAttribute("visibility", "hidden"); return; }
        dots[i].setAttribute("cx", xs(x)); dots[i].setAttribute("cy", ys(y));
        dots[i].setAttribute("visibility", "visible");
      });
      chartTip.show(opts.tooltip(x), e.clientX, e.clientY);
    });
    hit.addEventListener("mouseleave", () => {
      cross.setAttribute("visibility", "hidden");
      dots.forEach(d => d.setAttribute("visibility", "hidden"));
      chartTip.hide();
    });
  }

  if (opts.legend !== false && opts.series.filter(s => s.name).length > 1) {
    container.appendChild(legend(opts.series.filter(s => s.name && !s.noLegend)));
  }
  return { xs, ys };
}

function valueAt(points, x) {
  if (!points.length || x < points[0][0] || x > points[points.length - 1][0]) return null;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1], [x1, y1] = points[i];
    if (x <= x1) return x1 === x0 ? y1 : y0 + (y1 - y0) * (x - x0) / (x1 - x0);
  }
  return points[points.length - 1][1];
}

function legend(items) {
  return h("div", { class: "legend" }, items.map(s =>
    h("span", { class: "legend-item" },
      h("span", { class: `legend-swatch${s.dash ? " dashed" : ""}`, style: `--c:${s.color}` }), s.name)));
}

// Horizontale Balkenliste: [{label, value, color, sub, onClick, title}]
function barList(container, items, opts = {}) {
  container.innerHTML = "";
  const max = opts.max || Math.max(...items.map(i => Math.abs(i.value)), 1e-9);
  const list = h("div", { class: `bar-list${opts.diverging ? " diverging" : ""}` });
  items.forEach(it => {
    const pct = Math.abs(it.value) / max * (opts.diverging ? 50 : 100);
    const fill = h("span", { class: "bar-fill", style: `width:${pct}%;background:${it.color || "var(--series-1)"};` +
      (opts.diverging ? (it.value >= 0 ? "left:50%;" : `left:${50 - pct}%;`) : "") });
    const row = h(it.onClick ? "button" : "div", { class: "bar-row", type: it.onClick ? "button" : null, title: it.title || null },
      h("span", { class: "bar-label" }, it.label, it.sub ? h("small", {}, it.sub) : null),
      h("span", { class: "bar-track" }, fill),
      h("span", { class: "bar-value" }, (opts.format || (v => v.toLocaleString("de-DE")))(it.value)));
    if (it.onClick) row.addEventListener("click", it.onClick);
    list.appendChild(row);
  });
  container.appendChild(list);
}

// Gestapelter 100-%-Balken: [{label, value, color}]
function stackBar(parts, total, opts = {}) {
  const bar = h("div", { class: "stack-bar", role: "img",
    "aria-label": parts.map(p => `${p.label} ${fmtPct(p.value / total * 100, 0)}`).join(", ") });
  parts.filter(p => p.value > 0).forEach(p => {
    const seg = h("span", { class: "stack-seg", style: `flex-basis:${p.value / total * 100}%;background:${p.color}` });
    seg.addEventListener("mousemove", e => chartTip.show(
      `<strong>${p.label}</strong><br>` + (opts.pctOnly ? fmtPct(p.value / total * 100, 0)
        : `${(opts.format || fmtEUR)(p.value)} · ${fmtPct(p.value / total * 100)}`), e.clientX, e.clientY));
    seg.addEventListener("mouseleave", () => chartTip.hide());
    bar.appendChild(seg);
  });
  return bar;
}

function statTile(label, value, sub, opts = {}) {
  return h(opts.href ? "a" : "div", { class: `stat-tile${opts.tone ? " " + opts.tone : ""}`, href: opts.href || null },
    h("span", { class: "stat-label" }, label),
    h("span", { class: "stat-value" }, value),
    sub ? h("span", { class: "stat-sub" }, sub) : null);
}

// Regler mit Zahlenanzeige für die Seitenansichten
function rangeField({ label, min, max, step, value, format, onInput, base }) {
  // step="any", damit krumme Ausgangswerte (z. B. 12.348 €) exakt stehen bleiben;
  // beim Ziehen wird selbst auf volle Schritte gerundet.
  const out = h("output", {});
  const input = h("input", { type: "range", min, max, step: "any", value, "aria-label": label });
  const reset = h("button", { type: "button", class: "icon-btn field-reset", title: "Zurücksetzen", "aria-label": `${label} zurücksetzen` }, "↺");
  let current = value;
  const sync = () => {
    out.textContent = format(current);
    reset.hidden = base == null || Math.abs(current - base) < 1e-9;
  };
  input.addEventListener("input", () => {
    current = Math.min(max, Math.max(min, +(Math.round(Number(input.value) / step) * step).toFixed(6)));
    sync();
    onInput(current);
  });
  reset.addEventListener("click", (e) => { e.preventDefault(); current = base; input.value = base; sync(); onInput(base); });
  sync();
  return h("div", { class: "range-field" },
    h("span", { class: "range-head" }, h("span", {}, label), h("span", { class: "range-out" }, out, reset)),
    input);
}
