// Chapter 2: shrinking the gate
const { C, section, slide, T, R, E, L, G, header, key, notes, stepDots, card, knob, chips, axes, range } = require("./lib");
const { contents } = require("./s0");
const { mos, band } = require("./s1");

const LAM_P = 4.37;
const dvt = (lg, vd, lam = LAM_P) => (1 + vd) * Math.exp(-lg / (2 * lam));

function scalingSlide() {
  const s = slide();
  header(s, "Shrinking the gate – Why shorten L_g", "Every new node made the gate shorter: faster, smaller and cheaper chips");
  const gens = [["~1 µm", "1980s", 1000], ["~100 nm", "2000s", 100], ["~20 nm", "2012", 20], ["~14 nm", "our device", 14]];
  gens.forEach(([lg, yr, v], i) => {
    const x = 0.9 + i * 3.05, w = 0.35 + 2.2 * Math.log10(v) / 3;
    R(s, { x: x, y: 2.9, w: 2.6, h: 0.9, fill: C.body, r: 0.04 });
    R(s, { x: x + 1.3 - w / 2, y: 2.35, w, h: 0.45, fill: i === 3 ? C.purple : C.gate, r: 0.04 });
    R(s, { x, y: 2.9, w: 1.3 - w / 2 + 0.03, h: 0.35, fill: C.nplus });
    R(s, { x: x + 1.3 + w / 2 - 0.03, y: 2.9, w: 1.3 - w / 2 + 0.03, h: 0.35, fill: C.nplus });
    T(s, lg, { x, y: 4.0, w: 2.6, h: 0.4, size: 20, bold: true, align: "center", color: i === 3 ? C.purple : C.ink });
    T(s, yr, { x, y: 4.4, w: 2.6, h: 0.3, size: 12, color: C.grey, align: "center" });
    if (i < 3) T(s, "→", { x: x + 2.6, y: 2.95, w: 0.45, h: 0.5, size: 22, color: C.mute, align: "center" });
  });
  R(s, { x: 0.9, y: 5.0, w: 11.8, h: 0.95, fill: C.panel, r: 0.06 });
  T(s, [{ text: "The catch: ", options: { bold: true, color: C.red } }, { text: "a shorter gate also brings source and drain closer together. Below about 20 nm the drain starts to reach under the gate and steal control from it." }], { x: 1.15, y: 5.1, w: 11.3, h: 0.75, size: 15, valign: "middle" });
  key(s, "Shorter L_g: more speed, but source and drain move closer.");
  notes(s, "Typical gate lengths over the generations, not to scale. Our device has L_g = 14 nm.");
}

function shrink() {
  const lgs = [60, 40, 30, 20, 14];
  const keys = [
    "Long gate: the drain cannot reach the hill top. V_T is set by the gate alone.",
    "Shorter: the drain depletion starts to reach under the gate; V_T barely moves.",
    "Shorter still: with high V_D the hill top sinks a little (DIBL = 32 mV/V).",
    "Source and drain depletions almost touch; V_T drops and leakage starts below the gate.",
    "At 14 nm the depletions meet: V_T collapses and current leaks below the gate.",
  ];
  lgs.forEach((lg, i) => {
    const s = slide();
    header(s, "Shrinking the gate – Planar MOSFET", "Same voltages (V_G = 0, V_D = 0.7 V); only the knob L_g changes");
    stepDots(s, lgs.length, i);
    const c = 3.5, half = lg * 0.03;
    const gx0 = c - half, gx1 = c + half;
    mos(s, { gx0, gx1, vg: 0, vd: 0.7, sdDepl: 0.42, leak: lg <= 20, show: { body: 1, sd: 1, gate: 1, labels: 1 } });
    T(s, "pink = depletion around source and drain", { x: 0.7, y: 4.07, w: 3.5, h: 0.22, size: 9, color: C.grey, name: "lg2t" });
    const dl = dvt(lg, 0.7);
    band(s, { gx0, gx1, hb: 0.8, vd: 0.7, dibl: dl - dvt(lg, 0), nE: lg <= 20 ? 2 : 0 });
    L(s, 0.7, 5.2 - 0.85 * 0.8, 6.3, 5.2 - 0.85 * 0.8, { color: C.mute, w: 0.75, dash: "dash", name: "bTop" });
    T(s, "long-channel hill top", { x: 4.6, y: 5.2 - 0.85 * 0.8 - 0.25, w: 1.7, h: 0.22, size: 9, color: C.mute, align: "right", name: "bTopL" });
    // VT vs Lg
    const box = { x: 8.0, y: 1.75, w: 4.6, h: 2.55 };
    const { mx, my } = axes(s, box, { xr: [10, 60], yr: [-0.2, 0.3], xt: [10, 20, 30, 40, 50, 60], yt: [-0.2, -0.1, 0, 0.1, 0.2, 0.3], yf: (v) => v.toFixed(1), xl: "gate length L_g (nm)", yl: "threshold voltage V_T (V)" });
    const xs = range(10, 60, 40);
    G(s, xs.map((l) => [mx(l), my(0.25 - dvt(l, 0.05))]), { color: C.teal, w: 2.25, name: "vtLo" });
    G(s, xs.map((l) => [mx(l), my(0.25 - dvt(l, 0.7))]), { color: C.red, w: 2.25, name: "vtHi" });
    T(s, "V_D = 0.05 V", { x: mx(44), y: my(0.25) - 0.32, w: 1.2, h: 0.22, size: 10, bold: true, color: C.teal, name: "vtLoL" });
    T(s, "V_D = 0.7 V", { x: mx(44), y: my(0.25) + 0.12, w: 1.2, h: 0.22, size: 10, bold: true, color: C.red, name: "vtHiL" });
    const vlo = 0.25 - dvt(lg, 0.05), vhi = 0.25 - dvt(lg, 0.7);
    L(s, mx(lg), my(vlo), mx(lg), my(vhi), { color: C.purple, w: 2, name: "vtGap" });
    E(s, { cx: mx(lg), cy: my(vlo), rx: 0.08, fill: C.teal, line: C.white, lw: 1.5, name: "vtPtLo" });
    E(s, { cx: mx(lg), cy: my(vhi), rx: 0.08, fill: C.red, line: C.white, lw: 1.5, name: "vtPtHi" });
    const dibl = (vlo - vhi) / 0.65 * 1000;
    chips(s, [
      { k: "V_T (V_D = 0.05 V)", v: vlo.toFixed(2) + " V", d: i ? -1 : 0, good: false },
      { k: "V_T (V_D = 0.7 V)", v: vhi.toFixed(2) + " V", d: i ? -1 : 0, good: false },
      { k: "DIBL", v: Math.round(dibl) + " mV/V", d: i ? 1 : 0, good: false },
    ], { x: 7.5, y: 4.85, w: 1.65, h: 0.72 });
    knob(s, { x: 7.7, y: 6.05, w: 4.9, label: "KNOB: gate length L_g", ticks: [10, 20, 30, 40, 50, 60], val: lg, unit: " nm", color: C.purple });
    key(s, keys[i]);
    notes(s, "Model: ΔV_T = −(1 V + V_D)·exp(−L_g / 2λ), planar λ = 4.37 nm, long-channel V_T = 0.25 V. DIBL is the V_T gap between the two drain voltages divided by 0.65 V.");
  });
}

function sceSummary() {
  const s = slide();
  header(s, "Shrinking the gate – Short-channel effects", "At 14 nm the drain, not the gate, starts to control the channel");
  const c = 3.5, half = 14 * 0.03;
  mos(s, { gx0: c - half, gx1: c + half, vg: 0, vd: 0.7, sdDepl: 0.42, leak: true, show: { body: 1, sd: 1, gate: 1, labels: 1 } });
  T(s, "The gate sits on one side only. Deep below, its field is weak and the drain takes over.", { x: 0.7, y: 4.5, w: 5.6, h: 0.7, size: 14, color: C.grey });
  const items = [["DIBL ▲", "drain voltage lowers V_T", "1 → 202 mV/V", C.red], ["SS ▲", "turn-on is softer than 60 mV/dec", "≈ 60 → 100 mV/dec", C.orange], ["I_off ▲", "leakage below the gate even when off", "pA → 241 nA", C.red]];
  items.forEach(([h, b, v, col], i) => {
    const y = 1.75 + i * 1.3;
    R(s, { x: 7.3, y, w: 5.43, h: 1.1, fill: C.panel, r: 0.08 });
    T(s, h, { x: 7.55, y: y + 0.15, w: 2.0, h: 0.4, size: 20, bold: true, color: col });
    T(s, b, { x: 7.55, y: y + 0.6, w: 3.4, h: 0.35, size: 13, color: C.grey });
    T(s, v, { x: 10.3, y: y + 0.22, w: 2.25, h: 0.6, size: 15, bold: true, align: "right", valign: "middle" });
  });
  T(s, "Planar values from 60 nm to 14 nm, simple λ model.", { x: 7.3, y: 5.65, w: 5.4, h: 0.3, size: 11, color: C.mute });
  key(s, "Three symptoms, one cause: the gate controls the channel from one side only.");
  notes(s, "When the channel is short, the drain depletion region reaches toward the source. The drain voltage lowers the barrier the gate is supposed to set, and current leaks below the surface where the gate has little control.");
}

// cross-section icon: silicon body with gate bars on N sides
function sidesIcon(s, n, cx = 2.0, cy = 3.7) {
  const a = 0.75;
  R(s, { x: cx - a, y: cy - a, w: 2 * a, h: 2 * a, fill: C.body, name: "icSi" });
  T(s, "silicon\n8 nm", { x: cx - a, y: cy - 0.3, w: 2 * a, h: 0.6, size: 11, color: "8A6D1F", align: "center", valign: "middle", name: "icSiL" });
  const t = 0.22;
  const bars = [
    { x: cx - a - 0.08, y: cy - a - t - 0.08, w: 2 * a + 0.16, h: t }, // top
    { x: cx - a - 0.08, y: cy + a + 0.08, w: 2 * a + 0.16, h: t },     // bottom
    { x: cx - a - t - 0.08, y: cy - a - 0.08, w: t, h: 2 * a + 0.16 }, // left
    { x: cx + a + 0.08, y: cy - a - 0.08, w: t, h: 2 * a + 0.16 },     // right
  ];
  const order = [[0], [0, 1], [0, 2, 3], [0, 1, 2, 3]][n - 1];
  bars.forEach((b, i) => {
    const on = order.includes(i);
    R(s, { ...b, fill: on ? C.gateD : "F1F2F4", line: on ? undefined : "D9DCE3", dash: "dash", lw: 0.75, name: "icG" + i });
  });
  const names = ["planar (1 side)", "double gate (2 sides)", "FinFET (3 sides)", "gate-all-around (4)"];
  T(s, names[n - 1], { x: cx - 1.4, y: cy + a + 0.5, w: 2.8, h: 0.3, size: 14, bold: true, align: "center", name: "icName" });
}

function lambda() {
  const lam = [4.37, 3.09, 2.52, 2.18];
  const cols = [C.red, C.orange, C.blue, C.green];
  lam.forEach((l, k) => {
    const s = slide();
    header(s, "Shrinking the gate – Proof: the scale length λ", "The drain potential fades into the channel as e^(−x/λ); more gate sides → smaller λ");
    stepDots(s, 4, k);
    sidesIcon(s, k + 1);
    const box = { x: 4.4, y: 1.8, w: 4.4, h: 3.5 };
    const { mx, my } = axes(s, box, { xr: [0, 14], yr: [0, 1], xt: [0, 2, 4, 6, 8, 10, 12, 14], yt: [0, 0.25, 0.5, 0.75, 1], yf: (v) => Math.round(v * 100) + " %", xl: "distance from the drain into the channel x (nm)", yl: "drain pull left  e^(−x/λ)" });
    for (let j = 0; j <= k; j++) {
      const xs = range(0, 14, 36);
      G(s, xs.map((x) => [mx(x), my(Math.exp(-x / lam[j]))]), { color: cols[j], w: j === k ? 3 : 1.75, name: "lmC" + j });
      const end = Math.exp(-14 / lam[j]);
      if (j === k) T(s, (end * 100).toFixed(2) + " %", { x: mx(14) - 0.3, y: my(end) - 0.32, w: 0.8, h: 0.2, size: 9, bold: true, color: cols[j], name: "lmE" + j });
    }
    T(s, "λ = √( ε_si · t_si · t_ox / (N · ε_ox) )", { x: 9.5, y: 1.75, w: 3.3, h: 0.35, size: 14, bold: true, name: "lmEq" });
    T(s, "N = gate sides · ε_si/ε_ox = 3\nt_si = 8 nm, t_ox = EOT 0.8 nm", { x: 9.5, y: 2.15, w: 3.3, h: 0.55, size: 11, color: C.grey, name: "lmEq2" });
    chips(s, [
      { k: "scale length λ", v: l.toFixed(2) + " nm", d: k ? -1 : 0, good: true },
      { k: "L_g / λ at 14 nm", v: (14 / l).toFixed(1), d: k ? 1 : 0, good: true },
      { k: "drain pull at source end", v: (Math.exp(-14 / l) * 100).toFixed(2) + " %", d: k ? -1 : 0, good: true },
    ], { x: 9.5, y: 2.9, w: 3.23, h: 0.68, cols: 1, gap: 0.1 });
    knob(s, { x: 9.6, y: 5.75, w: 3.0, label: "KNOB: gate sides N", ticks: [1, 2, 3, 4], val: k + 1, color: C.purple });
    key(s, ["Planar: λ = 4.37 nm; 4 % of the drain pull still reaches the source end of a 14 nm gate.", "Two gate sides: λ = 3.09 nm, the pull drops to 1 %.", "FinFET, three sides: λ = 2.52 nm, 0.39 %.", "Gate-all-around: λ = 2.18 nm, only 0.16 %. The gate needs L_g ≥ 5–10 λ to stay in control."][k]);
    notes(s, "Same 8 nm silicon and 0.8 nm EOT for all four. EOT = 0.6 nm SiO2 + 1.1 nm HfO2 × 3.9/22 = 0.8 nm. Each extra gate side drains away the drain field, so it dies faster.");
  });
}

function chapter2() {
  section("2 · Shrinking the gate");
  notes(contents(1), "Chapter 2: what goes wrong when the gate gets short.");
  scalingSlide();
  shrink();
  sceSummary();
  lambda();
}
module.exports = { chapter2, sidesIcon, dvt };
