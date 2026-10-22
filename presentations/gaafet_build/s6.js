// Chapter 6: three stages in TCAD
const lib = require("./lib");
const { cell, C, section, slide, T, R, E, L, G, header, key, notes, stepDots, card, knob, chips, axes, fmtI, fmtTick, range } = lib;
const { contents } = require("./s0");
const D = require("./data");
const HD = { bold: true, color: C.white, fill: { color: C.ink } };
const TB = { fontFace: "Segoe UI", color: C.ink, border: { type: "solid", color: C.white, pt: 1.5 }, valign: "middle" };

function code(s, text, name = "code") {
  R(s, { x: 0.6, y: 5.35, w: 12.13, h: 0.75, fill: C.ink, r: 0.06, name });
  T(s, text, { x: 0.85, y: 5.35, w: 11.7, h: 0.75, size: 12, font: "Courier New", color: "D9F2E3", valign: "middle", name: name + "t" });
}

// ---------- 6.1 stage 1: built layer by layer ----------
function stage1Build() {
  const steps = [
    ["Step 1: the silicon wire", "A silicon cylinder, radius 4 nm, 58 nm long", "REGION NUM=1 MATERIAL=silicon R.MAX=0.004 Z.MIN=-0.029 Z.MAX=0.029", "Everything starts from one silicon wire."],
    ["Step 2: interfacial oxide", "A 0.6 nm SiO2 shell around the channel only", "REGION NUM=2 MATERIAL=oxide R.MIN=0.004 R.MAX=0.0046 Z.MIN=-0.007 Z.MAX=0.007", "The oxide sits only under the gate."],
    ["Step 3: high-κ dielectric", "A 1.1 nm HfO2 shell, as in Table I", "REGION NUM=3 MATERIAL=HfO2 R.MIN=0.0046 R.MAX=0.0057 Z.MIN=-0.007 Z.MAX=0.007", "High-κ for gate control; low κ for heat."],
    ["Step 4: gate and spacers", "A 3 nm tungsten gate, Si3N4 spacers, oxide over S/D", "REGION NUM=8 MATERIAL=tungsten R.MIN=0.0057 R.MAX=0.0087   ·   REGION NUM=4/5 MATERIAL=nitride Z=±(0.007–0.012)", "The gate now wraps the channel on all sides."],
    ["Step 5: doping, contacts, heat exits", "n+ source/drain, p channel; three electrodes at 300 K", "doping n.type 1e20 (S/D), 1e19 (ext), p.type 1e16   ·   thermcontact elec.num=1..3 ext.temp=300 alpha=5000", "The standard device is complete."],
  ];
  steps.forEach(([h, sub, c, k], i) => {
    const s = slide();
    header(s, "Stage 1 – Standard GAAFET, layer by layer", h + " · " + sub);
    stepDots(s, steps.length, i);
    // cross-section
    const cx = 2.1, cy = 3.25, sc = 0.13;
    T(s, "cross-section at the gate", { x: 0.6, y: 1.55, w: 3, h: 0.25, size: 11, color: C.grey, align: "center", name: "s1xl" });
    E(s, { cx, cy, rx: (i >= 3 ? 8.7 : 4) * sc, fill: i >= 3 ? C.metal : C.white, name: "s1xW" });
    E(s, { cx, cy, rx: (i >= 2 ? 5.7 : 4) * sc, fill: i >= 2 ? C.hfo2 : C.white, name: "s1xH" });
    E(s, { cx, cy, rx: (i >= 1 ? 4.6 : 4) * sc, fill: i >= 1 ? C.oxide : C.white, name: "s1xO" });
    E(s, { cx, cy, rx: 4 * sc, fill: C.body, name: "s1xS" });
    T(s, "r = 4 nm", { x: cx - 0.6, y: cy - 0.12, w: 1.2, h: 0.24, size: 10, bold: true, color: "8A6D1F", align: "center", name: "s1xr" });
    // side view along z: 17 | 5 | 14 | 5 | 17 nm
    const z0 = 4.3, zs = 0.13, seg = [17, 5, 14, 5, 17], yC = 3.25, rw = 4 * zs;
    let x = z0;
    const xs = seg.map((w) => { const a = x; x += w * zs; return a; });
    const xe = x;
    T(s, "side view along the current (z)", { x: z0, y: 1.55, w: xe - z0, h: 0.25, size: 11, color: C.grey, align: "center", name: "s1zl" });
    if (i >= 3) {
      R(s, { x: xs[2], y: yC - 8.7 * zs, w: 14 * zs, h: 17.4 * zs, fill: C.metal, name: "s1zW" });
      R(s, { x: xs[1], y: yC - 8.7 * zs, w: 5 * zs, h: 17.4 * zs, fill: C.nitride, name: "s1zN1" });
      R(s, { x: xs[3], y: yC - 8.7 * zs, w: 5 * zs, h: 17.4 * zs, fill: C.nitride, name: "s1zN2" });
    }
    if (i >= 2) R(s, { x: xs[2], y: yC - 5.7 * zs, w: 14 * zs, h: 11.4 * zs, fill: C.hfo2, name: "s1zH" });
    if (i >= 1) R(s, { x: xs[2], y: yC - 4.6 * zs, w: 14 * zs, h: 9.2 * zs, fill: C.oxide, name: "s1zO" });
    R(s, { x: z0, y: yC - rw, w: xe - z0, h: 2 * rw, fill: C.body, name: "s1zS" });
    if (i >= 4) {
      R(s, { x: z0, y: yC - rw, w: 17 * zs, h: 2 * rw, fill: C.nplus, name: "s1zSD1" });
      R(s, { x: xs[4], y: yC - rw, w: 17 * zs, h: 2 * rw, fill: C.nplus, name: "s1zSD2" });
      R(s, { x: xs[1], y: yC - rw, w: 5 * zs, h: 2 * rw, fill: "A9BDF0", name: "s1zE1" });
      R(s, { x: xs[3], y: yC - rw, w: 5 * zs, h: 2 * rw, fill: "A9BDF0", name: "s1zE2" });
      [["source", z0, 17], ["gate", xs[2], 14], ["drain", xs[4], 17]].forEach(([n, xx, w], j) => {
        R(s, { x: xx, y: 1.95, w: w * zs, h: 0.22, fill: C.ink, r: 0.03, name: "s1c" + j });
        T(s, n + " · 300 K", { x: xx - 0.2, y: 1.95, w: w * zs + 0.4, h: 0.22, size: 9, bold: true, color: C.white, align: "center", valign: "middle", name: "s1ct" + j });
      });
    }
    seg.forEach((w, j) => T(s, w + " nm", { x: xs[j], y: 4.55, w: w * zs, h: 0.24, size: 10, color: C.grey, align: "center", name: "s1d" + j }));
    // legend
    [["Si channel", C.body, 0], ["SiO2", C.oxide, 1], ["HfO2", C.hfo2, 2], ["W gate", C.metal, 3], ["Si3N4", C.nitride, 3], ["n+ Si", C.nplus, 4]].forEach(([n, col, st], j) => {
      const on = i >= st;
      R(s, { x: 0.7 + j * 2.0, y: 4.95, w: 0.22, h: 0.22, fill: on ? col : C.white, line: on ? undefined : C.line, name: "s1g" + j });
      T(s, n, { x: 1.0 + j * 2.0, y: 4.92, w: 1.6, h: 0.28, size: 11, color: on ? C.ink : "C9CCD3", name: "s1gt" + j });
    });
    code(s, c);
    key(s, k);
    notes(s, ["Start with a 4 nm radius silicon wire along z. Source, extensions, channel and drain are all part of it.", "A thin SiO2 layer sits on the silicon under the gate. It gives a clean interface but conducts heat poorly: 1.4 W/m K.", "HfO2 has a high dielectric constant (22), so the gate couples strongly to the channel. Its thermal conductivity is only 2.3 W/m K.", "The gate metal wraps the stack over the 14 nm gate. Silicon nitride spacers separate the gate from the source and drain extensions.", "Source and drain are doped n plus, the extensions slightly less, the channel lightly p type. Source, drain and gate are heat contacts at 300 K with alpha 5000."][i]);
  });
}

function tiles(s, list, y = 1.75, h = 1.7) {
  list.forEach(([v, l, col], i) => {
    const x = 0.6 + (i % 3) * 4.1, yy = y + Math.floor(i / 3) * (h + 0.25);
    R(s, { x, y: yy, w: 3.85, h, fill: C.panel, r: 0.08 });
    T(s, v, { x: x + 0.25, y: yy + 0.2, w: 3.4, h: 0.8, size: 34, bold: true, color: col || C.ink });
    T(s, l, { x: x + 0.25, y: yy + 1.0, w: 3.4, h: 0.5, size: 13, color: C.grey });
  });
}

function stage1Results() {
  let s = slide();
  header(s, "Stage 1 – Electrical result", "Standard GAAFET: a near-ideal switch");
  tiles(s, [["0.209 V", "V_T (linear)", C.ink], ["61.3 mV/dec", "subthreshold swing", C.green], ["17.3 mV/V", "DIBL", C.green], ["17.9 µA", "I_on at V_G = V_D = 0.7 V", C.ink], ["99 pA", "I_off", C.green], ["12.5 µW", "P_on = I_on × 0.7 V", C.orange]]);
  key(s, "Electrically, the standard device is sound.");
  notes(s, "The standard device switches with a subthreshold swing of 61.3 mV per decade, close to the 60 mV limit, and DIBL of 17.3 mV per volt.");

  s = slide();
  header(s, "Stage 1 – Thermal result", "Far too hot compared with the paper");
  s.addChart(lib.pres.charts.BAR, [{ name: "ΔT", labels: ["Base paper", "Our standard device"], values: [64.8, 727] }], {
    x: 0.6, y: 1.6, w: 6.6, h: 4.5, barDir: "col", chartColors: [C.blue, C.red], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0" K"', dataLabelFontFace: "+mn-lt", dataLabelFontSize: 12, dataLabelColor: C.ink,
    showTitle: true, title: "Temperature rise at 30 µW (K)", titleFontFace: "+mn-lt", titleFontSize: 12, titleColor: C.grey, valAxisMaxVal: 800,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", catAxisLabelColor: C.grey, valAxisLabelColor: C.grey, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    valGridLine: { color: "EDEEF0", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 80,
  });
  [["603 K", "peak lattice temperature at the on point", C.red], ["2.42 × 10⁷", "R_th in K/W (paper: 2.16 × 10⁶)", C.ink], ["11×", "too hot compared with the base paper", C.red]].forEach(([v, l, col], i) => {
    T(s, v, { x: 7.8, y: 1.8 + i * 1.35, w: 4.9, h: 0.65, size: 32, bold: true, color: col });
    T(s, l, { x: 7.8, y: 2.45 + i * 1.35, w: 4.9, h: 0.3, size: 12, color: C.grey });
  });
  key(s, "Thermally wrong: the template heat exits let almost no heat out.");
  notes(s, "The peak lattice temperature is 603 K at 12.5 microwatts. Scaled to 30 microwatts this is a 727 K rise, eleven times the paper.");
}

function stage2Diff() {
  const s = slide();
  header(s, "Stage 2 – What is different from the paper?", "Line-by-line comparison of our standard device with the base paper");
  const rows = [["Gate length", "14 nm", "14 nm", "✓"], ["Gate oxide", "1.1 nm HfO2", "1.1 nm HfO2 + 0.6 nm SiO2", "✓"], ["κ values", "Table I", "Table I", "✓"], ["Channel", "20 × 5 nm sheet = 100 nm²", "wire r = 4 nm = 50 nm²", "✗  change 1"], ["Heat exit", "Si substrate, copper wiring", "contacts with α = 5000", "✗  change 2"]];
  const t = [[cell("Item", HD), cell("Base paper", HD), cell("Our standard device", HD), cell("Same?", HD)]];
  rows.forEach((r) => t.push(r.map((c, j) => cell(c, { bold: j === 0 || j === 3, color: j === 3 ? (c.startsWith("✓") ? C.green : C.red) : C.ink, fill: { color: r[3].startsWith("✗") ? "FBEAEA" : C.panel } }))));
  s.addTable(t, { ...TB, x: 0.6, y: 1.7, w: 12.13, colW: [2.4, 3.9, 3.9, 1.93], fontSize: 14, rowH: 0.6 });
  key(s, "Two changes: the channel area and the heat exit.");
  notes(s, "Gate length, oxide thickness and conductivities already match. Two things do not: the channel shape and how easily heat leaves the device.");
}

function change1() {
  const st = [
    { w: 2.0, h: 0.5, r: 0.06, lab: "Paper: 20 × 5 nm nanosheet = 100 nm²", k: "The paper's channel holds 100 nm² of silicon; our 4 nm wire only 50 nm²." },
    { w: 1.128, h: 1.128, r: 0.564, lab: "π r² = 100 nm²  →  r = 5.64 nm", k: "Same silicon area, so the same heat per volume." },
  ];
  st.forEach((c, k) => {
    const s = slide();
    header(s, "Stage 2 – Change 1: the channel area", "Keep Atlas cylindrical, but give the wire the same silicon area as the paper's sheet");
    stepDots(s, 2, k);
    const cx = 3.4, cy = 3.6, f = 1.6;
    R(s, { x: cx - (c.w * f) / 2, y: cy - (c.h * f) / 2, w: c.w * f, h: c.h * f, fill: C.body, line: "C9A94A", lw: 1.5, r: c.r * f, name: "c1Ch" });
    E(s, { cx, cy, rx: 0.4 * f * 0.8, fill: C.white, ft: 100, line: C.mute, lw: 1, name: "c1Old" });
    T(s, "grey outline: old wire r = 4 nm", { x: cx - 1.5, y: cy + 1.25, w: 3, h: 0.25, size: 11, color: C.mute, align: "center", name: "c1OldL" });
    T(s, c.lab, { x: 0.6, y: 1.65, w: 5.6, h: 0.4, size: 17, bold: true, align: "center", name: "c1Lab" });
    chips(s, [
      { k: "silicon area", v: "100 nm²", d: 0 },
      { k: "radius r", v: k ? "5.64 nm" : "–", d: k ? 1 : 0, good: true },
      { k: "W_eff (perimeter)", v: k ? "35.4 nm" : "50 nm", d: k ? -1 : 0, good: false },
    ], { x: 7.3, y: 1.7, w: 1.73, h: 0.78 });
    if (k) card(s, { x: 7.3, y: 2.75, w: 5.43, h: 2.3, head: "Shells moved out", color: C.blue, body: "SiO2 5.64–6.24 nm\nHfO2 6.24–7.34 nm\nW gate 7.34–10.34 nm", name: "c1Card" });
    else card(s, { x: 7.3, y: 2.75, w: 5.43, h: 2.3, head: "Why area matters", color: C.blue, body: "The same current in less silicon gives more heat per volume. So we match the area first, then the heat exit.", name: "c1Card" });
    key(s, c.k);
    notes(s, "Pi r squared equals 100 square nanometres, so r is 5.64 nm. All oxide and gate shells move out by the same amount.");
  });
}

function change2() {
  const as = [5000, 50000, 59000];
  const rth = (a) => 0.714e6 + 9.18e10 / a;
  as.forEach((a, k) => {
    const s = slide();
    header(s, "Stage 2 – Change 2: the heat exit α", "Fit from our α sweep:  R_th = 0.714 × 10⁶ + 9.18 × 10¹⁰ / α   (K/W, α in W/cm²·K)");
    stepDots(s, as.length, k);
    // stacked resistance bar
    const Rin = 0.714e6, Rex = 9.18e10 / a, sc = 3.6 / 2.0e7;
    const hIn = Math.max(Rin * sc, 0.06), hEx = Math.min(Rex * sc, 3.6);
    const base = 5.0;
    R(s, { x: 1.3, y: base - hIn, w: 1.4, h: hIn, fill: C.navy, name: "c2In" });
    R(s, { x: 1.3, y: base - hIn - hEx, w: 1.4, h: hEx, fill: C.orange, name: "c2Ex" });
    T(s, "R_exit = " + (Rex / 1e6).toFixed(2) + " × 10⁶", { x: 2.85, y: hEx > 0.9 ? base - hIn - hEx / 2 - 0.15 : base - hIn - hEx - 0.45, w: 2.6, h: 0.3, size: 13, bold: true, color: C.orange, name: "c2ExL" });
    T(s, "R_inside = 0.71 × 10⁶ (oxides, gate, silicon: fixed)", { x: 2.85, y: base - 0.3, w: 3.4, h: 0.5, size: 11, color: C.navy, name: "c2InL" });
    T(s, "share of the exit: " + Math.round((Rex / (Rex + Rin)) * 100) + " %", { x: 1.0, y: base + 0.15, w: 3.5, h: 0.3, size: 12, bold: true, name: "c2Sh" });
    // ΔT at 30 µW vs α
    const box = { x: 7.9, y: 1.85, w: 4.6, h: 2.6 };
    const { mx, my } = axes(s, box, { xr: [0, 80000], yr: [0, 200], xt: [0, 20000, 40000, 60000, 80000], xf: (v) => v / 1000 + "k", yt: [0, 50, 100, 150, 200], xl: "heat exit α (W/cm²·K)", yl: "ΔT at 30 µW (K)" });
    G(s, range(14000, 80000, 40).map((x) => [mx(x), my(rth(x) * 30e-6)]), { color: C.orange, w: 2.5, name: "c2C" });
    L(s, mx(0), my(64.8), mx(80000), my(64.8), { color: C.red, w: 1.25, dash: "dash", name: "c2P" });
    T(s, "base paper 64.8 K", { x: mx(52000), y: my(64.8) - 0.28, w: 1.8, h: 0.24, size: 10, bold: true, color: C.red, name: "c2PL" });
    const dT = rth(a) * 30e-6;
    E(s, { cx: mx(a), cy: my(Math.min(dT, 200)), rx: 0.09, fill: C.ink, line: C.white, lw: 1.5, name: "c2Pt" });
    T(s, dT > 200 ? dT.toFixed(0) + " K ↑ off scale" : dT.toFixed(1) + " K", { x: mx(a) + 0.1, y: my(Math.min(dT, 200)) - 0.05, w: 1.7, h: 0.24, size: 11, bold: true, name: "c2PtL" });
    chips(s, [
      { k: "R_th (K/W)", v: (rth(a) / 1e6).toFixed(2) + " × 10⁶", d: k ? -1 : 0, good: true },
      { k: "ΔT at 30 µW", v: dT.toFixed(1) + " K", d: k ? -1 : 0, good: true },
      { k: "vs paper", v: (dT > 64.8 ? "+" : "") + ((dT / 64.8 - 1) * 100).toFixed(0) + " %", d: k ? -1 : 0, good: true },
    ], { x: 7.5, y: 4.95, w: 1.65, h: 0.72 });
    knob(s, { x: 7.7, y: 6.12, w: 4.9, label: "KNOB: heat exit α", ticks: [5000, 30000, 59000, 80000], val: a, min: 0, max: 80000, fmt: (v) => (v >= 1000 ? Math.round(v / 1000) + "k" : v), color: C.orange });
    key(s, ["With the template α = 5000 the contact exit is 96 % of R_th: the heat can barely leave.", "First guess α = 50 000: ΔT = 76.4 K, still 18 % above the paper.", "α = 59 000: R_th = 2.27 × 10⁶ K/W, within 5 % of the paper; kept for every later design."][k]);
    notes(s, "Solving for the paper's R_th exactly gives α ≈ 63 500. We had already run 59 000, which is within 5 %, and kept it so all later designs compare on the same heat exit. The α = 5000 point here is for the r = 5.64 nm wire; the r = 4 nm template device gave 727 K.");
  });
}

function stage2IV() {
  const s = slide();
  header(s, "Stage 2 – Reproduced device: transfer curves", "Silvaco Atlas, r = 5.64 nm, α = 59 000, V_D = 0.05 V and 0.7 V");
  const box = { x: 1.3, y: 1.85, w: 6.2, h: 3.7 };
  const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [1e-10, 1e-4], ylog: true, xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], yt: [1e-10, 1e-8, 1e-6, 1e-4], yf: fmtTick, xl: "gate voltage V_G (V)", yl: "I_D (log)" });
  G(s, D.VG.map((v, j) => [mx(v), my(D.repLo[j] * 1e-6)]), { color: C.teal, w: 2.5 });
  G(s, D.VG.map((v, j) => [mx(v), my(D.repHi[j] * 1e-6)]), { color: C.blue, w: 3 });
  T(s, "V_D = 0.7 V", { x: mx(0.45), y: my(1.2e-5) - 0.35, w: 1.3, h: 0.24, size: 11, bold: true, color: C.blue });
  T(s, "V_D = 0.05 V", { x: mx(0.45), y: my(5e-6) + 0.1, w: 1.3, h: 0.24, size: 11, bold: true, color: C.teal });
  chips(s, [{ k: "V_T (linear)", v: "0.204 V" }, { k: "subthreshold swing", v: "65.4 mV/dec" }, { k: "I_on", v: "27.5 µA" }, { k: "I_off", v: "624 pA" }], { x: 8.1, y: 1.85, w: 2.25, h: 0.9, cols: 2, gap: 0.18 });
  R(s, { x: 8.1, y: 4.0, w: 4.63, h: 1.2, fill: C.ink, r: 0.08 });
  T(s, "P_on = 27.5 µA × 0.7 V = 19.2 µW", { x: 8.35, y: 4.0, w: 4.2, h: 1.2, size: 16, bold: true, color: C.white, valign: "middle" });
  key(s, "Still a clean switch after the changes; the larger wire carries more current.");
  notes(s, "These are the Atlas I-V curves of the reproduced device. The larger wire carries more current than the standard one and swings at 65.4 mV per decade.");
}

function stage2Result() {
  const s = slide();
  header(s, "Stage 2 – Reproduced: it heats like the paper", "Temperature rise scaled to the paper's 30 µW (log scale)");
  s.addChart(lib.pres.charts.BAR, [{ name: "ΔT", labels: ["Base paper", "Standard", "Reproduced"], values: [64.8, 727, 68.0] }], {
    x: 0.6, y: 1.6, w: 6.6, h: 4.5, barDir: "col", chartColors: [C.blue, C.red, C.green], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0" K"', dataLabelFontFace: "+mn-lt", dataLabelFontSize: 12, dataLabelColor: C.ink,
    valAxisLogScaleBase: 10, valAxisMinVal: 10, valAxisMaxVal: 1000,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", catAxisLabelColor: C.grey, valAxisLabelColor: C.grey, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    valGridLine: { color: "EDEEF0", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 70,
  });
  [["343.6 K", "peak at 19.2 µW", C.ink], ["68.0 K", "ΔT scaled to 30 µW (paper 64.8 K)", C.green], ["+5.0 %", "error vs the base paper", C.green]].forEach(([v, l, col], i) => {
    T(s, v, { x: 7.8, y: 1.8 + i * 1.35, w: 4.9, h: 0.65, size: 32, bold: true, color: col });
    T(s, l, { x: 7.8, y: 2.45 + i * 1.35, w: 4.9, h: 0.3, size: 12, color: C.grey });
  });
  key(s, "Reproduced within 5 %, down from 11× too hot.");
  notes(s, "At its own on point the reproduced device reaches 343.6 K with 19.2 microwatts. Scaled to 30 microwatts that is 68.0 K, five percent above the paper.");
}

// ---------- stage 3 ----------
function knobs() {
  for (let k = 0; k < 3; k++) {
    const s = slide();
    header(s, "Stage 3 – Which knobs lower ΔT = R_th · P?", "Two ways to cool: a better heat path (R_th) or less power (P)");
    stepDots(s, 3, k);
    T(s, [{ text: "ΔT  =  " }, { text: "R_th", options: { color: C.teal } }, { text: "  ×  " }, { text: "P", options: { color: C.orange } }], { x: 0.6, y: 1.6, w: 12.13, h: 0.7, size: 32, bold: true, align: "center", name: "knEq" });
    const cols = [
      { x: 0.6, col: C.teal, h: "lower R_th: a better heat path", items: [["Spacer κ ↑", "Si₃N₄ → high-κ (thermal): heat leaves sideways into the gate", "✓ lever 1", C.green], ["Buried oxide → DLC [2]", "needs a substrate, not in our single wire", "future", C.grey]] },
      { x: 6.77, col: C.orange, h: "lower P: less power", items: [["Gate work function ↑", "4.50 → 4.53 eV: V_T up → less current, less leakage", "✓ lever 2", C.green], ["Supply V_DD ↓", "slower circuit, changes the operating point", "✗", C.red]] },
    ];
    cols.forEach((c, ci) => {
      T(s, c.h, { x: c.x, y: 2.5, w: 5.96, h: 0.35, size: 16, bold: true, color: c.col, name: "knH" + ci });
      c.items.forEach(([h, b, tag, tc], j) => {
        const show = ci === 0 ? k >= 1 : k >= 2;
        const y = 3.0 + j * 1.15;
        if (!show) return;
        R(s, { x: c.x, y, w: 5.96, h: 1.0, fill: C.panel, r: 0.06, name: "knB" + ci + j });
        T(s, h, { x: c.x + 0.2, y: y + 0.1, w: 4.3, h: 0.35, size: 15, bold: true, name: "knBh" + ci + j });
        T(s, b, { x: c.x + 0.2, y: y + 0.47, w: 4.5, h: 0.45, size: 12, color: C.grey, name: "knBb" + ci + j });
        T(s, tag, { x: c.x + 4.5, y: y + 0.1, w: 1.3, h: 0.35, size: 13, bold: true, color: tc, align: "right", name: "knBt" + ci + j });
      });
    });
    if (k >= 2) T(s, "Rejected: a thinner or shorter channel (more heat per volume, changes the electrostatics).", { x: 0.6, y: 5.45, w: 12.13, h: 0.3, size: 12, color: C.grey, align: "center", name: "knRej" });
    key(s, ["Two ways to cool: lower R_th or lower P.", "R_th knob: a better heat path, the spacer.", "Two clean knobs: spacer κ for R_th, work function for P."][k]);
    notes(s, "We looked for knobs that lower either factor without changing the device too much.");
  }
}

function lever1() {
  [18, 60].forEach((kap, k) => {
    const s = slide();
    header(s, "Stage 3 – Lever 1: a high-κ spacer", "The spacer touches the gate metal, a heat contact at 300 K, only 5 nm from the channel");
    stepDots(s, 2, k);
    const z0 = 0.8, zs = 0.105, seg = [17, 5, 14, 5, 17], yC = 3.5;
    let x = z0; const xs = seg.map((w) => { const a = x; x += w * zs; return a; });
    R(s, { x: xs[1], y: yC - 1.0, w: 24 * zs, h: 2.0, fill: C.metal, name: "l1W" });
    R(s, { x: xs[1], y: yC - 1.0, w: 5 * zs, h: 2.0, fill: k ? C.teal : C.nitride, name: "l1N1" });
    R(s, { x: xs[3], y: yC - 1.0, w: 5 * zs, h: 2.0, fill: k ? C.teal : C.nitride, name: "l1N2" });
    R(s, { x: z0, y: yC - 0.3, w: x - z0, h: 0.6, fill: C.body, name: "l1S" });
    R(s, { x: z0, y: yC - 0.3, w: 17 * zs, h: 0.6, fill: C.nplus, name: "l1SD1" });
    R(s, { x: xs[4], y: yC - 0.3, w: 17 * zs, h: 0.6, fill: C.nplus, name: "l1SD2" });
    E(s, { cx: xs[3] - 0.1, cy: yC, rx: 0.32, ry: 0.2, fill: C.heat3, ft: 10, name: "l1Hot" });
    [["source", z0, 17], ["gate", xs[1], 24], ["drain", xs[4], 17]].forEach(([n, xx, w], j) => {
      R(s, { x: xx, y: 2.15, w: w * zs, h: 0.22, fill: C.ink, r: 0.03, name: "l1c" + j });
      T(s, n + " · 300 K", { x: xx - 0.2, y: 2.15, w: w * zs + 0.4, h: 0.22, size: 9, bold: true, color: C.white, align: "center", valign: "middle", name: "l1ct" + j });
    });
    L(s, xs[3] - 0.05, yC + 0.1, xs[4] + 1.6, yC + 0.1, { color: C.orange, w: k ? 1.25 : 3, dash: k ? "dash" : undefined, arrow: true, name: "l1Old" });
    if (k) L(s, xs[3] + 0.25, yC - 0.2, xs[3] + 0.25, 2.4, { color: C.teal, w: 3.5, arrow: true, name: "l1New" });
    seg.forEach((w, j) => T(s, w + " nm", { x: xs[j], y: 4.65, w: w * zs, h: 0.24, size: 10, color: C.grey, align: "center", name: "l1d" + j }));
    T(s, k ? "high-κ spacer (60 W/m·K)" : "Si₃N₄ spacer (18 W/m·K)", { x: xs[3] - 0.6, y: 4.95, w: 1.9, h: 0.25, size: 10, bold: true, color: k ? C.teal : C.grey, align: "center", name: "l1SpL" });
    card(s, { x: 7.4, y: 1.7, w: 5.33, h: 2.2, n: k + 1, head: k ? "New path" : "Old path", color: k ? C.teal : C.orange, body: k ? "Up through the 5 nm spacer into the gate metal, a heat contact at 300 K. The current does not change: the spacer is outside the channel." : "Along the wire to the drain contact, 17 nm of silicon away. The nitride spacer (18 W/m·K) blocks the short way up." });
    chips(s, [{ k: "spacer κ", v: kap + " W/m·K", d: k ? 1 : 0, good: true }, { k: "ΔT change", v: k ? "−10.6 %" : "0", d: k ? -1 : 0, good: true }, { k: "I_on change", v: k ? "−0.1 %" : "0", d: 0 }], { x: 7.4, y: 4.15, w: 1.71, h: 0.75 });
    knob(s, { x: 7.6, y: 5.75, w: 5.0, label: "KNOB: spacer thermal conductivity", ticks: [18, 40, 60], val: kap, min: 10, max: 70, unit: " W/m·K", color: C.teal });
    T(s, "material nitride tc.const = 0.18 → 0.6 W/cm·K", { x: 0.8, y: 5.25, w: 6, h: 0.3, size: 12, font: "Courier New", color: C.grey, name: "l1Code" });
    key(s, k ? "Spacer κ 18 → 60 W/m·K: R_th falls, current unchanged." : "The hot spot is at the drain end; its heat has a long way out.");
    notes(s, "With nitride spacers at 18 W/m K the heat must travel along the wire to the drain contact. A 60 W/m K spacer lets it move sideways into the gate metal, which is a heat contact.");
  });
}

function lever2() {
  [4.5, 4.53].forEach((wf, k) => {
    const s = slide();
    header(s, "Stage 3 – Lever 2: a slightly higher work function", "Raise φm by 0.03 eV: V_T goes up, so the same bias draws less power");
    stepDots(s, 2, k);
    const box = { x: 1.3, y: 1.85, w: 5.9, h: 3.7 };
    const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [1e-10, 1e-4], ylog: true, xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], yt: [1e-10, 1e-8, 1e-6, 1e-4], yf: fmtTick, xl: "gate voltage V_G (V)", yl: "I_D at V_D = 0.7 V (log)" });
    G(s, D.VG.map((v, j) => [mx(v), my(D.repHi[j] * 1e-6)]), { color: k ? "9BB3EF" : C.blue, w: k ? 2 : 3, name: "l2R" });
    G(s, D.VG.map((v, j) => [mx(v), my((k ? D.optHi : D.repHi)[j] * 1e-6)]), { color: k ? C.green : C.blue, w: 3, name: "l2D" });
    T(s, "reproduced, WF 4.50 eV", { x: mx(0.36) - 2.3, y: my(5.8e-6) - 0.3, w: 2.2, h: 0.24, size: 10, bold: true, color: C.blue, name: "l2RL" });
    if (k) T(s, "design D, WF 4.53 eV", { x: mx(0.36), y: my(4.4e-6) + 0.12, w: 2.2, h: 0.24, size: 10, bold: true, color: C.green, name: "l2DL" });
    chips(s, [
      { k: "V_T", v: k ? "0.233 V" : "0.204 V", d: k ? 1 : 0, good: true },
      { k: "I_off", v: k ? "246 pA" : "624 pA", d: k ? -1 : 0, good: true },
      { k: "I_on", v: k ? "25.3 µA" : "27.5 µA", d: k ? -1 : 0, good: false },
      { k: "P_on", v: k ? "17.7 µW" : "19.2 µW", d: k ? -1 : 0, good: true },
    ], { x: 7.8, y: 1.85, w: 2.38, h: 0.85, cols: 2, gap: 0.17 });
    T(s, k ? "+29 mV V_T · 2.5× less leakage · −7.8 % I_on" : "Reproduced device, before the shift.", { x: 7.8, y: 3.95, w: 4.93, h: 0.6, size: 14, bold: true, color: k ? C.green : C.grey, name: "l2Sum" });
    knob(s, { x: 7.9, y: 5.4, w: 4.7, label: "KNOB: gate work function φm", ticks: [4.5, 4.53, 4.55], val: wf, min: 4.49, max: 4.56, fmt: (v) => v.toFixed(2), unit: " eV", color: C.purple });
    key(s, k ? "Less power P gives a lower ΔT = R_th · P, and leakage falls too." : "The work function sets V_T one-to-one: our power knob.");
    notes(s, "Raising the gate work function from 4.50 to 4.53 eV raises the threshold by about 30 mV. At the same gate voltage the device carries less current, so P falls, and so does the temperature.");
  });
}

function designs() {
  const s = slide();
  header(s, "Stage 3 – Four designs on the calibrated deck", "Rule: lowest ΔT with I_on within 10 % of the reproduced device and I_off no worse");
  s.addChart(lib.pres.charts.BAR, [
    { name: "ΔT change (%)", labels: ["A spacer", "B WF 4.55", "C A+B", "D spacer+4.53"], values: [-10.6, -10.6, -20.3, -16.4] },
    { name: "I_on change (%)", labels: ["A spacer", "B WF 4.55", "C A+B", "D spacer+4.53"], values: [-0.1, -12.9, -13.0, -7.8] },
  ], {
    x: 0.6, y: 1.6, w: 6.4, h: 4.5, barDir: "col", barGrouping: "clustered", chartColors: [C.orange, C.blue], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", dataLabelFontFace: "+mn-lt", dataLabelFontSize: 10, dataLabelColor: C.ink,
    showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 11, legendColor: C.grey, valAxisMinVal: -25, valAxisMaxVal: 0,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", catAxisLabelColor: C.grey, valAxisLabelColor: C.grey, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    valGridLine: { color: "EDEEF0", size: 0.75 }, catGridLine: { style: "none" }, showTitle: true, title: "Change vs the reproduced device (%)", titleFontFace: "+mn-lt", titleFontSize: 12, titleColor: C.grey, catAxisLabelPos: "low",
  });
  const rows = [["Reproduced", "43.6", "624", "–"], ["A", "39.0", "624", "I_off same"], ["B", "39.0", "141", "I_on −12.9 %"], ["C", "34.8", "141", "I_on −13 %"], ["D", "36.4", "246", "all met"]];
  const t = [[cell("Design", HD), cell("ΔT (K)", HD), cell("I_off (pA)", HD), cell("Rule", HD)]];
  rows.forEach((r) => t.push(r.map((c, j) => cell(c, { bold: r[0] === "D", color: r[0] === "D" ? C.green : c.includes("−1") ? C.red : C.ink, fill: { color: r[0] === "D" ? "E8F5EC" : C.panel } }))));
  s.addTable(t, { ...TB, x: 7.4, y: 1.7, w: 5.33, colW: [1.4, 1.1, 1.2, 1.63], fontSize: 13, rowH: 0.48 });
  R(s, { x: 7.4, y: 4.85, w: 5.33, h: 1.2, fill: C.panel, r: 0.06 });
  T(s, [{ text: "Why D?  ", options: { bold: true, color: C.green } }, { text: "B and C lose more than 10 % I_on; A passes the rule but runs 2.6 K hotter." }], { x: 7.6, y: 4.85, w: 5.0, h: 1.2, size: 13, valign: "middle" });
  key(s, "D: 16.4 % cooler with I_on −7.8 %: the best trade-off.");
  notes(s, "A uses only the spacer, B only a larger work-function step of 4.55 eV, C both, and D the spacer with a smaller step of 4.53 eV.");
}

function tmax() {
  const s = slide();
  header(s, "Stage 3 – Design D runs cooler at every bias", "Peak lattice temperature against V_G at V_D = 0.7 V (Silvaco Atlas)");
  const box = { x: 1.3, y: 1.85, w: 6.2, h: 3.7 };
  const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [300, 350], xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], yt: [300, 310, 320, 330, 340, 350], xl: "gate voltage V_G (V)", yl: "T_max (K)" });
  G(s, D.VG.map((v, j) => [mx(v), my(D.tRep[j])]), { color: C.red, w: 3 });
  G(s, D.VG.map((v, j) => [mx(v), my(D.tOpt[j])]), { color: C.green, w: 3 });
  T(s, "reproduced 343.6 K", { x: mx(0.42), y: my(338), w: 1.8, h: 0.24, size: 11, bold: true, color: C.red });
  T(s, "design D 336.4 K", { x: mx(0.5), y: my(322), w: 1.8, h: 0.24, size: 11, bold: true, color: C.green });
  [["336.4 K", "peak (reproduced: 343.6 K)", C.green], ["−7.2 K", "ΔT 43.6 → 36.4 K (−16.4 %)", C.green], ["2.06 × 10⁶", "R_th in K/W (reproduced 2.27 × 10⁶)", C.ink]].forEach(([v, l, col], i) => {
    T(s, v, { x: 8.2, y: 1.8 + i * 1.35, w: 4.5, h: 0.65, size: 32, bold: true, color: col });
    T(s, l, { x: 8.2, y: 2.45 + i * 1.35, w: 4.5, h: 0.3, size: 12, color: C.grey });
  });
  key(s, "D runs 7.2 K cooler at the same bias.");
  notes(s, "Design D stays below the reproduced device at every point and ends 7.2 K cooler, at 336.4 K.");
}

function allStages() {
  const s = slide();
  header(s, "All three stages side by side", "V_DD = 0.7 V, Silvaco Atlas; base paper for reference");
  const rows = [["Channel", "wire r = 4 nm", "wire r = 5.64 nm", "wire r = 5.64 nm", "sheet 20 × 5 nm"], ["V_T,lin (V)", "0.209", "0.204", "0.233", "–"], ["SS (mV/dec)", "61.3", "65.4", "65.1", "–"], ["I_on (µA)", "17.9", "27.5", "25.3", "–"], ["I_off (pA)", "99", "624", "246", "–"], ["P_on (µW)", "12.5", "19.2", "17.7", "30"], ["T_max (K)", "603.0", "343.6", "336.4", "–"], ["R_th (K/W)", "2.42 × 10⁷", "2.27 × 10⁶", "2.06 × 10⁶", "2.16 × 10⁶"], ["ΔT at 30 µW (K)", "727", "68.0", "61.8", "64.8"]];
  const t = [[cell("Metric", HD), cell("Standard", HD), cell("Reproduced", { ...HD, fill: { color: C.blue } }), cell("Optimal D", { ...HD, fill: { color: C.green } }), cell("Base paper", HD)]];
  rows.forEach((r) => t.push(r.map((c, j) => cell(c, { bold: j === 0 || j === 3, color: j === 3 ? C.green : C.ink, fill: { color: j === 3 ? "E8F5EC" : C.panel }, align: j ? "center" : "left" }))));
  s.addTable(t, { ...TB, x: 0.6, y: 1.6, w: 12.13, colW: [2.73, 2.35, 2.35, 2.35, 2.35], fontSize: 13, rowH: 0.43 });
  key(s, "Reproduced within 5 %; optimal design 16.4 % cooler.");
  notes(s, "This table collects every number. The reproduced column matches the paper within 5 percent. The optimal column is cooler and leaks less, at a cost of 7.8 percent on-current.");
}

// the whole parameter journey on one page
function journey() {
  const s = slide();
  header(s, "How every parameter changed along the way", "One row per metric, one column per step of the story");
  const cols = ["Planar", "FinFET", "GAA", "Standard", "Reproduced", "Optimal D"];
  const sub = ["λ model, 14 nm", "λ model, 14 nm", "λ model, 14 nm", "Atlas, r = 4 nm", "Atlas, r = 5.64 nm", "Atlas, r = 5.64 nm"];
  const rows = [
    ["λ (nm)", "4.37", "2.52", "2.18", "2.18", "2.59", "2.59"],
    ["SS (mV/dec)", "100", "68", "65", "61.3", "65.4", "65.1"],
    ["DIBL (mV/V)", "201", "62", "41", "17.3", "38", "≈ 38"],
    ["V_T (V)", "0.01", "0.24", "0.28", "0.209", "0.204", "0.233"],
    ["I_off", "241 nA", "144 pA", "26 pA", "99 pA", "624 pA", "246 pA"],
    ["I_on (µA)", "–", "–", "–", "17.9", "27.5", "25.3"],
    ["ΔT at 30 µW (K)", "–", "–", "–", "727", "68.0", "61.8"],
  ];
  const colC = [C.red, C.blue, C.blue, C.grey, C.blue, C.green];
  const t = [[cell("", HD), ...cols.map((c, j) => cell(c, { ...HD, fill: { color: colC[j] }, align: "center" }))], [cell("", { fill: { color: C.white } }), ...sub.map((c) => cell(c, { color: C.grey, fontSize: 10, align: "center", fill: { color: C.white } }))]];
  rows.forEach((r) => t.push(r.map((c, j) => cell(c, { bold: j === 0, align: j ? "center" : "left", fill: { color: j === 6 ? "E8F5EC" : C.panel } }))));
  s.addTable(t, { ...TB, x: 0.6, y: 1.55, w: 12.13, colW: [2.23, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65], fontSize: 13, rowH: 0.45 });
  T(s, "Gate sides fixed the electrostatics (λ, SS, DIBL); the heat exit and two small knobs fixed the temperature.", { x: 0.6, y: 5.75, w: 12.13, h: 0.3, size: 12, color: C.grey, align: "center" });
  key(s, "Each step changed one thing, and the numbers moved the way the physics says.");
  notes(s, "The first three columns are the simple scale-length model at a 14 nm gate with the same 8 nm silicon. The last three are Atlas results for our devices.");
}

function chapter6() {
  section("6 · Three stages in TCAD");
  notes(contents(5), "Chapter 6: build, reproduce, optimise.");
  stage1Build();
  stage1Results();
  stage2Diff();
  change1();
  change2();
  stage2IV();
  stage2Result();
  knobs();
  lever1();
  lever2();
  designs();
  tmax();
  allStages();
  journey();
}
module.exports = { chapter6 };
