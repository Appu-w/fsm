// Opening: title, abstract, contents (+ contents reused as section dividers)
const { C, section, slide, T, R, E, L, G, header, key, notes, FONT_SB } = require("./lib");

const CHAPTERS = [
  ["The MOSFET switch", "Build it · turn the gate · turn the drain · V_T and SS in depth"],
  ["Shrinking the gate", "Shorter L_g · DIBL and leakage · the scale length λ"],
  ["FinFET → GAAFET", "More gate sides · fin width · wire, sheet, stack · our GAA in numbers"],
  ["The new problem: heat", "Oxide traps heat · ΔT = R_th · P · what heat does to every metric"],
  ["Literature and method", "Five papers · base paper Chen et al. 2025 · Silvaco Atlas flow"],
  ["Three stages in TCAD", "Standard GAAFET · reproduce the paper · optimal design D"],
  ["Conclusion", "Gains and limits · the whole story · next steps"],
];

function gaaRings(s, cx, cy, k = 1, pre = "ring") {
  E(s, { cx, cy, rx: 1.35 * k, fill: C.gate, name: pre + "g" });
  E(s, { cx, cy, rx: 0.98 * k, fill: C.hfo2, name: pre + "h" });
  E(s, { cx, cy, rx: 0.86 * k, fill: C.oxide, name: pre + "o" });
  E(s, { cx, cy, rx: 0.74 * k, fill: C.body, name: pre + "s" });
}

function titleSlide() {
  section("Opening");
  const s = slide("TITLE");
  T(s, "Self-Heating in a Cylindrical GAAFET:\nfrom the MOSFET to a Cooler Device", { x: 0.6, y: 1.7, w: 8.4, h: 1.7, size: 32, name: "title", valign: "middle" });
  T(s, "How every device parameter changes on the way from a planar MOSFET to a cooler gate-all-around transistor", { x: 0.62, y: 3.65, w: 7.6, h: 0.7, size: 15, color: C.grey, name: "sub" });
  gaaRings(s, 10.6, 3.0, 1.15);
  T(s, "cylindrical GAAFET cross-section", { x: 9.1, y: 4.75, w: 3.0, h: 0.3, size: 10, color: C.mute, align: "center" });
  L(s, 0.6, 5.35, 12.73, 5.35, { color: C.line, w: 0.75 });
  [["Nithyanand B", "CB.EN.P2VLD26021"], ["Priyadharshini K", "CB.EN.P2VLD26025"], ["Sivaprakash R", "CB.EN.P2VLD26027"]].forEach(([n, id], i) => {
    T(s, n, { x: 0.6 + i * 4.0, y: 5.55, w: 3.6, h: 0.32, size: 17 });
    T(s, id, { x: 0.6 + i * 4.0, y: 5.88, w: 3.6, h: 0.28, size: 12, color: C.grey });
  });
  T(s, "M.Tech VLSI Design  ·  Analog VLSI and Device Modelling Lab (25VL681)", { x: 0.6, y: 6.5, w: 9, h: 0.3, size: 13, bold: true });
  notes(s, "Our project studies heat in gate-all-around transistors. We start from the ordinary MOSFET and follow every key parameter as the device changes: planar, FinFET, GAA. Then we show the heat problem GAA brings, reproduce one base paper in Silvaco Atlas, and propose a cooler device.");
}

function abstractSlide() {
  const s = slide();
  header(s, "Abstract", "In one line: we follow a transistor from planar to gate-all-around, then make it run 16 % cooler");
  const items = [
    ["Problem", C.red, "Short planar MOSFETs leak: the drain, not the gate, starts to control the channel."],
    ["Industry fix", C.blue, "Wrap the gate around the channel: planar → FinFET → gate-all-around (GAA)."],
    ["New problem", C.orange, "The oxide wrapped around the channel conducts heat 10–100× worse than silicon."],
    ["Base paper", C.ink, "Chen et al., IEEE EDTM 2025: a 3-nm GAA NMOS heats by 64.8 K at 30 µW."],
    ["What we did", C.teal, "Built a cylindrical GAAFET in Silvaco Atlas 3D, matched the paper, tried four cooler designs."],
    ["Result", C.green, "68.0 K vs 64.8 K (+5 %). Design D: 16.4 % cooler, 2.5× less leakage, −7.8 % on-current."],
  ];
  items.forEach(([h, col, b], i) => {
    const y = 1.6 + i * 0.75;
    T(s, h, { x: 0.6, y, w: 5.6, h: 0.28, size: 14, bold: true, color: col });
    T(s, b, { x: 0.6, y: y + 0.28, w: 5.8, h: 0.42, size: 12, color: C.grey });
  });
  // journey on the right
  const nodes = [["MOSFET", "leaks", C.red, "DIBL 202 mV/V"], ["FinFET", "3 sides", C.blue, "DIBL 62 mV/V"], ["GAAFET", "all round", C.blue, "DIBL 41 mV/V"],
    ["Heat", "trapped", C.orange, "ΔT 64.8 K"], ["Reproduce", "+5 %", C.ink, "68.0 K"], ["Optimal", "cooler", C.green, "−16.4 % ΔT"]];
  R(s, { x: 7.0, y: 1.55, w: 5.73, h: 4.55, fill: C.panel, r: 0.06 });
  T(s, "The journey in six steps", { x: 7.3, y: 1.7, w: 5, h: 0.3, size: 13, bold: true, color: C.grey });
  nodes.forEach(([a, b, col, v], i) => {
    const y = 2.2 + i * 0.63;
    if (i < nodes.length - 1) L(s, 7.62, y + 0.24, 7.62, y + 0.63, { color: C.line, w: 2 });
    E(s, { cx: 7.62, cy: y + 0.12, rx: 0.2, fill: col });
    T(s, String(i + 1), { x: 7.42, y: y - 0.08, w: 0.4, h: 0.4, size: 12, bold: true, color: C.white, align: "center", valign: "middle" });
    T(s, a, { x: 8.0, y: y - 0.04, w: 1.6, h: 0.32, size: 15, bold: true });
    T(s, b, { x: 9.6, y: y - 0.02, w: 1.5, h: 0.3, size: 12, color: C.grey });
    T(s, v, { x: 10.9, y: y - 0.02, w: 1.7, h: 0.3, size: 12, bold: true, color: col, align: "right" });
  });
  key(s, "Better gate control brought a heat problem; we measure it, match the paper, then lower it.");
  notes(s, "Short MOSFETs leak. GAA fixes this by wrapping the gate around the channel, but the oxide that wraps it also traps heat. We pick one base paper, build a GAAFET, reproduce its self-heating within 5 percent, then design a device that runs 16.4 percent cooler.");
}

// Contents; active = index of chapter to highlight (-1 = none)
function contents(active = -1) {
  const s = slide();
  header(s, "Contents");
  const y0 = 1.45, dy = 0.7;
  L(s, 0.95, y0 + 0.2, 0.95, y0 + 0.2 + dy * (CHAPTERS.length - 1), { color: C.line, w: 3, name: "tocLine" });
  CHAPTERS.forEach(([h, sub], i) => {
    const y = y0 + i * dy, on = i === active, done = active >= 0 && i < active;
    E(s, { cx: 0.95, cy: y + 0.2, rx: 0.2, fill: on ? C.ink : C.white, line: on ? C.ink : done ? C.green : "9C7A3C", lw: 1.25, name: "tocC" + i });
    T(s, String(i + 1).padStart(2, "0"), { x: 0.75, y: y + 0.03, w: 0.4, h: 0.34, size: 10, bold: true, color: on ? C.white : C.ink, align: "center", valign: "middle", name: "tocN" + i });
    T(s, h, { x: 1.45, y: y - 0.05, w: 7, h: 0.38, size: on ? 20 : 18, color: active >= 0 && !on ? C.mute : C.ink, bold: on, name: "tocH" + i, valign: "middle" });
    T(s, sub, { x: 1.45, y: y + 0.33, w: 9, h: 0.26, size: 11, color: active >= 0 && !on ? "A9ACB1" : C.grey, name: "tocS" + i });
  });
  if (active >= 0) {
    R(s, { x: 9.3, y: 2.2, w: 3.43, h: 2.6, fill: C.panel, r: 0.08, name: "tocCard" });
    T(s, "Chapter " + String(active + 1).padStart(2, "0"), { x: 9.55, y: 2.45, w: 3, h: 0.3, size: 12, color: C.grey, name: "tocCk" });
    T(s, CHAPTERS[active][0], { x: 9.55, y: 2.8, w: 3, h: 0.9, size: 22, bold: true, name: "tocCh" });
    T(s, CHAPTERS[active][1].split(" · ").join("\n"), { x: 9.55, y: 3.7, w: 3, h: 1.0, size: 11, color: C.grey, name: "tocCs" });
  }
  return s;
}

function opening() {
  titleSlide();
  abstractSlide();
  const s = contents(-1);
  notes(s, "Seven chapters. Each later chapter changes one thing about the transistor and shows how the key numbers move.");
}

module.exports = { opening, contents, CHAPTERS, gaaRings };
