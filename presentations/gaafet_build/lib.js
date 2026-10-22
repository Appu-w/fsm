// Shared helpers for the GAAFET deck (AC template look + Morph-friendly names)
const pptxgen = require("pptxgenjs");

const W = 13.333, H = 7.5;
const FONT = "Segoe UI", FONT_SB = "Segoe UI Semibold";

// Palette taken from the AC template, plus device colours
const C = {
  ink: "171A20", grey: "5C5E62", mute: "8A8D93", line: "E2E3E3", panel: "F4F5F7", panel2: "EEF1F6",
  white: "FFFFFF",
  blue: "3E6AE1", navy: "1F2F6B", teal: "11998E", orange: "E07B00", red: "D64545", green: "2E9E4F", purple: "6B5BC4",
  // device materials
  body: "F6E7B8", nplus: "7D9BE6", oxide: "CDEBF5", hfo2: "8FCBE0", gate: "B3A6E6", gateD: "8E7CC3",
  depl: "F7D4D9", elec: "1F2F6B", nitride: "D9DCE3", sige: "C9CCD3", sub: "EDE3C8", metal: "9AA0AA",
  heat1: "FFE1B3", heat2: "FFB36B", heat3: "F07A3A", heat4: "D64545",
};

let pres;
function newPres() {
  pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Self-Heating in a Cylindrical GAAFET";
  pres.author = "Nithyanand B, Priyadharshini K, Sivaprakash R";
  pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: C.white },
    objects: [{ rect: { x: 0, y: 0, w: 1.47, h: 0.03, fill: { color: C.ink }, line: { color: C.ink, width: 0 } } }],
    slideNumber: { x: 12.45, y: 7.05, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 9, color: C.mute, align: "right" },
  });
  pres.defineSlideMaster({ title: "TITLE", background: { color: C.white },
    objects: [{ rect: { x: 0, y: 0, w: 1.47, h: 0.03, fill: { color: C.ink }, line: { color: C.ink, width: 0 } } }] });
  return pres;
}

let curSection = null;
function section(title) { pres.addSection({ title }); curSection = title; }
function slide(master = "CONTENT") { return pres.addSlide({ masterName: master, sectionTitle: curSection }); }

const nm = (n) => (n ? "!!" + n : undefined);

// ---------- primitives ----------
// "V_T" / "I_on" / "C_ox" → real subscripts
const SUB = /_([A-Za-z0-9]+(?:,[a-z]+)?)/g;
function subRuns(text, base = {}) {
  const out = [];
  let last = 0, m;
  SUB.lastIndex = 0;
  while ((m = SUB.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), options: { ...base } });
    out.push({ text: m[1], options: { ...base, subscript: true } });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), options: { ...base } });
  return out;
}
function withSubs(text) {
  const lines = (runs) => {
    // pptxgenjs needs breakLine on runs to keep \n paragraphs
    const res = [];
    runs.forEach((r) => {
      const parts = r.text.split("\n");
      parts.forEach((p, i) => res.push({ text: p, options: { ...r.options, ...(i < parts.length - 1 ? { breakLine: true } : {}) } }));
    });
    return res.filter((r) => r.text.length || r.options.breakLine);
  };
  if (typeof text === "string") {
    if (!text.includes("_")) return text;
    return lines(subRuns(text));
  }
  return lines(text.flatMap((r) => subRuns(r.text, r.options || {})));
}
function T(s, text, o = {}) {
  text = withSubs(text);
  const opt = {
    x: o.x, y: o.y, w: o.w, h: o.h, fontFace: o.bold ? FONT_SB : (o.font || FONT), fontSize: o.size || 14,
    color: o.color || C.ink, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0,
    isTextBox: true, objectName: nm(o.name), italic: o.italic, rotate: o.rotate,
    paraSpaceAfter: o.psa, lineSpacingMultiple: o.lsm, fit: undefined,
  };
  if (o.fill) opt.fill = { color: o.fill, transparency: o.ft || 0 };
  if (o.line) opt.line = { color: o.line, width: o.lw || 0.75 };
  if (o.shape) { opt.shape = o.shape; opt.rectRadius = o.r; }
  s.addText(text, opt);
}
function R(s, o) { // rectangle / rounded rectangle
  const shape = o.r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE;
  const opt = { x: o.x, y: o.y, w: Math.max(o.w, 0.001), h: Math.max(o.h, 0.001), objectName: nm(o.name),
    fill: o.fill ? { color: o.fill, transparency: o.ft || 0 } : { type: "none" },
    line: o.line ? { color: o.line, width: o.lw || 0.75, dashType: o.dash } : { type: "none" }, rotate: o.rotate };
  if (o.r) opt.rectRadius = o.r;
  if (o.shadow) opt.shadow = { type: "outer", color: "000000", opacity: 0.12, blur: 6, offset: 1.5, angle: 90 };
  s.addShape(shape, opt);
}
function E(s, o) { // ellipse, centred on cx,cy
  s.addShape(pres.shapes.OVAL, { x: o.cx - o.rx, y: o.cy - (o.ry ?? o.rx), w: 2 * o.rx, h: 2 * (o.ry ?? o.rx), objectName: nm(o.name),
    fill: o.fill ? { color: o.fill, transparency: o.ft || 0 } : { type: "none" },
    line: o.line ? { color: o.line, width: o.lw || 0.75 } : { type: "none" } });
}
function L(s, x1, y1, x2, y2, o = {}) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  s.addShape(pres.shapes.LINE, { x, y, w: Math.max(Math.abs(x2 - x1), 0.0001), h: Math.max(Math.abs(y2 - y1), 0.0001),
    flipH: (x2 < x1) !== (y2 < y1) ? true : false, objectName: nm(o.name),
    line: { color: o.color || C.grey, width: o.w || 1, dashType: o.dash, endArrowType: o.arrow ? "triangle" : undefined, beginArrowType: o.arrow2 ? "triangle" : undefined } });
}
function G(s, pts, o = {}) { // freeform polyline / polygon from absolute points [[x,y],...]
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - x0, 0.01), h = Math.max(Math.max(...ys) - y0, 0.01);
  const points = pts.map((p, i) => ({ x: p[0] - x0, y: p[1] - y0, ...(i === 0 ? { moveTo: true } : {}) }));
  if (o.close) points.push({ close: true });
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, { x: x0, y: y0, w, h, points, objectName: nm(o.name),
    fill: o.fill ? { color: o.fill, transparency: o.ft || 0 } : { type: "none" },
    line: o.color ? { color: o.color, width: o.w || 2, dashType: o.dash } : { type: "none" } });
}

// ---------- template furniture ----------
function header(s, title, sub) {
  T(s, title, { x: 0.6, y: 0.4, w: 10.5, h: 0.6, size: 30, name: "title", valign: "middle" });
  if (sub) T(s, sub, { x: 0.62, y: 1.0, w: 12.1, h: 0.36, size: 16, color: C.grey, name: "sub", valign: "middle" });
}
function key(s, text) {
  T(s, text, { x: 0.6, y: 6.32, w: 12.13, h: 0.4, size: 16, align: "center", valign: "middle", name: "key" });
}
function notes(s, t) { if (t) s.addNotes(t); }
function stepDots(s, n, cur) {
  for (let i = 0; i < n; i++)
    E(s, { cx: 12.73 - (n - 1 - i) * 0.17, cy: 0.62, rx: 0.045, fill: i <= cur ? C.ink : C.line, name: "sdot" + i });
}
// numbered explanation card (AC style: light panel, number circle, bold heading)
function card(s, { x, y, w, h, n, head, body, color = C.ink, name = "card" }) {
  R(s, { x, y, w, h, fill: C.panel, r: 0.08, name });
  let tx = x + 0.25;
  if (n !== undefined) {
    E(s, { cx: x + 0.42, cy: y + 0.42, rx: 0.19, fill: color, name: name + "n" });
    T(s, String(n), { x: x + 0.23, y: y + 0.23, w: 0.38, h: 0.38, size: 12, bold: true, color: C.white, align: "center", valign: "middle", name: name + "nt" });
    tx = x + 0.75;
  }
  T(s, head, { x: tx, y: y + 0.24, w: w - (tx - x) - 0.2, h: 0.38, size: 16, bold: true, color, valign: "middle", name: name + "h" });
  T(s, body, { x: x + 0.25, y: y + 0.78, w: w - 0.5, h: h - 0.95, size: 13, color: C.grey, name: name + "b", psa: 6 });
}
// knob: the parameter being turned (slider). vals: tick values; val: current
function knob(s, { x, y, w, label, ticks, val, fmt = (v) => v, color = C.blue, min, max, unit = "" }) {
  min = min ?? ticks[0]; max = max ?? ticks[ticks.length - 1];
  const px = (v) => x + ((v - min) / (max - min)) * w;
  T(s, [{ text: label + "   ", options: { color: C.grey } }, { text: String(fmt(val)) + unit, options: { color } }], { x: x - 0.02, y: y - 0.45, w: w + 0.1, h: 0.3, size: 12, bold: true, name: "knobLbl" });
  R(s, { x, y: y - 0.03, w, h: 0.06, fill: C.line, r: 0.03, name: "knobTrack" });
  R(s, { x, y: y - 0.03, w: Math.max(px(val) - x, 0.02), h: 0.06, fill: color, r: 0.03, name: "knobFill" });
  ticks.forEach((t, i) => T(s, String(fmt(t)), { x: px(t) - 0.4, y: y + 0.12, w: 0.8, h: 0.22, size: 9, color: C.mute, align: "center", name: "knobT" + i }));
  E(s, { cx: px(val), cy: y, rx: 0.11, fill: C.white, line: color, lw: 2.25, name: "knobThumb" });
}
// metric chips: [{k:'V_T', v:'0.25 V', d:+1|-1|0, good:true|false}]
function chips(s, items, { x, y, w = 1.42, h = 0.78, gap = 0.12, cols = items.length, prefix = "chip" }) {
  items.forEach((it, i) => {
    const cx = x + (i % cols) * (w + gap), cy = y + Math.floor(i / cols) * (h + gap);
    const col = it.d === 0 || it.d === undefined ? C.grey : it.good ? C.green : C.red;
    R(s, { x: cx, y: cy, w, h, fill: C.panel, r: 0.06, name: prefix + i });
    T(s, it.k, { x: cx + 0.12, y: cy + 0.08, w: w - 0.24, h: 0.24, size: 10, color: C.grey, name: prefix + "k" + i });
    const arrow = it.d > 0 ? " ▲" : it.d < 0 ? " ▼" : "";
    T(s, [{ text: it.v, options: { color: C.ink } }, { text: arrow, options: { color: col, fontSize: 10 } }],
      { x: cx + 0.12, y: cy + 0.34, w: w - 0.2, h: 0.36, size: 15, bold: true, name: prefix + "v" + i, valign: "middle" });
  });
}

// ---------- plot helper ----------
function axes(s, box, { xr, yr, ylog = false, xt = [], yt = [], xl = "", yl = "", xf = (v) => v, yf = (v) => v, grid = true, name = "ax" }) {
  const { x, y, w, h } = box;
  const mx = (v) => x + ((v - xr[0]) / (xr[1] - xr[0])) * w;
  const my = ylog
    ? (v) => y + h - ((Math.log10(Math.max(v, 1e-30)) - Math.log10(yr[0])) / (Math.log10(yr[1]) - Math.log10(yr[0]))) * h
    : (v) => y + h - ((v - yr[0]) / (yr[1] - yr[0])) * h;
  if (grid) yt.forEach((t, i) => L(s, x, my(t), x + w, my(t), { color: "EDEEF0", w: 0.75, name: name + "g" + i }));
  L(s, x, y + h, x + w, y + h, { color: C.mute, w: 1, name: name + "xa" });
  L(s, x, y, x, y + h, { color: C.mute, w: 1, name: name + "ya" });
  xt.forEach((t, i) => T(s, String(xf(t)), { x: mx(t) - 0.35, y: y + h + 0.05, w: 0.7, h: 0.22, size: 9, color: C.grey, align: "center", name: name + "xt" + i }));
  yt.forEach((t, i) => T(s, String(yf(t)), { x: x - 0.75, y: my(t) - 0.11, w: 0.68, h: 0.22, size: 9, color: C.grey, align: "right", name: name + "yt" + i }));
  if (xl) T(s, xl, { x, y: y + h + 0.3, w, h: 0.25, size: 11, color: C.grey, align: "center", name: name + "xl" });
  if (yl) T(s, yl, { x: x - 0.2, y: y - 0.33, w: 3.5, h: 0.25, size: 11, color: C.grey, name: name + "yl" });
  return { mx, my };
}
function fmtTick(a) { // axis ticks: 100 pA, 10 nA, 1 µA
  const v = Math.abs(a);
  const f = (x) => (Math.abs(x - Math.round(x)) < 1e-6 ? String(Math.round(x)) : x.toPrecision(2));
  if (v >= 1e-6) return f(a * 1e6) + " µA";
  if (v >= 1e-9) return f(a * 1e9) + " nA";
  return f(a * 1e12) + " pA";
}
function fmtI(a) { // amps → readable
  const v = Math.abs(a);
  if (v >= 1e-6) return (a * 1e6).toFixed(a * 1e6 >= 10 ? 1 : 1) + " µA";
  if (v >= 1e-9) return (a * 1e9).toFixed(0) + " nA";
  return (a * 1e12).toFixed(0) + " pA";
}
const PHI_T = 0.02585;
function ekv(vg, vt, ss, is = 5.6e-7) { // simple EKV-like transfer curve (A)
  const n = ss / 59.5;
  const x = (vg - vt) / (2 * n * PHI_T);
  const l = x > 30 ? x : Math.log(1 + Math.exp(x));
  return is * l * l;
}
const range = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));

// table cell with subscripts
function cell(text, opt = {}) { const t = withSubs(String(text)); return { text: typeof t === "string" ? t : t, options: opt }; }
module.exports = { cell, withSubs, pptxgen, W, H, C, FONT, FONT_SB, newPres, section, slide, T, R, E, L, G, header, key, notes, stepDots, card, knob, chips, axes, fmtI, fmtTick, ekv, range, get pres() { return pres; } };
