// Chapter 1: the MOSFET switch
const { C, section, slide, T, R, E, L, G, header, key, notes, stepDots, card, knob, chips, axes, fmtI, fmtTick, ekv, range } = require("./lib");
const { contents } = require("./s0");

const sig = (z) => 1 / (1 + Math.exp(-z));
const YS = 2.45; // silicon surface
const ES = 5.2;  // source energy level (y)
const EV_IN = 0.85; // inches per eV on the band plot

// ---------- the planar device (side view) ----------
function mos(s, p) {
  const { gx0 = 2.1, gx1 = 4.9, x0 = 0.7, x1 = 6.3 } = p;
  const show = p.show || { body: 1, sd: 1, gate: 1, labels: 1 };
  // body
  R(s, { x: x0, y: YS, w: x1 - x0, h: 1.55, fill: C.body, name: "mBody" });
  T(s, "p-type silicon (body)", { x: x0 + 1.8, y: YS + 1.2, w: 2.2, h: 0.25, size: 10, color: "8A6D1F", align: "center", name: "mBodyL" });
  // depletion under the channel + around S/D
  if (p.depl) R(s, { x: gx0, y: YS, w: gx1 - gx0, h: p.depl, fill: C.depl, name: "mDepl" });
  if (p.sdDepl) {
    R(s, { x: x0, y: YS, w: gx0 - x0 + p.sdDepl, h: 0.6 + p.sdDepl, fill: C.depl, r: 0.12, name: "mDepS" });
    R(s, { x: gx1 - p.sdDepl, y: YS, w: x1 - gx1 + p.sdDepl, h: 0.6 + p.sdDepl, fill: C.depl, r: 0.12, name: "mDepD" });
  }
  if (show.sd) {
    R(s, { x: x0, y: YS, w: gx0 - x0 + 0.05, h: 0.6, fill: C.nplus, r: 0.05, name: "mSrc" });
    R(s, { x: gx1 - 0.05, y: YS, w: x1 - gx1 + 0.05, h: 0.6, fill: C.nplus, r: 0.05, name: "mDrn" });
    T(s, "n+ source", { x: x0, y: YS + 0.17, w: gx0 - x0, h: 0.25, size: 10, color: C.white, align: "center", bold: true, name: "mSrcL" });
    T(s, "n+ drain", { x: gx1, y: YS + 0.17, w: x1 - gx1, h: 0.25, size: 10, color: C.white, align: "center", bold: true, name: "mDrnL" });
  }
  // electron channel
  if (p.tch !== undefined) {
    const xe = p.xe ?? gx1, t0 = Math.max(p.tch, 0.004), tD = Math.max(p.tchD ?? p.tch, 0.004);
    G(s, [[gx0, YS], [xe, YS], [xe, YS + tD], [gx0, YS + t0]], { close: true, fill: C.elec, name: "mChan" });
  }
  if (show.gate) {
    R(s, { x: gx0, y: YS - 0.08, w: gx1 - gx0, h: 0.08, fill: C.oxide, name: "mOx" });
    R(s, { x: gx0, y: YS - 0.5, w: gx1 - gx0, h: 0.42, fill: C.gate, r: 0.04, name: "mGate" });
    T(s, "gate", { x: gx0, y: YS - 0.44, w: gx1 - gx0, h: 0.3, size: 11, bold: true, color: "3D2F7A", align: "center", valign: "middle", name: "mGateL" });
  }
  if (show.labels) {
    T(s, "V_S = 0", { x: x0, y: YS - 0.42, w: 1.3, h: 0.25, size: 11, color: C.grey, name: "mVS" });
    T(s, "V_G = " + (p.vg ?? 0).toFixed(2) + " V", { x: (gx0 + gx1) / 2 - 1, y: YS - 0.82, w: 2, h: 0.26, size: 12, bold: true, color: C.purple, align: "center", name: "mVG" });
    T(s, "V_D = " + (p.vd ?? 0.7).toFixed(2) + " V", { x: x1 - 1.4, y: YS - 0.42, w: 1.4, h: 0.25, size: 11, color: C.grey, align: "right", name: "mVD" });
  }
  if (p.leak) G(s, [[gx0 - 0.1, YS + 0.75], [(gx0 + gx1) / 2, YS + 0.95], [gx1 + 0.1, YS + 0.75]], { color: C.red, w: 2.25, dash: "dash", name: "mLeak" });
  if (p.leak) T(s, "leakage path below the gate", { x: (gx0 + gx1) / 2 - 1.3, y: YS + 1.0, w: 2.6, h: 0.24, size: 10, color: C.red, align: "center", bold: true, name: "mLeakL" });
}

// ---------- energy hill along the channel ----------
function band(s, p) {
  const { gx0 = 2.1, gx1 = 4.9, x0 = 0.7, x1 = 6.3, hb = 0.8, vd = 0.7, on = 0, nE = 0 } = p;
  const Ey = (x) => {
    const S = sig((x - gx0) / 0.13) * (1 - sig((x - gx1) / 0.13));
    const ramp = (1 - on) * sig((x - gx1) / 0.12) + on * Math.min(Math.max((x - gx0) / (gx1 - gx0), 0), 1) * sig((x - gx0) / 0.1);
    const dt = p.dibl ? p.dibl * sig((x - (gx0 + gx1) / 2) / 0.25) : 0; // drain pulls the hill top down
    return ES - EV_IN * (hb * S - vd * ramp - dt * S);
  };
  const xs = range(x0, x1, 46);
  G(s, xs.map((x) => [x, Ey(x)]), { color: C.ink, w: 2.25, name: "bCurve" });
  T(s, "electron energy ↑", { x: x0, y: 4.35, w: 2, h: 0.24, size: 10, color: C.grey, name: "bLbl" });
  // source electrons + electrons crossing the hill
  for (let i = 0; i < 5; i++) E(s, { cx: x0 + 0.15 + i * 0.22, cy: ES - 0.09, rx: 0.065, fill: C.elec, name: "bes" + i });
  const pos = range(gx0 + 0.25, gx1 - 0.15, 6);
  for (let i = 0; i < 6; i++) {
    const inCh = i < nE;
    const x = inCh ? pos[i] : x0 + 0.26 + (i % 4) * 0.22;
    const y = inCh ? Ey(x) - 0.09 : ES - 0.09;
    E(s, { cx: x, cy: y, rx: 0.065, fill: C.elec, name: "bec" + i });
  }
}

function legendDev(s) {
  R(s, { x: 0.72, y: 4.12, w: 0.18, h: 0.12, fill: C.elec, name: "lg1" });
  T(s, "electron channel", { x: 0.95, y: 4.07, w: 1.6, h: 0.22, size: 9, color: C.grey, name: "lg1t" });
  R(s, { x: 2.45, y: 4.12, w: 0.18, h: 0.12, fill: C.depl, name: "lg2" });
  T(s, "depletion (no free carriers)", { x: 2.68, y: 4.07, w: 2.2, h: 0.22, size: 9, color: C.grey, name: "lg2t" });
}

// ---------- 1.1 build the MOSFET ----------
function buildMOS() {
  const steps = [
    { show: { body: 1 }, h: "Start with p-type silicon", b: "A crystal of silicon doped with boron: holes are the majority carriers. No current can flow from left to right yet.", key: "Every transistor starts as a block of lightly doped silicon." },
    { show: { body: 1, sd: 1 }, h: "Add n+ source and drain", b: "Two heavily doped n-type islands full of free electrons. Between them: p-type silicon, which blocks electrons.", key: "Source and drain are full of electrons; the p-type gap between them blocks them." },
    { show: { body: 1, sd: 1, gate: 1 }, h: "Add oxide and gate", b: "A thin insulator and a metal gate sit over the gap. The gate cannot touch the channel, it can only push on it with an electric field.", key: "The gate controls the gap through the oxide, like one plate of a capacitor." },
    { show: { body: 1, sd: 1, gate: 1, labels: 1 }, band: 1, h: "The energy hill", b: "Seen as energy, the p-type gap is a hill between source and drain. Electrons cross only if the hill is low. The gate sets the hill height.", key: "A MOSFET is an energy hill whose height is set by the gate." },
  ];
  steps.forEach((st, i) => {
    const s = slide();
    header(s, "The MOSFET – How it is built", "Side view of a planar n-channel MOSFET, built one layer at a time");
    stepDots(s, steps.length, i);
    mos(s, { show: st.show, vg: 0, vd: 0.7, depl: st.show.gate ? 0.3 : 0 });
    if (st.band) band(s, { hb: 0.8, vd: 0.7 });
    card(s, { x: 7.4, y: 1.7, w: 5.33, h: 2.6, n: i + 1, head: st.h, body: st.b, color: C.blue });
    key(s, st.key);
    notes(s, st.b);
  });
}

// ---------- 1.2 gate sweep ----------
const VT0 = 0.25, SS0 = 71;
function gateSweep() {
  const vgs = [0, 0.2, 0.3, 0.4, 0.7];
  const nEs = [0, 1, 2, 4, 6];
  const regions = [["OFF: only leakage I_off", C.red], ["SUBTHRESHOLD: current grows ×10 every 71 mV", C.orange], ["THRESHOLD CROSSED: the channel forms", C.blue], ["STRONG INVERSION: channel thickens", C.blue], ["ON: full current I_on", C.green]];
  const keys = [
    "V_G = 0: the hill is high and there is no channel. Only a tiny leakage flows.",
    "Gate up: the hill drops and current rises exponentially, still below V_T.",
    "Past V_T = 0.25 V a thin electron layer joins source and drain: the switch turns on.",
    "More gate, thicker channel; the curve bends because the channel now acts like a resistor.",
    "V_G = V_DD = 0.7 V: thick channel, low hill, the full on-current I_on.",
  ];
  vgs.forEach((vg, i) => {
    const s = slide();
    header(s, "The MOSFET – Turning the gate", "One knob, V_G: the device, the energy hill and the current change together");
    stepDots(s, vgs.length, i);
    const tch = vg < 0.15 ? 0.004 : vg < VT0 ? 0.015 : Math.min(0.04 + 0.32 * (vg - VT0), 0.2);
    const depl = 0.22 + 0.32 * Math.min(vg, VT0) / VT0;
    mos(s, { vg, vd: 0.7, tch, depl, show: { body: 1, sd: 1, gate: 1, labels: 1 } });
    legendDev(s);
    band(s, { hb: Math.max(0.07, 0.8 - 1.05 * vg), vd: 0.7, on: Math.min(Math.max((vg - 0.2) / 0.5, 0), 1), nE: nEs[i] });
    // I-V plot
    const box = { x: 8.0, y: 1.75, w: 4.6, h: 2.55 };
    const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [1e-11, 1e-4], ylog: true, xt: [0, 0.2, 0.4, 0.6], yt: [1e-10, 1e-8, 1e-6, 1e-4], yf: fmtTick, xl: "gate voltage V_G (V)", yl: "I_D  (log: each line = 100×)" });
    const xs = range(0, 0.7, 36);
    G(s, xs.map((v) => [mx(v), my(ekv(v, VT0, SS0))]), { color: "C9CCD3", w: 2, name: "ivGhost" });
    const xs2 = range(0, Math.max(vg, 0.001), 36);
    G(s, xs2.map((v) => [mx(v), my(ekv(v, VT0, SS0))]), { color: C.blue, w: 3, name: "ivTrail" });
    L(s, mx(VT0), box.y, mx(VT0), box.y + box.h, { color: C.mute, w: 0.75, dash: "dash", name: "ivVT" });
    T(s, "V_T", { x: mx(VT0) - 0.3, y: box.y - 0.05, w: 0.6, h: 0.2, size: 9, color: C.mute, align: "center", name: "ivVTl" });
    const id = ekv(vg, VT0, SS0);
    E(s, { cx: mx(vg), cy: my(id), rx: 0.09, fill: regions[i][1], line: C.white, lw: 1.5, name: "ivPt" });
    T(s, fmtI(id), { x: mx(vg) - 0.95, y: my(id) - 0.36, w: 0.9, h: 0.24, size: 11, bold: true, color: regions[i][1], align: "right", name: "ivPtL" });
    T(s, "V_G = " + vg.toFixed(2) + " V     I_D = " + fmtI(id), { x: 7.5, y: 4.95, w: 5.2, h: 0.28, size: 14, bold: true, name: "ivRead" });
    T(s, regions[i][0], { x: 7.5, y: 5.22, w: 5.2, h: 0.24, size: 11, bold: true, color: regions[i][1], name: "ivReg" });
    knob(s, { x: 7.7, y: 5.92, w: 4.9, label: "KNOB: gate voltage V_G", ticks: [0, 0.2, 0.4, 0.6, 0.7], val: vg, fmt: (v) => v.toFixed(1), min: 0, max: 0.7, unit: " V", color: C.purple });
    key(s, keys[i]);
    notes(s, "Left: the transistor and its energy hill. Right: the I_D–V_G curve on a log scale. All three move together as the gate voltage is raised. Model curve: EKV, V_T = 0.25 V, SS = 71 mV/dec, V_D = 0.7 V.");
  });
}

// ---------- 1.3 reading the switch ----------
function readSwitch() {
  const steps = 3;
  for (let k = 0; k < steps; k++) {
    const s = slide();
    header(s, "The MOSFET – Reading the switch", "From the I_D–V_G curve we read the numbers that the rest of the project tracks");
    stepDots(s, steps, k);
    const box = { x: 1.4, y: 1.75, w: 5.2, h: 3.8 };
    const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [1e-11, 1e-4], ylog: true, xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], yt: [1e-10, 1e-8, 1e-6, 1e-4], yf: fmtTick, xl: "gate voltage V_G (V)", yl: "I_D (log)" });
    const xs = range(0, 0.7, 40);
    G(s, xs.map((v) => [mx(v), my(ekv(v, VT0, SS0))]), { color: C.blue, w: 3, name: "rsHi" });
    T(s, "V_D = 0.7 V", { x: mx(0.36), y: my(ekv(0.36, VT0, SS0)) - 0.42, w: 1.2, h: 0.22, size: 10, bold: true, color: C.blue, name: "rsHiL" });
    if (k >= 2) {
      G(s, xs.map((v) => [mx(v), my(ekv(v, VT0 + 0.06, SS0) * 0.35)]), { color: C.teal, w: 2.25, dash: "dash", name: "rsLo" });
      T(s, "V_D = 0.05 V", { x: mx(0.52), y: my(ekv(0.5, VT0 + 0.06, SS0) * 0.35) + 0.08, w: 1.2, h: 0.22, size: 10, bold: true, color: C.teal, name: "rsLoL" });
      const i0 = 1e-8; // DIBL shift at constant current
      const v1 = 0.0975, v2 = 0.0975 + 0.06 + 0.035;
      L(s, mx(v1), my(i0), mx(v2), my(i0), { color: C.purple, w: 2, arrow: true, arrow2: true, name: "rsDibl" });
      T(s, "DIBL = shift ÷ ΔV_D", { x: mx(v2) + 0.08, y: my(i0) - 0.12, w: 1.8, h: 0.24, size: 10, bold: true, color: C.purple, name: "rsDiblL" });
    }
    // Ion / Ioff markers
    E(s, { cx: mx(0), cy: my(ekv(0, VT0, SS0)), rx: 0.09, fill: C.red, name: "rsOff" });
    T(s, "I_off", { x: mx(0) + 0.14, y: my(ekv(0, VT0, SS0)) - 0.02, w: 0.8, h: 0.24, size: 11, bold: true, color: C.red, name: "rsOffL" });
    E(s, { cx: mx(0.7), cy: my(ekv(0.7, VT0, SS0)), rx: 0.09, fill: C.green, name: "rsOn" });
    T(s, "I_on", { x: mx(0.7) - 0.7, y: my(ekv(0.7, VT0, SS0)) + 0.06, w: 0.6, h: 0.24, size: 11, bold: true, color: C.green, align: "right", name: "rsOnL" });
    if (k >= 1) {
      E(s, { cx: mx(VT0), cy: my(ekv(VT0, VT0, SS0)), rx: 0.09, fill: C.blue, name: "rsVT" });
      T(s, "V_T", { x: mx(VT0) + 0.12, y: my(ekv(VT0, VT0, SS0)) - 0.02, w: 0.6, h: 0.24, size: 11, bold: true, color: C.blue, name: "rsVTL" });
      const a = 0.08, b = a + 0.071;
      G(s, [[mx(a), my(ekv(a, VT0, SS0))], [mx(b), my(ekv(a, VT0, SS0))], [mx(b), my(ekv(b, VT0, SS0))]], { color: C.orange, w: 2, name: "rsSS" });
      T(s, "SS: mV per ×10", { x: mx(b) + 0.08, y: my(ekv(a, VT0, SS0)) - 0.02, w: 1.6, h: 0.24, size: 10, bold: true, color: C.orange, name: "rsSSL" });
    }
    const rows = [
      ["I_on", "current when on: speed", "large", C.green, 0],
      ["I_off", "leakage when off: standby power", "small", C.red, 0],
      ["V_T", "gate voltage where it turns on", "set by design", C.blue, 1],
      ["SS", "mV of V_G for 10× current", "→ 60 mV/dec", C.orange, 1],
      ["DIBL", "how much the drain moves V_T", "small", C.purple, 2],
    ];
    T(s, "Metric", { x: 7.5, y: 1.7, w: 1.2, h: 0.25, size: 11, color: C.grey, name: "rsH1" });
    T(s, "What it tells", { x: 8.7, y: 1.7, w: 2.6, h: 0.25, size: 11, color: C.grey, name: "rsH2" });
    T(s, "Good is", { x: 11.4, y: 1.7, w: 1.3, h: 0.25, size: 11, color: C.grey, name: "rsH3" });
    rows.forEach(([m, t, g, col, st], i) => {
      const on = k >= st, y = 2.05 + i * 0.72;
      R(s, { x: 7.4, y, w: 5.33, h: 0.6, fill: on ? C.panel : "FAFAFB", r: 0.06, name: "rsR" + i });
      T(s, m, { x: 7.55, y: y + 0.13, w: 1.1, h: 0.34, size: 16, bold: true, color: on ? col : "C9CCD3", name: "rsM" + i, valign: "middle" });
      T(s, t, { x: 8.7, y: y + 0.13, w: 2.65, h: 0.34, size: 12, color: on ? C.ink : "C9CCD3", name: "rsT" + i, valign: "middle" });
      T(s, g, { x: 11.4, y: y + 0.13, w: 1.25, h: 0.34, size: 12, bold: true, color: on ? C.ink : "C9CCD3", name: "rsG" + i, valign: "middle" });
    });
    key(s, ["Two currents first: I_on (speed) and I_off (leakage). Their ratio is the switch quality.", "Then two voltages: V_T says where the switch turns on, SS how sharply.", "DIBL compares two drain voltages: it shows if the drain is stealing control from the gate."][k]);
    notes(s, "Every later result in the project is one of these five numbers, plus the temperature rise.");
  }
}

// ---------- 1.4 V_T in depth (band diagram) ----------
function vtDepth() {
  const steps = [
    { vg: -0.47, psi: 0, h: "Term 1: flat-band voltage V_FB", b: "Gate metal and silicon have different work functions: φm = 4.50 eV, φs = 4.97 eV.\nV_FB = φm − φs = −0.47 V keeps the bands flat.\nHigher φm → higher V_T, one to one.", term: 0, col: C.blue, key: "V_FB is set by the gate metal: it is the gate voltage that keeps the bands flat." },
    { vg: 0.0, psi: 0.35, h: "Raise V_G: the bands bend", b: "A positive gate pulls the bands down at the surface.\nHoles are pushed away: a depletion layer (pink) of fixed negative ions grows.", term: -1, col: C.grey, key: "Raising V_G bends the bands; the surface loses its holes." },
    { vg: 0.25, psi: 0.71, h: "Term 2: invert the surface, 2φF", b: "φF = (kT/q)·ln(N_A/n_i) = 0.357 V for N_A = 10¹⁶ cm⁻³.\nBend by 2φF = 0.71 V: the surface is as n-type as the body is p-type.\nElectrons fill the surface: threshold.", term: 1, col: C.orange, key: "At 2φF of band bending electrons gather at the surface: that is threshold." },
    { vg: 0.25, psi: 0.71, q: 1, h: "Term 3: charge on the capacitor", b: "The depletion layer holds negative ions; the gate must hold the same + charge.\nV_ox = Q_dep / C_ox: planar 11 mV, our GAA wire only 0.1 mV (tiny body).", term: 2, col: C.purple, key: "Gate and silicon form a capacitor; holding the depletion charge costs Q_dep/C_ox." },
    { vg: 0.25, psi: 0.71, q: 1, h: "Add them up", b: "V_T = −0.47 + 0.71 + 0.011 = 0.26 V (long-channel estimate).\nAtlas, our GAAFET: 0.204–0.209 V.\nShort-channel effects (DIBL) pull it a little lower.", term: 3, col: C.green, key: "Long-channel estimate 0.26 V vs Atlas 0.20 V: the physics checks out." },
  ];
  const yEF = 3.95, xM0 = 0.8, xM1 = 2.2, xO1 = 2.6, xS1 = 7.0, k = 1.05;
  steps.forEach((st, i) => {
    const s = slide();
    header(s, "The MOSFET – What sets V_T", "Energy bands from the gate (left) through the oxide into the p-type silicon (right)");
    stepDots(s, steps.length, i);
    R(s, { x: xM0, y: 1.75, w: xM1 - xM0, h: 3.6, fill: C.gate, ft: 40, name: "vbM" });
    R(s, { x: xM1, y: 1.75, w: xO1 - xM1, h: 3.6, fill: C.oxide, name: "vbO" });
    const wd = 0.45 + 0.9 * Math.sqrt(st.psi / 0.71 || 0);
    if (st.psi > 0) R(s, { x: xO1, y: 1.75, w: wd, h: 3.6, fill: C.depl, ft: 30, name: "vbD" });
    T(s, "gate metal", { x: xM0, y: 5.4, w: xM1 - xM0, h: 0.24, size: 10, color: C.grey, align: "center", name: "vbML" });
    T(s, "oxide", { x: xM1 - 0.1, y: 5.4, w: 0.6, h: 0.24, size: 10, color: C.grey, align: "center", name: "vbOL" });
    T(s, "p-type silicon", { x: 4.8, y: 5.4, w: 2.2, h: 0.24, size: 10, color: "8A6D1F", align: "center", name: "vbSL" });
    const bend = (x) => st.psi * Math.exp(-Math.max(x - xO1, 0) / (wd * 0.45));
    const xs = range(xO1, xS1, 30);
    const lines = [["E_C", -0.36 - 0.56, C.ink], ["E_i", -0.36, C.mute], ["E_V", -0.36 + 0.56, C.ink]];
    lines.forEach(([lab, off, col], j) => {
      G(s, xs.map((x) => [x, yEF + (off + bend(x)) * k]), { color: col, w: j === 1 ? 1.25 : 2.25, dash: j === 1 ? "dash" : undefined, name: "vbL" + j });
      T(s, lab, { x: xS1 + 0.05, y: yEF + off * k - 0.12, w: 0.5, h: 0.24, size: 11, color: col, name: "vbLl" + j });
    });
    L(s, xO1, yEF, xS1, yEF, { color: C.red, w: 1.5, name: "vbEF" });
    T(s, "E_F", { x: xS1 + 0.05, y: yEF - 0.12, w: 0.5, h: 0.24, size: 11, color: C.red, name: "vbEFl" });
    const yM = yEF + st.vg * k;
    L(s, xM0, yM, xM1, yM, { color: C.red, w: 2, name: "vbEFm" });
    T(s, "E_F (metal)", { x: xM0, y: yM - 0.3, w: 1.4, h: 0.24, size: 10, color: C.red, align: "center", name: "vbEFml" });
    if (st.psi >= 0.7) for (let e = 0; e < 4; e++) E(s, { cx: xO1 + 0.1 + e * 0.13, cy: yEF + (-0.92 + bend(xO1 + 0.1 + e * 0.13)) * k + 0.07, rx: 0.05, fill: C.elec, name: "vbE" + e });
    if (st.q) {
      for (let e = 0; e < 4; e++) T(s, "+", { x: xM1 - 0.3, y: 2.2 + e * 0.7, w: 0.25, h: 0.3, size: 16, bold: true, color: C.red, align: "center", name: "vbQp" + e });
      for (let e = 0; e < 4; e++) T(s, "−", { x: xO1 + 0.25 + (e % 2) * 0.45, y: 2.3 + e * 0.7, w: 0.25, h: 0.3, size: 16, bold: true, color: C.navy, align: "center", name: "vbQn" + e });
    }
    T(s, "V_G = " + st.vg.toFixed(2) + " V", { x: xM0, y: 1.42, w: 1.6, h: 0.26, size: 12, bold: true, color: C.purple, name: "vbVG" });
    T(s, "band bending ψs = " + st.psi.toFixed(2) + " V", { x: 4.2, y: 1.42, w: 2.8, h: 0.26, size: 12, bold: true, color: C.grey, align: "right", name: "vbPsi" });
    // explanation card
    card(s, { x: 7.75, y: 1.7, w: 4.98, h: 2.85, n: i + 1, head: st.h, body: st.b, color: st.col });
    // the equation, active term highlighted
    const terms = [["V_FB", C.blue], ["2φF", C.orange], ["Q_dep / C_ox", C.purple]];
    T(s, "V_T  =", { x: 7.75, y: 4.95, w: 1.0, h: 0.5, size: 18, bold: true, valign: "middle", name: "vbEq" });
    let x = 8.75;
    terms.forEach(([t, col], j) => {
      const on = st.term === j || st.term === 3, wv = j === 2 ? 1.6 : 1.0;
      R(s, { x, y: 4.95, w: wv, h: 0.5, fill: on ? col : C.panel, r: 0.08, name: "vbT" + j });
      T(s, t, { x, y: 4.95, w: wv, h: 0.5, size: 14, bold: true, color: on ? C.white : C.grey, align: "center", valign: "middle", name: "vbTt" + j });
      x += wv;
      if (j < 2) { T(s, "+", { x, y: 4.95, w: 0.3, h: 0.5, size: 16, bold: true, align: "center", valign: "middle", name: "vbPl" + j }); x += 0.3; }
    });
    key(s, st.key);
    notes(s, st.b.replace(/\n/g, " "));
  });
}

function whatMovesVT() {
  const s = slide();
  header(s, "The MOSFET – What moves V_T", "Five knobs in our project, which way each one pushes V_T, and by how much");
  const tiles = [
    ["Gate work function φm", "▲", C.green, "+0.03 eV → V_T +30 mV", "Atlas: 0.204 → 0.233 V. Our stage-3 knob."],
    ["Channel doping N_A", "▲", C.green, "more doping → higher V_T", "Our wire is light: 10¹⁶ cm⁻³."],
    ["Temperature (self-heating)", "▼", C.red, "≈ −1.6 mV/K (planar estimate)", "300 → 343.6 K: V_T falls, I_off rises."],
    ["Drain voltage (DIBL)", "▼", C.red, "−38 mV per V of V_D", "Reproduced wire, from Atlas."],
    ["Wire radius r", "▼", C.red, "thicker wire → weaker grip", "r 4 → 5.64 nm: DIBL 17 → 38 mV/V."],
  ];
  tiles.forEach(([h, arr, col, v, b], i) => {
    const x = 0.6 + (i % 3) * 4.1, y = 1.65 + Math.floor(i / 3) * 2.15;
    R(s, { x, y, w: 3.85, h: 1.95, fill: C.panel, r: 0.08 });
    E(s, { cx: x + 0.45, cy: y + 0.45, rx: 0.24, fill: col });
    T(s, arr, { x: x + 0.21, y: y + 0.21, w: 0.48, h: 0.48, size: 14, color: C.white, align: "center", valign: "middle" });
    T(s, "V_T", { x: x + 0.78, y: y + 0.28, w: 0.6, h: 0.34, size: 15, bold: true, color: col, valign: "middle" });
    T(s, h, { x: x + 1.3, y: y + 0.28, w: 2.45, h: 0.34, size: 14, bold: true, valign: "middle" });
    T(s, v, { x: x + 0.3, y: y + 0.88, w: 3.4, h: 0.32, size: 13, bold: true, color: C.ink });
    T(s, b, { x: x + 0.3, y: y + 1.22, w: 3.4, h: 0.6, size: 12, color: C.grey });
  });
  R(s, { x: 8.8, y: 3.8, w: 3.93, h: 1.95, fill: C.ink, r: 0.08 });
  T(s, "For our project", { x: 9.1, y: 4.0, w: 3.4, h: 0.32, size: 14, bold: true, color: C.white });
  T(s, "Stage 3 raises φm a little (+30 mV V_T) to cut I_off and power P, so less heat. A cooler channel then keeps V_T stable.", { x: 9.1, y: 4.38, w: 3.4, h: 1.25, size: 12, color: "D9DBE0" });
  key(s, "Work function is our V_T knob; heat and DIBL pull V_T down and raise leakage.");
  notes(s, "These are the knobs that move threshold in this project. Work function and doping raise it; temperature, drain voltage and a thicker wire lower it.");
}

// ---------- 1.5 SS: the 60 mV/dec limit ----------
function ssProof() {
  const steps = [
    ["Barrier rule", "I_D ∝ exp(qψs / kT): the current depends only on the hill height ψs.", C.blue],
    ["10× current needs 59.5 mV", "Δψs = (kT/q)·ln10 = 25.85 mV × 2.303 = 59.5 mV at 300 K.", C.orange],
    ["The gate moves ψs through a divider", "Only the part C_ox / (C_ox + C_dep) of ΔV_G reaches ψs.", C.purple],
    ["So SS ≥ 60 mV/dec", "SS = 59.5 mV × (1 + C_dep/C_ox) = m × 59.5.  m ≥ 1, so SS ≥ 59.5 mV/dec.\nOurs: standard 61.3 → m = 1.03 · reproduced 65.4 → m = 1.10.", C.green],
  ];
  steps.forEach((_, k) => {
    const s = slide();
    header(s, "The MOSFET – Why SS can never beat 60 mV/dec", "Two facts give the limit: the barrier rule and a capacitor divider");
    stepDots(s, steps.length, k);
    // divider diagram
    const cx = 2.6;
    R(s, { x: cx - 1.1, y: 1.7, w: 2.2, h: 0.45, fill: C.gate, r: 0.05, name: "spG" });
    T(s, "gate  V_G", { x: cx - 1.1, y: 1.7, w: 2.2, h: 0.45, size: 13, bold: true, color: "3D2F7A", align: "center", valign: "middle", name: "spGl" });
    L(s, cx, 2.15, cx, 2.55, { color: C.ink, w: 2, name: "spW1" });
    L(s, cx - 0.6, 2.55, cx + 0.6, 2.55, { color: C.ink, w: 3, name: "spC1a" });
    L(s, cx - 0.6, 2.72, cx + 0.6, 2.72, { color: C.ink, w: 3, name: "spC1b" });
    T(s, "C_ox (gate oxide)", { x: cx + 0.75, y: 2.5, w: 2, h: 0.28, size: 12, color: C.grey, name: "spC1l" });
    L(s, cx, 2.72, cx, 3.95, { color: C.ink, w: 2, name: "spW2" });
    E(s, { cx, cy: 3.25, rx: 0.12, fill: k >= 2 ? C.purple : C.blue, name: "spN" });
    T(s, "ψs  (hill height)", { x: cx + 0.25, y: 3.12, w: 2.2, h: 0.28, size: 12, bold: true, color: k >= 2 ? C.purple : C.blue, name: "spNl" });
    L(s, cx - 0.6, 3.95, cx + 0.6, 3.95, { color: C.ink, w: 3, name: "spC2a" });
    L(s, cx - 0.6, 4.12, cx + 0.6, 4.12, { color: C.ink, w: 3, name: "spC2b" });
    T(s, "C_dep (depleted body)", { x: cx + 0.75, y: 3.9, w: 2.2, h: 0.28, size: 12, color: C.grey, name: "spC2l" });
    L(s, cx, 4.12, cx, 4.5, { color: C.ink, w: 2, name: "spW3" });
    R(s, { x: cx - 1.1, y: 4.5, w: 2.2, h: 0.4, fill: C.body, r: 0.05, name: "spB" });
    T(s, "body / source", { x: cx - 1.1, y: 4.5, w: 2.2, h: 0.4, size: 12, color: "8A6D1F", align: "center", valign: "middle", name: "spBl" });
    if (k >= 2) T(s, "Δψs = ΔV_G · C_ox / (C_ox + C_dep)", { x: 0.7, y: 5.2, w: 4.6, h: 0.32, size: 13, bold: true, color: C.purple, align: "center", name: "spDiv" });
    // cards
    for (let j = 0; j <= k; j++) {
      const [h, b, col] = steps[j];
      const y = 1.65 + j * 1.12;
      R(s, { x: 6.2, y, w: 6.53, h: j === 3 ? 1.3 : 0.98, fill: C.panel, r: 0.06, name: "spK" + j });
      E(s, { cx: 6.58, cy: y + 0.38, rx: 0.19, fill: col, name: "spKn" + j });
      T(s, String(j + 1), { x: 6.39, y: y + 0.19, w: 0.38, h: 0.38, size: 12, bold: true, color: C.white, align: "center", valign: "middle", name: "spKnt" + j });
      T(s, h, { x: 6.95, y: y + 0.15, w: 5.6, h: 0.32, size: 15, bold: true, color: col, name: "spKh" + j });
      T(s, b, { x: 6.95, y: y + 0.48, w: 5.65, h: j === 3 ? 0.8 : 0.45, size: 12, color: C.grey, name: "spKb" + j });
    }
    key(s, ["Current depends only on the hill height ψs.", "10× current needs the hill to drop by 59.5 mV.", "But the gate does not move ψs one-for-one: it shares its voltage with C_dep.", "SS = m × 59.5 mV/dec, m = 1 + C_dep/C_ox ≥ 1: a better gate makes m closer to 1."][k]);
    notes(s, "Proof in four steps. Gate-all-around brings m close to 1, which is why our devices are near 60 mV/dec.");
  });
}

function ssTemp() {
  const Ts = [300, 343.6, 400];
  Ts.forEach((Tk, k) => {
    const s = slide();
    header(s, "The MOSFET – SS and temperature", "kT/q grows with temperature, so the 60 mV/dec limit grows too");
    stepDots(s, Ts.length, k);
    const box = { x: 1.3, y: 1.8, w: 5.6, h: 3.4 };
    const { mx, my } = axes(s, box, { xr: [250, 450], yr: [40, 100], xt: [250, 300, 350, 400, 450], yt: [40, 60, 80, 100], xl: "channel temperature T (K)", yl: "SS limit (mV/dec)" });
    G(s, [[mx(250), my(0.1984 * 250)], [mx(450), my(0.1984 * 450)]], { color: C.blue, w: 2.5, name: "stLine" });
    const ss = 0.1984 * Tk;
    L(s, mx(Tk), my(40), mx(Tk), my(ss), { color: C.mute, w: 0.75, dash: "dash", name: "stV" });
    L(s, mx(250), my(ss), mx(Tk), my(ss), { color: C.mute, w: 0.75, dash: "dash", name: "stH" });
    E(s, { cx: mx(Tk), cy: my(ss), rx: 0.1, fill: k === 0 ? C.blue : k === 1 ? C.orange : C.red, line: C.white, lw: 1.5, name: "stPt" });
    T(s, ss.toFixed(1) + " mV/dec", { x: mx(Tk) - 1.5, y: my(ss) - 0.4, w: 1.4, h: 0.26, size: 12, bold: true, color: k === 0 ? C.blue : k === 1 ? C.orange : C.red, align: "right", name: "stPtL" });
    T(s, "SS_min = (kT/q)·ln10 = 0.1984 mV/dec per kelvin", { x: 7.6, y: 1.75, w: 5.1, h: 0.3, size: 14, bold: true, name: "stEq" });
    chips(s, [
      { k: "temperature T", v: Tk.toFixed(1) + " K", d: k ? 1 : 0, good: false },
      { k: "SS limit", v: ss.toFixed(1), d: k ? 1 : 0, good: false },
      { k: "leakage I_off", v: ["base", "higher", "highest"][k], d: k ? 1 : 0, good: false },
    ], { x: 7.6, y: 2.3, w: 1.6, h: 0.8 });
    const txt = ["300 K, room temperature: the limit is 59.5 mV/dec.", "343.6 K is the peak of our reproduced GAAFET: the limit is already 68.2 mV/dec.", "At 400 K the limit is 79.4 mV/dec: a hot channel switches much more softly."][k];
    T(s, txt, { x: 7.6, y: 3.4, w: 5.1, h: 0.8, size: 14, color: C.grey, name: "stTxt" });
    knob(s, { x: 7.8, y: 5.3, w: 4.7, label: "KNOB: channel temperature T", ticks: [300, 350, 400], val: Tk, min: 280, max: 420, fmt: (v) => Math.round(v * 10) / 10, unit: " K", color: C.orange });
    key(s, "A self-heated channel switches more softly: heat raises SS and leakage.");
    notes(s, "SS limit = (k T / q) ln 10, which rises 0.1984 mV/dec per kelvin. This links the electrical story to the heat story later.");
  });
}

// ---------- 1.6 drain sweep ----------
function drainSweep() {
  const vds = [0.05, 0.15, 0.3, 0.45, 0.7];
  const k = 290e-6, vov = 0.45;
  const idf = (vd) => k * (vd < vov ? vov * vd - vd * vd / 2 : vov * vov / 2) * (1 + 0.03 * vd);
  const reg = [["LINEAR: the channel is a resistor", C.blue], ["LINEAR: I_D rises almost in a straight line", C.blue], ["BENDING: channel thins at the drain end", C.orange], ["PINCH-OFF: V_D = V_G − V_T", C.red], ["SATURATION: I_D ≈ constant = I_on", C.green]];
  const keys = ["Tiny V_D: the channel is even from source to drain; I_D grows with V_D like a resistor.", "More V_D: more current; the channel starts to thin near the drain.", "The drain end of the channel gets thinner, so each extra volt adds less current.", "At V_D = V_G − V_T the channel thins to zero at the drain end: pinch-off.", "Beyond pinch-off I_D stays flat: I_on is read here, and so is every heat number in this project."];
  vds.forEach((vd, i) => {
    const s = slide();
    header(s, "The MOSFET – Turning the drain", "Gate fixed at 0.7 V; now the second knob, V_D, goes up step by step");
    stepDots(s, vds.length, i);
    const t0 = 0.2, tD = vd < vov ? t0 * Math.sqrt(1 - vd / vov) : 0.004;
    const xe = vd <= vov ? 4.9 : 4.9 - 0.5 * (vd - vov) / 0.25;
    mos(s, { vg: 0.7, vd, tch: t0, tchD: tD, xe, depl: 0.54, show: { body: 1, sd: 1, gate: 1, labels: 1 } });
    legendDev(s);
    if (vd >= vov) T(s, "pinch-off point", { x: xe - 0.8, y: YS + 0.62, w: 1.6, h: 0.24, size: 10, bold: true, color: C.red, align: "center", name: "dsPinch" });
    band(s, { hb: 0.07, vd, on: 1, nE: 6 });
    const box = { x: 8.0, y: 1.75, w: 4.6, h: 2.55 };
    const { mx, my } = axes(s, box, { xr: [0, 0.7], yr: [0, 35e-6], xt: [0, 0.2, 0.4, 0.6], yt: [0, 10e-6, 20e-6, 30e-6], yf: (v) => (v * 1e6).toFixed(0) + " µA", xl: "drain voltage V_D (V)", yl: "I_D (linear)" });
    const xs = range(0, 0.7, 36);
    G(s, xs.map((v) => [mx(v), my(idf(v))]), { color: "C9CCD3", w: 2, name: "ivGhost" });
    G(s, range(0, vd, 36).map((v) => [mx(v), my(idf(v))]), { color: C.blue, w: 3, name: "ivTrail" });
    L(s, mx(vov), box.y, mx(vov), box.y + box.h, { color: C.red, w: 0.75, dash: "dash", name: "ivVT" });
    T(s, "pinch-off", { x: mx(vov) + 0.04, y: box.y + box.h - 0.26, w: 1.0, h: 0.2, size: 9, color: C.red, align: "left", name: "ivVTl" });
    const id = idf(vd);
    E(s, { cx: mx(vd), cy: my(id), rx: 0.09, fill: reg[i][1], line: C.white, lw: 1.5, name: "ivPt" });
    T(s, fmtI(id), { x: mx(vd) - 0.95, y: my(id) - 0.36, w: 0.9, h: 0.24, size: 11, bold: true, color: reg[i][1], align: "right", name: "ivPtL" });
    T(s, "V_D = " + vd.toFixed(2) + " V     I_D = " + fmtI(id), { x: 7.5, y: 4.95, w: 5.2, h: 0.28, size: 14, bold: true, name: "ivRead" });
    T(s, reg[i][0], { x: 7.5, y: 5.22, w: 5.2, h: 0.24, size: 11, bold: true, color: reg[i][1], name: "ivReg" });
    knob(s, { x: 7.7, y: 5.92, w: 4.9, label: "KNOB: drain voltage V_D", ticks: [0, 0.2, 0.4, 0.6, 0.7], val: vd, fmt: (v) => v.toFixed(1), min: 0, max: 0.7, unit: " V", color: C.teal });
    key(s, keys[i]);
    notes(s, "Square-law model with V_G − V_T = 0.45 V and a small channel-length modulation, scaled to I_on = 30 µA at V_D = 0.7 V.");
  });
}

function chapter1() {
  section("1 · The MOSFET switch");
  notes(contents(0), "Chapter 1: how the planar MOSFET works and which numbers describe it.");
  buildMOS();
  gateSweep();
  readSwitch();
  vtDepth();
  whatMovesVT();
  ssProof();
  ssTemp();
  drainSweep();
}

module.exports = { chapter1, mos, band, legendDev, sig };
