// Chapter 3: FinFET → GAAFET
const { cell, C, section, slide, T, R, E, L, G, header, key, notes, stepDots, card, knob, chips, axes, fmtI, fmtTick, ekv, range } = require("./lib");
const { contents } = require("./s0");
const D = require("./data");

// ---------- 3.1 one camera: planar → fin → GAA → stack (cross-section across the channel) ----------
function evolution() {
  // geometry per step: channel rects, gate rect, substrate, isolation
  const cx = 3.4, base = 4.9; // substrate top
  const steps = [
    { tag: "planar", ch: [[cx - 1.6, base - 0.35, 3.2, 0.35]], gate: [cx - 1.75, base - 0.35 - 0.62, 3.5, 0.5], iso: 0, inv: "top", leak: 1, N: 1,
      h: "Planar: gate on top only", b: "The gate touches the channel from one side. Deep below, its field is weak, so at short L_g electrons leak there.", m: ["1", "4.37 nm", "201 mV/V", "100 mV/dec"] },
    { tag: "fin", ch: [[cx - 0.3, base - 2.2, 0.6, 2.2]], gate: [cx - 1.75, base - 2.2 - 0.62, 3.5, 0.5], iso: 1, inv: "", N: 1,
      h: "Stand the channel up: a fin", b: "Make the channel a thin, tall wall of silicon. Source and drain are the two ends of the fin (in and out of the screen).", m: ["1", "4.37 nm", "201 mV/V", "100 mV/dec"] },
    { tag: "fin3", ch: [[cx - 0.3, base - 2.2, 0.6, 2.2]], gate: [cx - 0.85, base - 2.75, 1.7, 2.1], iso: 1, inv: "", N: 3,
      h: "Wrap the gate over it", b: "The gate now covers the left, top and right of the fin, like a saddle over a wall. The fin is thin, so no point is far from the gate.", m: ["3", "2.52 nm", "62 mV/V", "68 mV/dec"] },
    { tag: "fin3on", ch: [[cx - 0.3, base - 2.2, 0.6, 2.2]], gate: [cx - 0.85, base - 2.75, 1.7, 2.1], iso: 1, inv: "three", N: 3,
      h: "Channel on three surfaces", b: "Above V_T electrons gather on the top and both sides at once. Taller fin = more surface = more current.", m: ["3", "2.52 nm", "62 mV/V", "68 mV/dec"] },
    { tag: "finleak", ch: [[cx - 0.3, base - 2.2, 0.6, 2.2]], gate: [cx - 0.85, base - 2.75, 1.7, 2.1], iso: 1, inv: "three", leak: 2, N: 3,
      h: "But the bottom is open", b: "The fin bottom sits in the substrate with no gate there: some leakage remains. Fix: cut the channel free from the substrate.", m: ["3", "2.52 nm", "62 mV/V", "68 mV/dec"] },
    { tag: "gaa", ch: [[cx - 0.55, base - 1.75, 1.1, 0.45]], gate: [cx - 1.0, base - 2.2, 2.0, 1.35], iso: 1, inv: "ring", N: 4,
      h: "Cut it free: gate-all-around", b: "The channel becomes a sheet hanging inside the gate. The gate surrounds it: top, bottom, left and right. No open side, no leakage path.", m: ["4", "2.18 nm", "41 mV/V", "65 mV/dec"] },
    { tag: "stack", ch: [[cx - 0.55, base - 1.2, 1.1, 0.4], [cx - 0.55, base - 1.95, 1.1, 0.4], [cx - 0.55, base - 2.7, 1.1, 0.4]], gate: [cx - 1.0, base - 3.15, 2.0, 2.55], iso: 1, inv: "ring", N: 4,
      h: "Stack the sheets", b: "Three sheets under one gate: 3× the current in the same footprint, with the same gate control. This is the 3 nm-class transistor.", m: ["4", "2.18 nm", "41 mV/V", "65 mV/dec"] },
  ];
  steps.forEach((st, i) => {
    const s = slide();
    header(s, "From planar to GAA – One camera, four transistors", "Looking along the channel: current flows into the screen");
    stepDots(s, steps.length, i);
    R(s, { x: 0.9, y: base, w: 5.0, h: 1.0, fill: C.sub, name: "evSub" });
    T(s, "silicon substrate", { x: 4.3, y: base + 0.68, w: 1.5, h: 0.28, size: 10, color: "8A6D1F", align: "right", name: "evSubL" });
    R(s, { x: 0.9, y: base - 0.35, w: st.iso ? 1.7 : 0.01, h: st.iso ? 0.35 : 0.01, fill: C.nitride, name: "evIsoL" });
    R(s, { x: 5.9 - (st.iso ? 1.7 : 0.01), y: base - 0.35, w: st.iso ? 1.7 : 0.01, h: st.iso ? 0.35 : 0.01, fill: C.nitride, name: "evIsoR" });
    if (st.iso) T(s, "isolation oxide", { x: 0.95, y: base - 0.32, w: 1.6, h: 0.28, size: 9, color: C.grey, name: "evIsoT" });
    const [gx, gy, gw, gh] = st.gate;
    R(s, { x: gx, y: gy, w: gw, h: gh, fill: C.gate, r: 0.05, name: "evGate" });
    T(s, st.N === 4 ? "metal gate (all round)" : st.N === 3 ? "gate wraps 3 sides" : "gate on top only", { x: 6.0, y: gy + 0.05, w: 1.5, h: 0.5, size: 10, bold: true, color: C.purple, name: "evGateL" });
    L(s, gx + gw + 0.05, gy + 0.2, 6.0, gy + 0.2, { color: C.purple, w: 0.75, name: "evGateLn" });
    // channels (3 slots, unused collapse into the first)
    for (let j = 0; j < 3; j++) {
      const c = st.ch[j] || st.ch[0];
      R(s, { x: c[0] - 0.06, y: c[1] - 0.06, w: c[2] + 0.12, h: c[3] + (st.tag === "planar" || st.tag.startsWith("fin") ? 0.06 : 0.12), fill: C.hfo2, name: "evOx" + j });
      R(s, { x: c[0], y: c[1], w: c[2], h: c[3], fill: C.body, name: "evCh" + j });
      // inversion layers
      const inv = st.inv, t = 0.07;
      const show = (cond) => (cond ? 0 : 100);
      R(s, { x: c[0], y: c[1], w: c[2], h: t, fill: C.elec, ft: show(inv === "top" || inv === "three" || inv === "ring"), name: "evInT" + j });
      R(s, { x: c[0], y: c[1], w: t, h: c[3], fill: C.elec, ft: show(inv === "three" || inv === "ring"), name: "evInL" + j });
      R(s, { x: c[0] + c[2] - t, y: c[1], w: t, h: c[3], fill: C.elec, ft: show(inv === "three" || inv === "ring"), name: "evInR" + j });
      R(s, { x: c[0], y: c[1] + c[3] - t, w: c[2], h: t, fill: C.elec, ft: show(inv === "ring"), name: "evInB" + j });
    }
    if (st.leak === 1) { G(s, [[cx - 1.2, base + 0.2], [cx, base + 0.45], [cx + 1.2, base + 0.2]], { color: C.red, w: 2.25, dash: "dash", name: "evLeak" }); T(s, "leakage deep below the gate", { x: cx - 1.5, y: base + 0.5, w: 3, h: 0.25, size: 10, bold: true, color: C.red, align: "center", name: "evLeakL" }); }
    if (st.leak === 2) { E(s, { cx, cy: base + 0.05, rx: 0.5, ry: 0.22, line: C.red, lw: 2.25, name: "evLeak" }); T(s, "bottom: no gate here", { x: cx - 1.5, y: base + 0.3, w: 3, h: 0.25, size: 10, bold: true, color: C.red, align: "center", name: "evLeakL" }); }
    card(s, { x: 7.6, y: 1.7, w: 5.13, h: 2.45, n: i + 1, head: st.h, body: st.b, color: st.N === 4 ? C.green : st.N === 3 ? C.blue : C.red });
    chips(s, [
      { k: "gate sides N", v: st.m[0], d: i && st.m[0] !== steps[i - 1].m[0] ? 1 : 0, good: true },
      { k: "λ", v: st.m[1], d: i && st.m[1] !== steps[i - 1].m[1] ? -1 : 0, good: true },
      { k: "DIBL at 14 nm", v: st.m[2], d: i && st.m[2] !== steps[i - 1].m[2] ? -1 : 0, good: true },
    ], { x: 7.6, y: 4.4, w: 1.63, h: 0.75 });
    T(s, "SS at 14 nm: " + st.m[3] + "   (simple λ model, same 8 nm silicon)", { x: 7.6, y: 5.35, w: 5.1, h: 0.3, size: 11, color: C.grey, name: "evSS" });
    key(s, ["A flat channel: the gate controls only its top surface.", "The channel stands up into a vertical fin.", "The gate wraps the fin on three sides: λ falls from 4.37 to 2.52 nm.", "The channel forms on three surfaces at once.", "The open bottom is the FinFET's weak spot.", "Gate-all-around: the best electrostatic control, used at 3 nm and below.", "Stacked sheets: more current per footprint, same control."][i]);
    notes(s, st.b);
  });
}

function finWidth() {
  const ws = [12, 8, 5];
  ws.forEach((wf, k) => {
    const s = slide();
    header(s, "FinFET – The fin width knob", "Thinner fin: every point is closer to the gate, so λ and leakage fall");
    stepDots(s, ws.length, k);
    const cx = 3.4, base = 4.9, wpx = wf * 0.075;
    R(s, { x: 0.9, y: base, w: 5.0, h: 1.0, fill: C.sub, name: "evSub" });
    R(s, { x: 0.9, y: base - 0.35, w: 1.7, h: 0.35, fill: C.nitride, name: "evIsoL" });
    R(s, { x: 4.2, y: base - 0.35, w: 1.7, h: 0.35, fill: C.nitride, name: "evIsoR" });
    R(s, { x: cx - wpx / 2 - 0.55, y: base - 2.75, w: wpx + 1.1, h: 2.4, fill: C.gate, r: 0.05, name: "evGate" });
    R(s, { x: cx - wpx / 2 - 0.06, y: base - 2.26, w: wpx + 0.12, h: 2.26, fill: C.hfo2, name: "evOx0" });
    R(s, { x: cx - wpx / 2, y: base - 2.2, w: wpx, h: 2.2, fill: C.body, name: "evCh0" });
    L(s, cx - wpx / 2, base - 2.45, cx + wpx / 2, base - 2.45, { color: C.ink, w: 1, arrow: true, arrow2: true, name: "fwDim" });
    T(s, "W_fin = " + wf + " nm", { x: cx - 1, y: base - 3.15, w: 2, h: 0.28, size: 13, bold: true, align: "center", name: "fwDimL" });
    T(s, "H_fin = 40 nm", { x: cx + 1.1, y: base - 1.3, w: 1.4, h: 0.25, size: 11, color: C.grey, name: "fwH" });
    const lam = (w) => Math.sqrt(0.8 * w), sce = (w) => Math.exp(-14 / (2 * lam(w)));
    const box = { x: 8.0, y: 1.8, w: 4.6, h: 2.4 };
    const { mx, my } = axes(s, box, { xr: [4, 12], yr: [0, 0.12], xt: [4, 6, 8, 10, 12], yt: [0, 0.04, 0.08, 0.12], yf: (v) => v.toFixed(2), xl: "fin width W_fin (nm)", yl: "short-channel effect at L_g = 14 nm" });
    G(s, range(4, 12, 30).map((w) => [mx(w), my(sce(w))]), { color: C.blue, w: 2.5, name: "fwC" });
    E(s, { cx: mx(wf), cy: my(sce(wf)), rx: 0.09, fill: C.blue, line: C.white, lw: 1.5, name: "fwPt" });
    chips(s, [
      { k: "scale length λ", v: lam(wf).toFixed(2) + " nm", d: k ? -1 : 0, good: true },
      { k: "SCE = e^(−L/2λ)", v: sce(wf).toFixed(3), d: k ? -1 : 0, good: true },
      { k: "W_eff = 2H + W", v: 80 + wf + " nm", d: k ? -1 : 0, good: false },
    ], { x: 7.5, y: 4.8, w: 1.65, h: 0.72 });
    knob(s, { x: 7.7, y: 6.05, w: 4.9, label: "KNOB: fin width W_fin", ticks: [4, 6, 8, 10, 12], val: wf, unit: " nm", color: C.blue });
    key(s, ["Wide fin (12 nm): the centre is far from the gate; control is only fair.", "Fin 8 nm: three gate sides give λ = 2.52 nm, far better than planar (4.37 nm).", "Thin fin (5 nm): λ = 2.0 nm, but the fin is hard to make and carries a little less current."][k]);
    notes(s, "λ = √(3 · W_fin · 0.8 nm / 3); SCE = exp(−L_g / 2λ). Thinner fins help control but cost width and are hard to etch.");
  });
}

// ---------- 3.3 wire, sheet, stack ----------
function shapes() {
  const cases = [
    { n: "Nanowire, r = 4 nm", sub: "our standard device", w: 0.8, h: 0.8, r: 0.4, cnt: 1, weff: 25.1, lam: 2.18, k: "A round wire: gate on every side, nothing is far from the gate." },
    { n: "Nanowire, r = 5.64 nm", sub: "our reproduced device (same 100 nm² as the sheet)", w: 1.13, h: 1.13, r: 0.565, cnt: 1, weff: 35.4, lam: 2.59, k: "Thicker wire: more current, but the centre is farther from the gate (λ up)." },
    { n: "Nanosheet, 20 × 5 nm", sub: "base paper [1]", w: 2.0, h: 0.5, r: 0.12, cnt: 1, weff: 50.0, lam: 1.73, k: "A flat sheet: thin (5 nm) for control, wide (20 nm) for more current." },
    { n: "3 stacked sheets", sub: "3 nm-class chips", w: 2.0, h: 0.5, r: 0.12, cnt: 3, weff: 150.0, lam: 1.73, k: "Stack three sheets: 3× the current in the same footprint, same gate control." },
  ];
  cases.forEach((c, k) => {
    const s = slide();
    header(s, "GAAFET – Wire, sheet, stack", "The shape of the channel sets the current (W_eff) and the control (λ)");
    stepDots(s, cases.length, k);
    T(s, c.n, { x: 0.6, y: 1.6, w: 6, h: 0.4, size: 20, bold: true, align: "center", name: "shN" });
    T(s, c.sub, { x: 0.6, y: 2.0, w: 6, h: 0.3, size: 12, color: C.grey, align: "center", name: "shS" });
    const cx = 3.6, cy = 3.95;
    const tot = c.cnt === 3 ? 2.6 : c.h;
    R(s, { x: cx - c.w / 2 - 0.45, y: cy - tot / 2 - 0.45, w: c.w + 0.9, h: tot + 0.9, fill: C.gate, r: c.cnt === 3 ? 0.15 : c.w === c.h ? (c.w + 0.9) / 2 : 0.35, name: "shG" });
    for (let j = 0; j < 3; j++) {
      const yy = c.cnt === 3 ? cy - 1.05 + j * 1.05 : cy;
      R(s, { x: cx - c.w / 2 - 0.08, y: yy - c.h / 2 - 0.08, w: c.w + 0.16, h: c.h + 0.16, fill: C.hfo2, r: c.w === c.h ? (c.w + 0.16) / 2 : 0.16, name: "shO" + j });
      R(s, { x: cx - c.w / 2, y: yy - c.h / 2, w: c.w, h: c.h, fill: C.body, r: c.w === c.h ? c.w / 2 : 0.1, name: "shC" + j });
    }
    T(s, "gate (all round)", { x: cx + 1.6, y: cy - 0.15, w: 1.6, h: 0.3, size: 11, bold: true, color: C.purple, name: "shGl" });
    // W_eff bars
    const bx = 7.6, by = 4.6, bh = 2.6;
    T(s, "W_eff = gate perimeter (nm)   →   I_on ∝ W_eff", { x: 7.3, y: 1.6, w: 5.4, h: 0.3, size: 13, bold: true, name: "shBt" });
    cases.forEach((cc, j) => {
      const h = bh * cc.weff / 150, on = j <= k;
      R(s, { x: bx + j * 1.25, y: by - h, w: 0.85, h, fill: j === k ? C.teal : on ? "9FD8D2" : C.panel, name: "shB" + j });
      T(s, on ? cc.weff.toFixed(1) : "", { x: bx + j * 1.25 - 0.2, y: by - h - 0.3, w: 1.25, h: 0.25, size: 11, bold: true, align: "center", name: "shBv" + j });
      T(s, ["wire 4", "wire 5.64", "sheet", "stack"][j], { x: bx + j * 1.25 - 0.2, y: by + 0.05, w: 1.25, h: 0.25, size: 10, color: C.grey, align: "center", name: "shBl" + j });
    });
    chips(s, [
      { k: "W_eff", v: c.weff.toFixed(1) + " nm", d: k ? 1 : 0, good: true },
      { k: "scale length λ", v: c.lam.toFixed(2) + " nm", d: k ? (c.lam > cases[k - 1].lam ? 1 : c.lam < cases[k - 1].lam ? -1 : 0) : 0, good: c.lam <= (cases[k - 1] || c).lam },
      { k: "silicon area", v: ["50 nm²", "100 nm²", "100 nm²", "300 nm²"][k], d: k === 1 || k === 3 ? 1 : 0, good: true },
    ], { x: 7.3, y: 5.05, w: 1.7, h: 0.72 });
    key(s, c.k);
    notes(s, "Weff is the perimeter the gate wraps: 2πr for a wire, 2(W+T) for a sheet, times the number of sheets.");
  });
}

// ---------- 3.4 how a GAAFET is made (side view along the channel) ----------
function fab() {
  const steps = [
    ["Grow a layer cake", "Alternate silicon (yellow) and SiGe (grey) layers, then etch them into one wide fin.", "GAA starts as a fin made of alternating layers."],
    ["Place a dummy gate", "A temporary gate and nitride spacers mark where the real gate will go.", "A placeholder gate holds the shape."],
    ["Grow source and drain", "The fin ends are replaced by n+ silicon. They clamp the silicon sheets at both ends.", "Source and drain hold the silicon sheets."],
    ["Remove dummy gate and SiGe", "A selective etch removes only the SiGe. The silicon sheets now hang like bridges.", "The sheets are free: there is space all around them."],
    ["Fill with gate all around", "HfO2, then metal, fill every gap. Each sheet is wrapped on all four sides.", "The gate now surrounds every sheet."],
  ];
  const x0 = 0.9, x1 = 6.3, g0 = 2.9, g1 = 4.3, base = 5.3, lh = 0.36;
  steps.forEach(([h, b, k], i) => {
    const s = slide();
    header(s, "GAAFET – How it is made", "Side view along the channel: from a layer cake to sheets wrapped by the gate");
    stepDots(s, steps.length, i);
    R(s, { x: x0, y: base, w: x1 - x0, h: 0.6, fill: C.sub, name: "fbSub" });
    for (let j = 0; j < 6; j++) {
      const y = base - (j + 1) * lh, si = j % 2 === 1;
      const mat = si ? C.body : C.sige;
      const center = si ? C.body : i >= 4 ? C.gate : i >= 3 ? C.white : C.sige;
      const end = i >= 2 ? C.nplus : mat;
      R(s, { x: x0, y, w: g0 - x0 - 0.25, h: lh, fill: end, line: i >= 2 ? undefined : C.white, lw: 0.5, name: "fbL" + j });
      R(s, { x: g1 + 0.25, y, w: x1 - g1 - 0.25, h: lh, fill: end, line: i >= 2 ? undefined : C.white, lw: 0.5, name: "fbR" + j });
      R(s, { x: g0 - 0.25, y, w: g1 - g0 + 0.5, h: lh, fill: center, line: C.white, lw: 0.5, name: "fbC" + j });
      if (si && i >= 4) R(s, { x: g0 - 0.25, y: y - 0.05, w: g1 - g0 + 0.5, h: lh + 0.1, fill: C.hfo2, ft: 30, name: "fbHk" + j });
      if (si && i >= 4) R(s, { x: g0 - 0.25, y, w: g1 - g0 + 0.5, h: lh, fill: C.body, name: "fbSi" + j });
    }
    const top = base - 6 * lh;
    if (i >= 1) {
      R(s, { x: g0, y: top - 0.9, w: g1 - g0, h: 0.9, fill: i >= 4 ? C.gate : i >= 3 ? C.white : C.metal, line: i === 3 ? C.mute : undefined, dash: "dash", name: "fbDG" });
      T(s, i >= 4 ? "metal gate" : i >= 3 ? "(removed)" : "dummy gate", { x: g0, y: top - 0.7, w: g1 - g0, h: 0.3, size: 11, bold: true, color: i >= 4 ? "3D2F7A" : i >= 3 ? C.mute : C.white, align: "center", name: "fbDGl" });
      R(s, { x: g0 - 0.25, y: top - 0.9, w: 0.25, h: 0.9, fill: C.nitride, name: "fbSpL" });
      R(s, { x: g1, y: top - 0.9, w: 0.25, h: 0.9, fill: C.nitride, name: "fbSpR" });
    }
    if (i >= 2) {
      T(s, "n+ source", { x: x0, y: top - 0.35, w: g0 - x0 - 0.25, h: 0.3, size: 11, bold: true, color: C.blue, align: "center", name: "fbSL" });
      T(s, "n+ drain", { x: g1 + 0.25, y: top - 0.35, w: x1 - g1 - 0.25, h: 0.3, size: 11, bold: true, color: C.blue, align: "center", name: "fbDL" });
    }
    T(s, "silicon sheets (yellow)", { x: x0, y: base + 0.7, w: 2.6, h: 0.25, size: 10, color: "8A6D1F", name: "fbLeg1" });
    T(s, i >= 4 ? "gate fills the gaps (lavender)" : i >= 3 ? "gaps where SiGe was" : "SiGe, removed later (grey)", { x: 3.4, y: base + 0.7, w: 3.0, h: 0.25, size: 10, color: C.grey, name: "fbLeg2" });
    card(s, { x: 7.4, y: 1.7, w: 5.33, h: 2.5, n: i + 1, head: h, body: b, color: [C.orange, C.grey, C.blue, C.orange, C.purple][i] });
    key(s, k);
    notes(s, b);
  });
}

// ---------- 3.5 gate sweep in our GAA wire (Atlas data) ----------
function gaaSweep() {
  const vgs = [0, 0.1, 0.2, 0.3, 0.5, 0.7];
  const lab = [["OFF: I_off = 624 pA", C.red], ["SUBTHRESHOLD", C.orange], ["NEAR V_T = 0.204 V", C.orange], ["CHANNEL FORMED: a ring", C.blue], ["STRONG INVERSION", C.blue], ["ON: I_on = 27.5 µA", C.green]];
  const keys = ["V_G = 0: the gate holds the hill high all round the wire. Leakage: 624 pA.", "Gate up: the whole surface of the wire pulls the hill down together.", "Near V_T a thin ring of electrons forms just inside the oxide.", "Past V_T the electron ring thickens all round the wire.", "The ring grows inward: most of the wire now carries current.", "V_G = 0.7 V: the whole wire conducts (volume inversion): I_on = 27.5 µA."];
  vgs.forEach((vg, i) => {
    const s = slide();
    header(s, "GAAFET – Turning the gate in our wire", "Reproduced GAA wire (r = 5.64 nm, L_g = 14 nm): Silvaco Atlas data, V_D = 0.7 V");
    stepDots(s, vgs.length, i);
    const cx = 2.4, cy = 3.6;
    E(s, { cx, cy, rx: 1.55, fill: C.gate, name: "gsG" });
    E(s, { cx, cy, rx: 1.15, fill: C.hfo2, name: "gsH" });
    E(s, { cx, cy, rx: 1.02, fill: C.oxide, name: "gsO" });
    const rs = 0.9, t = vg < 0.15 ? 0.0 : vg < 0.25 ? 0.05 : Math.min(0.12 + 1.6 * (vg - 0.25), 0.9);
    E(s, { cx, cy, rx: rs, fill: C.elec, ft: vg < 0.15 ? 100 : vg >= 0.7 ? 20 : 0, name: "gsE" });
    E(s, { cx, cy, rx: Math.max(rs - t, 0.01), fill: C.body, ft: vg >= 0.7 ? 60 : 0, name: "gsS" });
    T(s, "wire cross-section (gate all round)", { x: 0.6, y: 5.35, w: 3.6, h: 0.3, size: 11, color: C.grey, align: "center", name: "gsL" });
    [["gate", C.gate], ["HfO2 / SiO2", C.hfo2], ["silicon", C.body], ["electrons", C.elec]].forEach(([n, c], j) => {
      R(s, { x: 4.4, y: 2.4 + j * 0.42, w: 0.22, h: 0.22, fill: c, name: "gsLg" + j });
      T(s, n, { x: 4.72, y: 2.37 + j * 0.42, w: 1.5, h: 0.28, size: 11, color: C.grey, name: "gsLgt" + j });
    });
    const box = { x: 7.9, y: 1.85, w: 4.7, h: 2.6 };
    const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [1e-10, 1e-4], ylog: true, xt: [0, 0.2, 0.4, 0.6], yt: [1e-10, 1e-8, 1e-6, 1e-4], yf: fmtTick, xl: "gate voltage V_G (V)", yl: "I_D (log)" });
    G(s, D.VG.map((v, j) => [mx(v), my(ekv(v, 0.007, 99.7))]), { color: "D9DCE3", w: 1.5, dash: "dash", name: "gsPlanar" });
    T(s, "planar at 14 nm", { x: mx(0.02), y: my(ekv(0.0, 0.007, 99.7)) - 0.3, w: 1.4, h: 0.22, size: 9, color: C.mute, name: "gsPlanarL" });
    G(s, D.VG.map((v, j) => [mx(v), my(D.repHi[j] * 1e-6)]), { color: "C9CCD3", w: 2, name: "ivGhost" });
    const n = Math.max(2, Math.round(vg / 0.025) + 1);
    G(s, D.VG.slice(0, n).map((v, j) => [mx(v), my(D.repHi[j] * 1e-6)]), { color: C.green, w: 3, name: "ivTrail" });
    const id = D.at(D.repHi, vg) * 1e-6;
    E(s, { cx: mx(vg), cy: my(id), rx: 0.09, fill: lab[i][1], line: C.white, lw: 1.5, name: "ivPt" });
    T(s, fmtI(id), { x: mx(vg) - 1.0, y: my(id) - 0.36, w: 0.95, h: 0.24, size: 11, bold: true, color: lab[i][1], align: "right", name: "ivPtL" });
    T(s, "V_G = " + vg.toFixed(2) + " V     I_D = " + fmtI(id), { x: 7.5, y: 5.0, w: 5.2, h: 0.28, size: 14, bold: true, name: "ivRead" });
    T(s, lab[i][0], { x: 7.5, y: 5.27, w: 5.2, h: 0.24, size: 11, bold: true, color: lab[i][1], name: "ivReg" });
    knob(s, { x: 7.7, y: 6.0, w: 4.9, label: "KNOB: gate voltage V_G", ticks: [0, 0.2, 0.4, 0.6, 0.7], val: vg, fmt: (v) => v.toFixed(1), min: 0, max: 0.7, unit: " V", color: C.purple });
    key(s, keys[i]);
    notes(s, "Green: Atlas, our reproduced GAAFET at V_D = 0.7 V. Dashed grey: the planar model at the same 14 nm gate length.");
  });
}

// ---------- 3.6 planar vs FinFET vs GAA ----------
function compare() {
  const devs = [
    ["planar (1 side)", 0.007, 99.7, 4.37, "201", "241 nA", C.red],
    ["FinFET (3 sides)", 0.244, 67.9, 2.52, "62", "144 pA", C.blue],
    ["GAA (all round)", 0.281, 64.8, 2.18, "41", "26 pA", C.green],
  ];
  devs.forEach((_, k) => {
    const s = slide();
    header(s, "Planar vs FinFET vs GAA", "Same 14 nm gate, same silicon: only the number of gate sides changes");
    stepDots(s, devs.length, k);
    const box = { x: 1.3, y: 1.85, w: 5.6, h: 3.6 };
    const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [1e-11, 1e-4], ylog: true, xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], yt: [1e-11, 1e-9, 1e-7, 1e-5], yf: fmtTick, xl: "gate voltage V_G (V)", yl: "I_D at V_D = 0.7 V (log)" });
    devs.forEach(([n, vt, ss, lam, dibl, ioff, col], j) => {
      const on = j <= k;
      if (on) G(s, range(0, 0.7, 36).map((v) => [mx(v), my(ekv(v, vt, ss))]), { color: col, w: j === k ? 3 : 2, name: "cmC" + j });
      if (on) E(s, { cx: mx(0), cy: my(ekv(0, vt, ss)), rx: 0.08, fill: col, name: "cmP" + j });
      const y = 1.8 + j * 1.35;
      R(s, { x: 7.5, y, w: 5.23, h: 1.18, fill: on ? C.panel : "FAFAFB", r: 0.06, name: "cmR" + j });
      T(s, n, { x: 7.7, y: y + 0.1, w: 3, h: 0.32, size: 15, bold: true, color: on ? col : "C9CCD3", name: "cmN" + j });
      T(s, on ? "I_off = " + ioff : "", { x: 10.4, y: y + 0.1, w: 2.2, h: 0.32, size: 15, bold: true, align: "right", name: "cmI" + j });
      T(s, on ? `λ = ${lam} nm  ·  SS ≈ ${ss.toFixed(0)} mV/dec  ·  DIBL ≈ ${dibl} mV/V  ·  V_T = ${vt.toFixed(2)} V` : "", { x: 7.7, y: y + 0.55, w: 4.9, h: 0.5, size: 11, color: C.grey, name: "cmD" + j });
    });
    key(s, ["Planar at 14 nm: soft turn-on and 241 nA of leakage.", "FinFET: steeper turn-on, V_T kept, leakage down about 1700×.", "GAA: steepest turn-on and about 10 000× less leakage than planar."][k]);
    notes(s, "Simple λ model, same width, long-channel V_T = 0.35 V: SS = 59.5/(1 − 2e^(−L/2λ)), ΔV_T = 1.7·e^(−L/2λ). For learning, not Atlas data.");
  });
}

function bars() {
  const s = slide();
  header(s, "Why gate-all-around wins at 14 nm", "L_g / λ for a 14 nm gate: the gate stays in control when L_g ≥ 5–10 λ");
  const d = [["planar", 3.2, 4.37, C.red], ["double gate", 4.5, 3.09, C.orange], ["FinFET", 5.6, 2.52, C.blue], ["GAA", 6.4, 2.18, C.green]];
  const bx = 1.2, by = 5.4, sc = 0.55;
  L(s, bx - 0.2, by - 5 * sc, bx + 6.4, by - 5 * sc, { color: C.green, w: 1.25, dash: "dash" });
  T(s, "good zone: L_g ≥ 5 λ", { x: bx - 0.2, y: by - 5 * sc - 0.3, w: 1.9, h: 0.25, size: 10, bold: true, color: C.green });
  d.forEach(([n, v, l, col], i) => {
    R(s, { x: bx + i * 1.6, y: by - v * sc, w: 1.0, h: v * sc, fill: col });
    T(s, v.toFixed(1), { x: bx + i * 1.6 - 0.2, y: by - v * sc - 0.35, w: 1.4, h: 0.3, size: 16, bold: true, align: "center" });
    T(s, n, { x: bx + i * 1.6 - 0.3, y: by + 0.08, w: 1.6, h: 0.25, size: 12, bold: true, align: "center" });
    T(s, "λ = " + l + " nm", { x: bx + i * 1.6 - 0.3, y: by + 0.33, w: 1.6, h: 0.25, size: 10, color: C.grey, align: "center" });
  });
  card(s, { x: 8.0, y: 1.7, w: 4.73, h: 3.9, head: "Reading the bars", color: C.ink, body: "λ = √(3 · 8 nm · 0.8 nm / N).\nMore sides N → smaller λ → the gate wins over the drain.\nPlanar 3.2 and double gate 4.5 fail at 14 nm.\nFinFET 5.6 just passes; GAA 6.4 is safest.\nA real fin has an open bottom, so a real FinFET is a bit worse than N = 3." });
  key(s, "Only GAA keeps L_g / λ above 6 at L_g = 14 nm: that is why 3 nm-class chips use it.");
  notes(s, "Lg over lambda for a 14 nm gate, for one to four gate sides.");
}

function dibl() {
  for (let k = 0; k < 3; k++) {
    const s = slide();
    header(s, "GAAFET – Measuring DIBL on our data", "Raise V_D from 0.05 V to 0.7 V: the whole curve shifts left");
    stepDots(s, 3, k);
    const box = { x: 1.3, y: 1.85, w: 5.8, h: 3.6 };
    const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [1e-10, 1e-4], ylog: true, xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], yt: [1e-10, 1e-8, 1e-6, 1e-4], yf: fmtTick, xl: "gate voltage V_G (V)", yl: "I_D (log)" });
    G(s, D.VG.map((v, j) => [mx(v), my(D.repLo[j] * 1e-6)]), { color: C.teal, w: 2.5, name: "dbLo" });
    G(s, D.VG.map((v, j) => [mx(v), my(D.repHi[j] * 1e-6)]), { color: C.blue, w: 2.5, name: "dbHi" });
    T(s, "V_D = 0.05 V", { x: mx(0.42), y: my(5e-6) + 0.1, w: 1.3, h: 0.24, size: 11, bold: true, color: C.teal, name: "dbLoL" });
    T(s, "V_D = 0.7 V", { x: mx(0.42), y: my(1.2e-5) - 0.35, w: 1.3, h: 0.24, size: 11, bold: true, color: C.blue, name: "dbHiL" });
    if (k >= 1) {
      L(s, mx(0), my(1e-8), mx(0.7), my(1e-8), { color: C.purple, w: 1, dash: "dash", name: "dbI" });
      T(s, "I = 10 nA", { x: mx(0.55), y: my(1e-8) - 0.28, w: 1, h: 0.22, size: 10, bold: true, color: C.purple, name: "dbIL" });
    }
    if (k >= 2) {
      L(s, mx(0.083), my(1e-8) + 0.18, mx(0.107), my(1e-8) + 0.18, { color: C.purple, w: 2, arrow: true, arrow2: true, name: "dbSh" });
      T(s, "24.4 mV", { x: mx(0.107) + 0.05, y: my(1e-8) + 0.08, w: 1, h: 0.22, size: 11, bold: true, color: C.purple, name: "dbShL" });
    }
    const steps = [["Two drain voltages", "Same device, two transfer curves: V_D = 0.05 V and 0.7 V."], ["Pick one current", "Draw a line at 10 nA and read where each curve crosses it."], ["Read the shift", "V_G needed: 0.107 V → 0.083 V, a shift of 24.4 mV.\nDIBL = 24.4 mV / 0.65 V = 38 mV/V."]];
    for (let j = 0; j <= k; j++) {
      const y = 1.8 + j * 1.15;
      R(s, { x: 7.7, y, w: 5.03, h: j === 2 ? 1.2 : 0.95, fill: C.panel, r: 0.06, name: "dbK" + j });
      T(s, steps[j][0], { x: 7.95, y: y + 0.12, w: 4.6, h: 0.3, size: 15, bold: true, color: C.purple, name: "dbKh" + j });
      T(s, steps[j][1], { x: 7.95, y: y + 0.45, w: 4.6, h: 0.7, size: 12, color: C.grey, name: "dbKb" + j });
    }
    if (k === 2) T(s, "Standard wire r = 4 nm: 17.3 mV/V · reproduced r = 5.64 nm: 38 mV/V.\nThicker wire → weaker gate grip.", { x: 7.7, y: 5.25, w: 5.03, h: 0.6, size: 12, bold: true, name: "dbNote" });
    key(s, "DIBL = shift ÷ ΔV_D: a small number means the gate, not the drain, is in charge.");
    notes(s, "Constant-current method at 10 nA on the Atlas curves of the reproduced GAAFET.");
  }
}

function scoreboard() {
  const s = slide();
  header(s, "Our GAA device in numbers", "Standard cylindrical GAAFET in Atlas (L_g = 14 nm, r = 4 nm), before any thermal tuning");
  const st = [["61.3", "mV/dec", "subthreshold swing", "ideal limit 60"], ["17.3", "mV/V", "DIBL", "drain barely moves V_T"], ["99", "pA", "I_off", "tiny leakage when off"], ["1.8×10⁵", "", "I_on / I_off", "clean switch"]];
  st.forEach(([v, u, l, d], i) => {
    const x = 0.6 + i * 3.08;
    R(s, { x, y: 1.75, w: 2.85, h: 2.0, fill: C.panel, r: 0.08 });
    T(s, [{ text: v, options: { fontSize: 36 } }, { text: u ? " " + u : "", options: { fontSize: 14, color: C.grey } }], { x: x + 0.2, y: 1.9, w: 2.5, h: 0.8, bold: true, valign: "middle", color: C.green });
    T(s, l, { x: x + 0.2, y: 2.75, w: 2.5, h: 0.32, size: 15, bold: true });
    T(s, d, { x: x + 0.2, y: 3.1, w: 2.5, h: 0.3, size: 12, color: C.grey });
  });
  const rows = [["V_T", "0.209 V", "φm ↑ raises it; short L_g lowers it"], ["SS", "61.3 mV/dec", "more gate sides, thin oxide, cooler"], ["DIBL", "17.3 mV/V", "large L_g / λ (GAA, thin wire)"], ["I_on", "17.9 µA", "W_eff ↑, V_T ↓, cooler (μ ↑)"], ["I_off", "99 pA", "V_T ↑, SS ↓, DIBL ↓"], ["λ", "2.18 nm", "N ↑, t_si ↓, t_ox ↓"]];
  const hd = { bold: true, color: C.white, fill: { color: C.ink } };
  const tbl = [[cell("Metric", hd), cell("Our standard GAA", hd), cell("Gets better when", hd)]];
  rows.forEach((r) => tbl.push(r.map((c, j) => cell(c, { bold: j === 0, fill: { color: C.panel } }))));
  s.addTable(tbl, { x: 0.6, y: 4.0, w: 12.13, colW: [1.6, 2.6, 7.93], fontFace: "Segoe UI", fontSize: 11, color: C.ink, border: { type: "solid", color: C.white, pt: 1.5 }, rowH: 0.29 });
  key(s, "GAA solves the short-channel problem at L_g = 14 nm.");
  notes(s, "Electrical results of our standard cylindrical GAAFET in Atlas, before any thermal tuning. Subthreshold swing is close to the 60 mV/dec limit and DIBL is small.");
}

function chapter3() {
  section("3 · FinFET → GAAFET");
  notes(contents(2), "Chapter 3: wrap more gate around the channel.");
  evolution();
  finWidth();
  shapes();
  fab();
  gaaSweep();
  compare();
  bars();
  dibl();
  scoreboard();
}
module.exports = { chapter3 };
