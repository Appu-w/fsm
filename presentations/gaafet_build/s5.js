// Chapter 5: literature and method
const lib = require("./lib");
const { cell, C, section, slide, T, R, E, L, G, header, key, notes, stepDots, card, knob, chips, axes, fmtTick, range } = lib;
const { contents } = require("./s0");
const D = require("./data");

const HD = { bold: true, color: C.white, fill: { color: C.ink } };
const TB = { fontFace: "Segoe UI", color: C.ink, border: { type: "solid", color: C.white, pt: 1.5 }, valign: "middle" };

function overview() {
  const s = slide();
  header(s, "Literature review – Five papers", "Where the heat goes in GAA devices, and how to lower it");
  const rows = [
    ["[1]", "Chen et al., IEEE EDTM 2025", "Thermal TCAD, 3-nm GAA cells", "NMOS self-heats 64.8 K at 30 µW; crosstalk 34.6 %"],
    ["[2]", "Rathore et al., IEEE TED 2023", "Calibrated TCAD, nanosheet FET", "DLC buried oxide: peak 626 K → 442 K"],
    ["[3]", "Cai et al., VLSI-TSA 2018", "3D simulation, stacked nanosheets", "Up to 128 K rise; ~40 % of heat leaves via the substrate"],
    ["[4]", "Kang et al., IEEE TED 2022", "3D TCAD, 3 stacked GAA nanowires", "Wrap-around W contact: R_th 5.27 → 4.83 K/µW, I_on 1.74×"],
    ["[5]", "Belkhiria et al., SSD 2021", "Heat model, linear doping", "Work function and doping set the temperature"],
  ];
  const t = [[cell("#", HD), cell("Paper", HD), cell("Method", HD), cell("Key finding", HD)]];
  rows.forEach((r, i) => t.push(r.map((c, j) => cell(c, { bold: j < 2, fill: { color: i === 0 ? "E6ECFB" : C.panel } }))));
  s.addTable(t, { ...TB, x: 0.6, y: 1.65, w: 12.13, colW: [0.6, 3.3, 3.3, 4.93], fontSize: 13, rowH: 0.62 });
  const levers = [["Lever 1 – a better heat path", "[2], [3], [4]: put a high-κ material next to the hot spot.", C.teal], ["Lever 2 – less power", "[5]: a small work-function shift lowers P.", C.orange]];
  levers.forEach(([h, b, col], i) => {
    R(s, { x: 0.6 + i * 6.17, y: 5.5, w: 5.96, h: 0.62, fill: C.panel, r: 0.06 });
    T(s, [{ text: h + ":  ", options: { bold: true, color: col } }, { text: b, options: { color: C.grey } }], { x: 0.8 + i * 6.17, y: 5.5, w: 5.6, h: 0.62, size: 13, valign: "middle" });
  });
  key(s, "Two levers keep appearing: a better heat path, or less power.");
  notes(s, "Chen is the base paper. Rathore and Cai show the substrate heat path, Kang shows that a metal contact around the source and drain lowers the thermal resistance, and Belkhiria shows that the work function sets the temperature.");
}

function choose() {
  const s = slide();
  header(s, "Literature review – Choosing the base paper", "One paper to reproduce: it must match our project and give a clear target");
  const q = ["Published by IEEE", "About thermal crosstalk (our title)", "One clear number to match", "All sizes and κ values given", "Single GAA device we can simulate"];
  const m = [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 1, 0, 1, 0], [1, 0, 0, 0, 1]];
  const t = [[cell("Question", HD), ...["[1] Chen", "[2] Rathore", "[3] Cai", "[4] Kang", "[5] Belkhiria"].map((h, j) => cell(h, { ...HD, fill: { color: j === 0 ? C.blue : C.ink }, align: "center" }))]];
  q.forEach((qq, i) => t.push([cell(qq, { fill: { color: C.panel } }), ...m[i].map((v, j) => cell(v ? "✓" : "–", { align: "center", bold: !!v, color: v ? C.green : C.mute, fill: { color: j === 0 ? "E6ECFB" : C.panel } }))]));
  const sc = [5, 3, 2, 3, 2];
  t.push([cell("Score", { bold: true, fill: { color: C.panel } }), ...sc.map((v, j) => cell(v + "/5", { align: "center", bold: true, color: j === 0 ? C.white : C.ink, fill: { color: j === 0 ? C.blue : C.panel } }))]);
  s.addTable(t, { ...TB, x: 0.6, y: 1.65, w: 12.13, colW: [4.13, 1.6, 1.6, 1.6, 1.6, 1.6], fontSize: 13, rowH: 0.5 });
  R(s, { x: 0.6, y: 5.35, w: 12.13, h: 0.75, fill: C.panel, r: 0.06 });
  T(s, [{ text: "Why Chen?  ", options: { bold: true, color: C.blue } }, { text: "It is the only paper that scores 5/5: it studies thermal crosstalk, our title, gives one clear number to match, and has a single GAA device we can simulate." }], { x: 0.85, y: 5.35, w: 11.7, h: 0.75, size: 13, valign: "middle" });
  key(s, "Base paper: Chen et al., IEEE EDTM 2025. The other four support it.");
  notes(s, "We compared the papers on five questions. Chen et al. is the only one about thermal crosstalk in GAA, our project title, with one clear number and every dimension and conductivity in its Table I.");
}

function basePaper() {
  const s = slide();
  header(s, "Literature review – Base paper [1]", "Chen et al.: in an inverter the active NMOS heats the PMOS next to it");
  L(s, 2.6, 1.7, 2.6, 2.15, { color: C.ink, w: 2 });
  T(s, "V_DD", { x: 2.1, y: 1.45, w: 1, h: 0.25, size: 11, bold: true, align: "center" });
  R(s, { x: 1.7, y: 2.15, w: 1.8, h: 1.0, fill: C.heat1, r: 0.08 });
  T(s, "PMOS\noff", { x: 1.7, y: 2.15, w: 1.8, h: 1.0, size: 14, bold: true, color: C.orange, align: "center", valign: "middle" });
  L(s, 2.6, 3.15, 2.6, 3.65, { color: C.ink, w: 2 });
  R(s, { x: 1.7, y: 3.65, w: 1.8, h: 1.0, fill: C.heat3, r: 0.08 });
  T(s, "NMOS\non · 30 µW", { x: 1.7, y: 3.65, w: 1.8, h: 1.0, size: 14, bold: true, color: C.white, align: "center", valign: "middle" });
  L(s, 2.6, 4.65, 2.6, 5.1, { color: C.ink, w: 2 });
  T(s, "V_SS", { x: 2.1, y: 5.1, w: 1, h: 0.25, size: 11, bold: true, align: "center" });
  L(s, 0.8, 3.4, 1.7, 3.4, { color: C.ink, w: 1.5 }); T(s, "in = 1", { x: 0.6, y: 3.1, w: 1, h: 0.25, size: 11, color: C.grey });
  L(s, 2.6, 3.4, 4.2, 3.4, { color: C.ink, w: 1.5 }); T(s, "out = 0", { x: 3.6, y: 3.1, w: 1, h: 0.25, size: 11, color: C.grey });
  L(s, 1.3, 3.9, 1.3, 2.6, { color: C.red, w: 3, arrow: true }); T(s, "heat", { x: 0.75, y: 2.75, w: 0.8, h: 0.25, size: 11, bold: true, color: C.red });
  [["64.8 K", "NMOS self-heating at 30 µW", C.orange], ["22.4 K", "PMOS rise from crosstalk", C.orange], ["34.6 %", "crosstalk coefficient α (31.7 % the other way)", C.red]].forEach(([v, l, col], i) => {
    const x = 5.4 + (i % 2) * 3.7, y = 1.7 + Math.floor(i / 2) * 1.5;
    T(s, v, { x, y, w: 3.4, h: 0.7, size: 36, bold: true, color: col });
    T(s, l, { x, y: y + 0.72, w: 3.4, h: 0.5, size: 12, color: C.grey });
  });
  R(s, { x: 5.4, y: 4.75, w: 7.33, h: 1.1, fill: C.panel, r: 0.08 });
  T(s, "A single GAAFET with the same substrate runs about 6 K hotter than the NMOS inside the inverter, because the PMOS helps carry its heat away.", { x: 5.65, y: 4.75, w: 6.9, h: 1.1, size: 13, color: C.grey, valign: "middle" });
  key(s, "One number to reproduce: 64.8 K at 30 µW.");
  notes(s, "In a 6-track inverter with input 1, the NMOS is on and dissipates 30 microwatts. It heats itself by 64.8 K. The PMOS is off, but heat through the shared gate raises it by 22.4 K.");
}

function density() {
  const s = slide();
  header(s, "Literature review – Base paper [1]", "More active neighbours, more crosstalk heating");
  s.addChart(lib.pres.charts.BAR, [{ name: "rise", labels: ["Inverter (2 devices)", "3 active devices", "4 active devices"], values: [7.5, 11.8, 14.9] }], {
    x: 0.6, y: 1.6, w: 7.4, h: 4.5, barDir: "col", chartColors: [C.orange], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"', dataLabelFontFace: "+mn-lt", dataLabelFontSize: 12, dataLabelColor: C.ink,
    showTitle: true, title: "Temperature rise of the target device above 300 K (%)", titleFontFace: "+mn-lt", titleFontSize: 12, titleColor: C.grey,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", catAxisLabelColor: C.grey, valAxisLabelColor: C.grey, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    valGridLine: { color: "EDEEF0", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false, valAxisMaxVal: 18, barGapWidthPct: 70,
  });
  [["322.4 K", "inverter PMOS (+7.5 %)"], ["335.3 K", "three active devices (+11.8 %)"], ["344.6 K", "four active devices (+14.9 %)"]].forEach(([v, l], i) => {
    T(s, v, { x: 8.6, y: 1.8 + i * 1.3, w: 4, h: 0.6, size: 30, bold: true, color: C.orange });
    T(s, l, { x: 8.6, y: 2.4 + i * 1.3, w: 4, h: 0.3, size: 12, color: C.grey });
  });
  key(s, "Crosstalk grows with device density: a reason to cut self-heating at the source.");
  notes(s, "With two, three and four active devices the target heats by 7.5, 11.8 and 14.9 percent above ambient.");
}

function tableI() {
  const s = slide();
  header(s, "Literature review – Table I of the base paper", "The geometry and materials we copy into our deck");
  const a = [["Channel length L_g", "14"], ["Nanosheet width", "20"], ["Nanosheet thickness", "5"], ["Gate oxide thickness", "1.1"], ["Sub-fin thickness", "40"], ["Metal-2 pitch (inverter)", "21"]];
  const b = [["N-channel Si", "[22, 22, 6]"], ["P-channel SiGe", "[18, 18, 4]"], ["Gate HfO2", "2.3"], ["Interface oxide", "1.4"], ["Copper", "385"], ["Si substrate", "148"]];
  s.addTable([[cell("Dimension", HD), cell("Value (nm)", HD)], ...a.map((r) => r.map((c) => cell(c, { fill: { color: C.panel } })))], { ...TB, x: 0.6, y: 1.65, w: 5.8, colW: [3.8, 2.0], fontSize: 13, rowH: 0.46 });
  s.addTable([[cell("Material", HD), cell("κ (W/m·K)", HD)], ...b.map((r) => r.map((c) => cell(c, { fill: { color: C.panel } })))], { ...TB, x: 6.93, y: 1.65, w: 5.8, colW: [3.8, 2.0], fontSize: 13, rowH: 0.46 });
  R(s, { x: 0.6, y: 5.25, w: 2.0, h: 0.5, fill: C.body, line: "C9A94A" });
  T(s, "20 × 5 nm nanosheet (to scale)", { x: 2.8, y: 5.3, w: 4, h: 0.4, size: 12, color: C.grey, valign: "middle" });
  key(s, "Same L_g, oxide and κ values as the paper; only the channel shape differs.");
  notes(s, "Geometry and thermal conductivity values from Table I of the base paper. We use the same gate length, oxide thickness and conductivities.");
}

function heatPath() {
  const s = slide();
  header(s, "Literature review – A better heat exit [2], [3]", "Giving the heat a better way out lowers the peak temperature");
  T(s, "Rathore et al. [2]: DLC as buried oxide", { x: 0.6, y: 1.6, w: 6, h: 0.32, size: 15, bold: true, color: C.red });
  s.addChart(lib.pres.charts.BAR, [{ name: "T", labels: ["SiO₂ BOX", "DLC BOX"], values: [626, 442] }], {
    x: 0.6, y: 2.0, w: 5.6, h: 4.0, barDir: "col", chartColors: [C.red, C.teal], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0" K"', dataLabelFontFace: "+mn-lt", dataLabelFontSize: 12, dataLabelColor: C.ink,
    showTitle: true, title: "Peak lattice temperature (K)", titleFontFace: "+mn-lt", titleFontSize: 12, titleColor: C.grey, valAxisMinVal: 300, valAxisMaxVal: 700,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", catAxisLabelColor: C.grey, valAxisLabelColor: C.grey, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    valGridLine: { color: "EDEEF0", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 80,
  });
  T(s, "Cai et al. [3]: stacked nanosheets", { x: 7.0, y: 1.6, w: 5.7, h: 0.32, size: 15, bold: true, color: C.blue });
  [["128 K", "self-heating rise at V_G = V_D = 0.7 V"], ["~40 %", "of the heat leaves through the substrate"], ["−40 K", "with higher-κ substrate or interconnect materials"]].forEach(([v, l], i) => {
    R(s, { x: 7.0, y: 2.05 + i * 1.3, w: 5.73, h: 1.1, fill: C.panel, r: 0.08 });
    T(s, v, { x: 7.25, y: 2.1 + i * 1.3, w: 2.2, h: 1.0, size: 28, bold: true, color: C.blue, valign: "middle" });
    T(s, l, { x: 9.4, y: 2.1 + i * 1.3, w: 3.2, h: 1.0, size: 13, color: C.grey, valign: "middle" });
  });
  key(s, "Lever 1: replace a low-κ layer next to the heat with a high-κ one.");
  notes(s, "Rathore replaced the SiO2 buried oxide with diamond-like carbon and the peak lattice temperature fell from about 626 K to 442 K. Cai found that about 40 percent of the heat leaves through the substrate.");
}

function kang() {
  [0, 1].forEach((k) => {
    const s = slide();
    header(s, "Literature review – The contact as a heat path [4]", "Kang et al., TED 2022: 3 stacked GAA nanowires, top contact vs wrap-around contact");
    stepDots(s, 2, k);
    R(s, { x: 0.7, y: 1.7, w: 5.8, h: 0.6, fill: C.oxide, name: "kgILD" });
    T(s, "ILD (SiO₂, 1.4 W/m·K)", { x: 0.7, y: 1.7, w: 5.8, h: 0.6, size: 11, color: C.grey, align: "center", valign: "middle", name: "kgILDl" });
    R(s, { x: 0.7, y: 2.3, w: 1.6, h: 3.2, fill: C.nplus, name: "kgS" });
    R(s, { x: 4.9, y: 2.3, w: 1.6, h: 3.2, fill: C.nplus, name: "kgD" });
    T(s, "S", { x: 0.7, y: 3.6, w: 1.6, h: 0.4, size: 16, bold: true, color: C.white, align: "center", name: "kgSl" });
    T(s, "D", { x: 4.9, y: 3.6, w: 1.6, h: 0.4, size: 16, bold: true, color: C.white, align: "center", name: "kgDl" });
    R(s, { x: 2.3, y: 2.3, w: 2.6, h: 3.2, fill: C.gate, name: "kgG" });
    T(s, "gate (TiN)", { x: 2.3, y: 2.4, w: 2.6, h: 0.3, size: 11, bold: true, color: "3D2F7A", align: "center", name: "kgGl" });
    for (let j = 0; j < 3; j++) R(s, { x: 2.3, y: 3.0 + j * 0.8, w: 2.6, h: 0.3, fill: C.body, name: "kgW" + j });
    R(s, { x: 0.7, y: 5.5, w: 5.8, h: 0.35, fill: C.blue, name: "kgGP" });
    T(s, "ground plane", { x: 0.7, y: 5.5, w: 5.8, h: 0.35, size: 10, color: C.white, align: "center", valign: "middle", name: "kgGPl" });
    // tungsten contacts: top pad (TC) or wrapping S/D (WAC)
    [[0.7, 1], [4.9, 2]].forEach(([x, i]) => {
      if (!k) R(s, { x: x + 0.45, y: 1.7, w: 0.7, h: 0.6, fill: C.metal, name: "kgM" + i });
      else R(s, { x: x - 0.0, y: 1.7, w: 1.6, h: 3.8, fill: C.metal, ft: 35, name: "kgM" + i });
    });
    T(s, k ? "W metal (grey) wraps S and D" : "W metal (grey) on top only", { x: 0.7, y: 6.0, w: 5.8, h: 0.28, size: 11, bold: true, color: C.grey, align: "center", name: "kgCap" });
    // bars
    const bars = [["R_th (K/µW)", 5.27, 4.83, 6], ["I_on (× TC)", 1.0, 1.74, 2], ["contact area (nm²)", 112, 1579, 1700]];
    bars.forEach(([n, a, b, mx], j) => {
      const x = 7.4 + j * 1.85, base = 5.0, hh = 2.8;
      R(s, { x, y: base - hh * a / mx, w: 0.55, h: hh * a / mx, fill: C.grey, name: "kgBa" + j });
      T(s, String(a), { x: x - 0.25, y: base - hh * a / mx - 0.3, w: 1.05, h: 0.25, size: 11, bold: true, align: "center", name: "kgBav" + j });
      R(s, { x: x + 0.65, y: k ? base - hh * b / mx : base, w: 0.55, h: k ? hh * b / mx : 0.01, fill: C.green, name: "kgBb" + j });
      T(s, k ? String(b) : "", { x: x + 0.4, y: base - hh * b / mx - 0.3, w: 1.05, h: 0.25, size: 11, bold: true, color: C.green, align: "center", name: "kgBbv" + j });
      T(s, n, { x: x - 0.2, y: base + 0.08, w: 1.65, h: 0.45, size: 10, color: C.grey, align: "center", name: "kgBl" + j });
    });
    R(s, { x: 7.4, y: 1.75, w: 0.2, h: 0.2, fill: C.grey, name: "kgLg1" }); T(s, "TC", { x: 7.65, y: 1.7, w: 0.6, h: 0.3, size: 11, name: "kgLg1t" });
    R(s, { x: 8.4, y: 1.75, w: 0.2, h: 0.2, fill: C.green, name: "kgLg2" }); T(s, "WAC", { x: 8.65, y: 1.7, w: 0.8, h: 0.3, size: 11, name: "kgLg2t" });
    T(s, "R_th = (T_max − T_min) / total heat: the same slope method as our ΔT–P line", { x: 7.4, y: 5.65, w: 5.3, h: 0.5, size: 11, color: C.grey, name: "kgNote" });
    key(s, k ? "Wrap-around contact: tungsten (174 W/m·K) touches the hot drain directly: R_th −9.7 %, I_on 1.74×." : "Top contact: heat and current must travel up the source and drain to a small metal pad.");
    notes(s, "Kang et al. compare a top contact with a wrap-around contact in a three-wire GAA stack. Metal around the source and drain lowers the thermal resistance by about ten percent.");
  });
}

function plan() {
  const s = slide();
  header(s, "Literature review – Our plan", "Three stages on one Atlas deck, each building on the last");
  const st = [["Standard GAAFET", "r = 4 nm wire, α = 5000", "Check that the deck runs and the electrostatics are sound.", C.grey], ["Reproduce base paper", "r = 5.64 nm, α = 59 000", "Match the paper's R_th: 64.8 K at 30 µW.", C.blue], ["Optimal GAAFET", "spacer κ 60, WF 4.53 eV", "Lower ΔT with I_on within 10 % and I_off no worse.", C.green]];
  st.forEach(([h, p, b, col], i) => {
    const x = 0.6 + i * 4.15;
    R(s, { x, y: 1.9, w: 3.75, h: 3.6, fill: C.panel, r: 0.08 });
    E(s, { cx: x + 0.55, cy: 2.5, rx: 0.3, fill: col });
    T(s, String(i + 1), { x: x + 0.25, y: 2.2, w: 0.6, h: 0.6, size: 18, bold: true, color: C.white, align: "center", valign: "middle" });
    T(s, h, { x: x + 0.3, y: 3.05, w: 3.2, h: 0.4, size: 18, bold: true, color: col });
    T(s, p, { x: x + 0.3, y: 3.5, w: 3.2, h: 0.35, size: 13, bold: true });
    T(s, b, { x: x + 0.3, y: 4.0, w: 3.2, h: 1.2, size: 13, color: C.grey });
    if (i < 2) T(s, "→", { x: x + 3.75, y: 3.3, w: 0.4, h: 0.5, size: 22, color: C.mute, align: "center" });
  });
  key(s, "Standard → reproduced → optimal, all on one Atlas deck.");
  notes(s, "Stage 1 builds a standard device to check the deck. Stage 2 changes it until it heats like the base paper. Stage 3 uses the two levers from the literature to make it cooler.");
}

function flow() {
  const s = slide();
  header(s, "Methodology – TCAD flow", "Every result comes from the same five steps in Silvaco Atlas");
  const b = [["Mesh", "cylindrical 3D grid in r, angle, z"], ["Regions", "Si, SiO2, HfO2, W, Si3N4, contacts"], ["Doping", "n+ S/D 10²⁰, ext 10¹⁹, channel p 10¹⁶"], ["Models + solve", "drift-diffusion + heat, V_G sweep"], ["Extract", "V_T, SS, DIBL, I_on, I_off, T_max"]];
  b.forEach(([h, d], i) => {
    const x = 0.6 + i * 2.48, on = i === 3;
    R(s, { x, y: 2.2, w: 2.2, h: 2.0, fill: on ? C.navy : C.panel, r: 0.08 });
    T(s, String(i + 1).padStart(2, "0"), { x: x + 0.2, y: 2.35, w: 1, h: 0.3, size: 11, bold: true, color: on ? "AFC0F5" : C.mute });
    T(s, h, { x: x + 0.2, y: 2.7, w: 1.9, h: 0.4, size: 16, bold: true, color: on ? C.white : C.ink });
    T(s, d, { x: x + 0.2, y: 3.15, w: 1.85, h: 0.9, size: 12, color: on ? "D9DFF5" : C.grey });
    if (i < 4) T(s, "→", { x: x + 2.2, y: 2.95, w: 0.28, h: 0.5, size: 18, color: C.mute, align: "center" });
  });
  T(s, "Tools: Atlas 5.28.1.R (device + lattice heat) · DeckBuild (deck + extract) · TonyPlot (plots)", { x: 0.6, y: 4.6, w: 12.1, h: 0.3, size: 13, color: C.grey });
  key(s, "One deck, five steps; only a few lines change between stages.");
  notes(s, "We write one Atlas input deck. It defines the mesh and regions, sets doping, chooses physical models, solves for voltage sweeps, and extracts the numbers in DeckBuild.");
}

function solves() {
  const nodes = [
    ["Poisson", "potential ψ", 1.7, 1.75], ["Electron continuity", "current J_n", 4.2, 2.85], ["Joule heat", "H = J · E", 4.2, 4.3], ["Heat equation", "lattice temp. T_L", 1.7, 5.4], ["Mobility μ(T)", "fldmob, cvt", 0.6, 3.55],
  ];
  const steps = [
    ["Poisson: the gate sets the potential", "Solves for ψ everywhere: the energy hill under the gate.", "Atlas first finds the potential."],
    ["Current from the potential", "Electrons drift and diffuse: current J_n. Same physics as the I_D–V_G curves.", "The potential drives the current."],
    ["Current makes heat", "Every bit of current loses energy, H = J · E, most of it near the drain.", "Current turns into heat."],
    ["Heat raises the temperature", "The heat equation spreads H through all regions; each material has its own κ.", "Heat raises the lattice temperature."],
    ["Hot lattice slows electrons", "Mobility falls as T rises → less current. The loop closes: Atlas repeats until it settles.", "Temperature changes the current again: a loop."],
    ["Heat must leave somewhere", "thermcontact on S, D, G at 300 K. α (W/cm²·K): larger α = easier exit = cooler.", "Heat leaves through the contacts: the heat-exit α we calibrate."],
  ];
  const cols = [C.navy, C.blue, C.orange, C.red, C.teal];
  steps.forEach(([h, b, k], i) => {
    const s = slide();
    header(s, "Methodology – What Atlas solves", "Electricity and heat are solved together, because each changes the other");
    stepDots(s, steps.length, i);
    const lit = (j) => j <= Math.min(i, 4);
    const ctr = (j) => [nodes[j][2] + 1.1, nodes[j][3] + 0.35];
    const link = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]];
    link.forEach(([a, bb], j) => {
      const on = i >= j + 1;
      const [x1, y1] = ctr(a), [x2, y2] = ctr(bb);
      L(s, x1, y1, x2, y2, { color: on ? cols[bb] : "E4E6EA", w: on ? 2.5 : 1.25, arrow: on, name: "asL" + j });
    });
    nodes.forEach(([n, d, x, y], j) => {
      R(s, { x, y, w: 2.2, h: 0.7, fill: lit(j) ? cols[j] : C.panel, r: 0.1, name: "asN" + j });
      T(s, n, { x, y: y + 0.06, w: 2.2, h: 0.32, size: 13, bold: true, color: lit(j) ? C.white : "B7BAC0", align: "center", name: "asNt" + j });
      T(s, d, { x, y: y + 0.36, w: 2.2, h: 0.28, size: 10, color: lit(j) ? "E8ECF5" : "C9CCD3", align: "center", name: "asNd" + j });
    });
    if (i >= 5) {
      L(s, 4.0, 5.75, 5.8, 5.75, { color: C.orange, w: 3, arrow: true, name: "asOut" });
      T(s, "heat exit α → 300 K", { x: 4.0, y: 5.4, w: 2.2, h: 0.3, size: 12, bold: true, color: C.orange, name: "asOutL" });
    }
    card(s, { x: 7.6, y: 1.75, w: 5.13, h: 2.4, n: i + 1, head: h, body: b, color: i < 5 ? cols[Math.min(i, 4)] : C.orange });
    key(s, k);
    notes(s, b);
  });
}

function solver() {
  const s = slide();
  header(s, "Methodology – Choosing the solver", "How we made a 3D electro-thermal run fit on a laptop");
  const o = [["Gummel", "✗", "heat residual stuck at 10¹⁹: no I–V data", C.red], ["Full Newton", "✗", "4 coupled equations, 174k nodes: memory allocation failure", C.red], ["Block Newton, 1 carrier", "✓", "heat solved in its own block, 24k nodes: 15–35 min per run", C.green]];
  o.forEach(([h, m, b, col], i) => {
    const y = 1.7 + i * 1.3;
    R(s, { x: 0.6, y, w: 6.2, h: 1.1, fill: i === 2 ? "E8F5EC" : C.panel, r: 0.08 });
    E(s, { cx: 1.1, cy: y + 0.55, rx: 0.26, fill: col });
    T(s, m, { x: 0.84, y: y + 0.29, w: 0.52, h: 0.52, size: 16, bold: true, color: C.white, align: "center", valign: "middle" });
    T(s, h, { x: 1.6, y: y + 0.12, w: 5, h: 0.38, size: 16, bold: true, color: col });
    T(s, b, { x: 1.6, y: y + 0.52, w: 5.1, h: 0.5, size: 12, color: C.grey });
  });
  R(s, { x: 7.3, y: 1.7, w: 5.43, h: 3.7, fill: C.ink, r: 0.08 });
  T(s, "models cvt srh auger bgn fldmob lat.temp\nthermcontact num=1 elec.num=1 \\\n   ext.temp=300 alpha=5000\nmethod block newton carriers=1 electrons\nprobe name=Tmax lat.temp max", { x: 7.55, y: 1.95, w: 5.0, h: 3.2, size: 12, font: "Courier New", color: "D9F2E3", psa: 6 });
  key(s, "Block Newton with one carrier makes 3D self-heating practical.");
  notes(s, "Gummel could not converge the heat equation, and the fully coupled Newton ran out of memory. Block Newton with electrons only solves the heat equation separately and needs far less memory.");
}

function metrics() {
  [0, 1].forEach((k) => {
    const s = slide();
    header(s, "Methodology – Every number from two curves", "The transfer curve gives the electrical metrics; the heat curve gives R_th");
    stepDots(s, 2, k);
    const box = { x: 1.3, y: 1.85, w: 5.0, h: 3.5 };
    const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [1e-10, 1e-4], ylog: true, xt: [0, 0.2, 0.4, 0.6], yt: [1e-10, 1e-8, 1e-6, 1e-4], yf: fmtTick, xl: "V_G (V)", yl: "I_D (log)", name: "mA" });
    G(s, D.VG.map((v, j) => [mx(v), my(D.repLo[j] * 1e-6)]), { color: C.teal, w: 2.25, name: "mtLo" });
    G(s, D.VG.map((v, j) => [mx(v), my(D.repHi[j] * 1e-6)]), { color: C.blue, w: 2.5, name: "mtHi" });
    const ann = [["I_off: V_G = 0", 0.02, 3e-10, C.red], ["V_T: max-g_m extrapolation", 0.25, 3e-7, C.blue], ["SS: mV per ×10", 0.12, 1e-8, C.orange], ["DIBL: shift ÷ 0.65 V", 0.12, 1.5e-9, C.purple], ["I_on: V_G = V_D = 0.7 V", 0.38, 6e-5, C.green]];
    ann.forEach(([t, x, y, col], j) => T(s, t, { x: mx(x), y: my(y) - 0.12, w: 2.4, h: 0.24, size: 10, bold: true, color: col, name: "mtA" + j }));
    if (k) {
      const b2 = { x: 7.9, y: 1.85, w: 4.6, h: 3.5 };
      const r = axes(s, b2, { xr: [0, 20], yr: [0, 50], xt: [0, 5, 10, 15, 20], yt: [0, 25, 50], xl: "P = I_D · V_D (µW)", yl: "ΔT (K)", name: "mB" });
      G(s, D.VG.map((v, j) => [r.mx(D.repHi[j] * 0.7), r.my(D.tRep[j] - 300)]), { color: C.orange, w: 2.5, name: "mtH" });
      T(s, "R_th = ΔT / P = slope\n= 2.27 × 10⁶ K/W", { x: r.mx(1), y: r.my(45), w: 2.5, h: 0.5, size: 12, bold: true, color: C.orange, name: "mtHL" });
      T(s, "T_max: probe lat.temp max;  ΔT = T_max − 300 K", { x: 7.9, y: 5.95, w: 4.6, h: 0.25, size: 10, color: C.grey, name: "mtHN" });
    } else {
      card(s, { x: 7.9, y: 1.85, w: 4.83, h: 3.0, head: "Two transfer curves", color: C.blue, body: "V_D = 0.05 V (teal) and 0.7 V (blue), V_G swept 0 → 0.7 V.\nFrom them: V_T, SS, DIBL, I_on and I_off.", name: "mtCard" });
    }
    key(s, k ? "Heat curve: R_th is the slope of ΔT against power." : "Transfer curves: V_T, SS, DIBL, I_on and I_off.");
    notes(s, "Every number we report is read from these two kinds of curve.");
  });
}

function chapter5() {
  section("5 · Literature and method");
  notes(contents(4), "Chapter 5: what others found, and how we simulate.");
  overview();
  choose();
  basePaper();
  density();
  tableI();
  heatPath();
  kang();
  plan();
  flow();
  solves();
  solver();
  metrics();
}
module.exports = { chapter5 };
