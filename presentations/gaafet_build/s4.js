// Chapter 4: the new problem, heat
const { cell, C, section, slide, T, R, E, L, G, header, key, notes, stepDots, card, knob, chips, axes, range, pres } = require("./lib");
const { contents } = require("./s0");
const D = require("./data");

function kappa() {
  const s = slide();
  header(s, "The new problem – The oxide traps the heat", "Thermal conductivity κ of every material around our channel (W/m·K, log scale)");
  const P = require("./lib").pres;
  s.addChart(P.charts.BAR, [{ name: "κ", labels: ["Si substrate", "Si channel", "Si₃N₄ spacer", "HfO₂", "SiO₂"], values: [148, 22, 18, 2.3, 1.4] }], {
    x: 0.6, y: 1.6, w: 7.2, h: 4.5, barDir: "col", chartColors: [C.teal, C.teal, C.grey, C.red, C.red], valAxisLogScaleBase: 10, valAxisMinVal: 1, valAxisMaxVal: 1000,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontFace: "+mn-lt", dataLabelFontSize: 12, dataLabelColor: C.ink, dataLabelFormatCode: "0.0",
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", catAxisLabelColor: C.grey, valAxisLabelColor: C.grey, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    valGridLine: { color: "EDEEF0", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 60,
  });
  R(s, { x: 8.3, y: 1.7, w: 4.43, h: 1.55, fill: C.panel, r: 0.08 });
  T(s, "10–100×", { x: 8.55, y: 1.85, w: 4, h: 0.65, size: 34, bold: true, color: C.red });
  T(s, "worse heat conduction in the oxides that wrap the GAA channel", { x: 8.55, y: 2.5, w: 4, h: 0.6, size: 12, color: C.grey });
  R(s, { x: 8.3, y: 3.45, w: 4.43, h: 1.25, fill: C.panel, r: 0.08 });
  T(s, "Joule heat  P = I_D · V_DS", { x: 8.55, y: 3.6, w: 4, h: 0.4, size: 18, bold: true, color: C.orange });
  T(s, "every working transistor turns its power into heat", { x: 8.55, y: 4.05, w: 4, h: 0.5, size: 12, color: C.grey });
  R(s, { x: 8.3, y: 4.9, w: 4.43, h: 1.2, fill: C.ink, r: 0.08 });
  T(s, "The gate oxide is what gives GAA its control. It is also what keeps the heat in.", { x: 8.55, y: 5.0, w: 4, h: 1.0, size: 13, color: C.white, valign: "middle" });
  key(s, "Better gate control comes with a worse heat path.");
  notes(s, "Current through the channel makes Joule heat. In GAA the channel is surrounded by SiO2 and HfO2, which conduct heat ten to a hundred times worse than silicon, so the heat has no easy way out.");
}

function ohm() {
  const s = slide();
  header(s, "The new problem – Ohm's law for heat", "Heat flows like current through a chain of thermal resistances");
  const y = 2.9;
  E(s, { cx: 1.4, cy: y, rx: 0.55, fill: C.heat3 });
  T(s, "P", { x: 0.85, y: y - 0.3, w: 1.1, h: 0.6, size: 24, bold: true, color: C.white, align: "center", valign: "middle" });
  T(s, "heat source\n(channel)", { x: 0.6, y: y + 0.65, w: 1.6, h: 0.5, size: 11, color: C.grey, align: "center" });
  const rs = [["R_oxide", "SiO2 + HfO2", C.red], ["R_gate", "metal shell", C.purple], ["R_contact", "contacts, wires", C.grey]];
  rs.forEach(([n, d, col], i) => {
    const x = 2.3 + i * 1.75;
    L(s, x - 0.35, y, x, y, { color: C.ink, w: 2 });
    G(s, range(0, 1, 9).map((t, j) => [x + t * 1.2, y + (j === 0 || j === 8 ? 0 : j % 2 ? -0.2 : 0.2)]), { color: col, w: 2.5 });
    T(s, n, { x: x - 0.2, y: y - 0.65, w: 1.6, h: 0.3, size: 14, bold: true, color: col, align: "center" });
    T(s, d, { x: x - 0.2, y: y + 0.3, w: 1.6, h: 0.3, size: 11, color: C.grey, align: "center" });
  });
  L(s, 7.15, y, 7.5, y, { color: C.ink, w: 2 });
  R(s, { x: 7.5, y: y - 0.45, w: 0.9, h: 0.9, fill: C.blue, r: 0.06 });
  T(s, "300 K", { x: 7.5, y: y - 0.45, w: 0.9, h: 0.9, size: 13, bold: true, color: C.white, align: "center", valign: "middle" });
  T(s, "heat sink", { x: 7.3, y: y + 0.5, w: 1.3, h: 0.3, size: 11, color: C.grey, align: "center" });
  const tbl = [[cell("Electrical", { bold: true, color: C.white, fill: { color: C.ink } }), cell("Thermal", { bold: true, color: C.white, fill: { color: C.ink } })]];
  [["voltage V", "temperature rise ΔT (K)"], ["current I", "power P (W)"], ["resistance R", "thermal resistance R_th (K/W)"], ["V = I · R", "ΔT = P · R_th"]].forEach((r) => tbl.push(r.map((c) => cell(c, { fill: { color: C.panel } }))));
  s.addTable(tbl, { x: 0.8, y: 4.2, w: 7.6, colW: [3.0, 4.6], fontFace: "Segoe UI", fontSize: 13, color: C.ink, border: { type: "solid", color: C.white, pt: 1.5 }, rowH: 0.36 });
  R(s, { x: 9.0, y: 1.7, w: 3.73, h: 4.3, fill: C.panel, r: 0.08 });
  T(s, "Base paper target", { x: 9.25, y: 1.9, w: 3.3, h: 0.3, size: 13, bold: true, color: C.grey });
  T(s, "64.8 K", { x: 9.25, y: 2.3, w: 3.3, h: 0.7, size: 36, bold: true, color: C.orange });
  T(s, "at 30 µW", { x: 9.25, y: 3.0, w: 3.3, h: 0.3, size: 14, color: C.grey });
  T(s, "R_th = 2.16 × 10⁶ K/W", { x: 9.25, y: 3.6, w: 3.3, h: 0.4, size: 18, bold: true });
  T(s, "Our job: build a device with the same R_th, then lower it.", { x: 9.25, y: 4.2, w: 3.3, h: 1.2, size: 13, color: C.grey });
  key(s, "ΔT = R_th · P: lower R_th or lower P to run cooler.");
  notes(s, "Heat flow behaves like current in a resistor network. The temperature rise equals thermal resistance times power. Each low-conductivity layer adds resistance.");
}

// side view of the running GAA wire with a hot spot
function hotScene(s, { dT = 0, arrows = 0, trap = 0, exit = 0, vg = 0.7 }) {
  const y0 = 3.15, y1 = 3.65; // wire
  R(s, { x: 0.7, y: 2.2, w: 1.6, h: 2.4, fill: C.nplus, r: 0.04, name: "hsS" });
  R(s, { x: 4.8, y: 2.2, w: 1.6, h: 2.4, fill: C.nplus, r: 0.04, name: "hsD" });
  T(s, "source", { x: 0.7, y: 4.25, w: 1.6, h: 0.3, size: 11, bold: true, color: C.white, align: "center", name: "hsSL" });
  T(s, "drain", { x: 4.8, y: 4.25, w: 1.6, h: 0.3, size: 11, bold: true, color: C.white, align: "center", name: "hsDL" });
  R(s, { x: 2.3, y: 2.2, w: 0.35, h: 2.4, fill: C.nitride, name: "hsSpL" });
  R(s, { x: 4.45, y: 2.2, w: 0.35, h: 2.4, fill: C.nitride, name: "hsSpR" });
  R(s, { x: 2.65, y: 2.2, w: 1.8, h: 2.4, fill: C.gate, name: "hsG" });
  T(s, "gate (wraps)", { x: 2.65, y: 2.3, w: 1.8, h: 0.3, size: 11, bold: true, color: "3D2F7A", align: "center", name: "hsGL" });
  R(s, { x: 2.3, y: y0 - 0.12, w: 2.5, h: y1 - y0 + 0.24, fill: C.hfo2, line: trap ? C.red : undefined, lw: 2, name: "hsOx" });
  R(s, { x: 2.3, y: y0, w: 2.5, h: y1 - y0, fill: C.body, name: "hsW" });
  // contacts (heat exits at 300 K)
  [[0.7, 1.6, "S"], [2.65, 1.8, "G"], [4.8, 1.6, "D"]].forEach(([x, w, n], i) => {
    R(s, { x, y: 1.85, w, h: 0.25, fill: C.ink, r: 0.03, name: "hsC" + i });
    T(s, "300 K", { x, y: 1.85, w, h: 0.25, size: 9, bold: true, color: C.white, align: "center", valign: "middle", name: "hsCt" + i });
  });
  // hot spot glow at the drain end
  const k = Math.min(dT / 45, 1);
  [[C.heat1, 1.0], [C.heat2, 0.7], [C.heat3, 0.45], [C.heat4, 0.25]].forEach(([c, f], i) => {
    const r = 0.05 + k * f;
    E(s, { cx: 4.35, cy: (y0 + y1) / 2, rx: r * 0.95, ry: r * 0.42, fill: c, ft: dT < 0.5 ? 100 : 15, name: "hsH" + i });
  });
  if (arrows) for (let i = 0; i < 3; i++) L(s, 2.45 + i * 0.7, (y0 + y1) / 2, 2.95 + i * 0.7, (y0 + y1) / 2, { color: C.elec, w: 2, arrow: true, name: "hsA" + i });
  if (exit) {
    L(s, 4.4, 3.0, 4.4, 2.12, { color: C.orange, w: 2.5, arrow: true, name: "hsX0" });
    L(s, 4.6, 3.4, 5.6, 2.12, { color: C.orange, w: 2.5, arrow: true, name: "hsX1" });
    L(s, 4.2, 3.4, 1.5, 2.12, { color: C.orange, w: 1.5, dash: "dash", arrow: true, name: "hsX2" });
  }
  if (trap) T(s, "heat trapped by the oxide", { x: 2.3, y: 3.85, w: 2.5, h: 0.25, size: 10, bold: true, color: C.red, align: "center", name: "hsTr" });
  T(s, "hot spot: drain end", { x: 3.6, y: 4.7, w: 2.0, h: 0.25, size: 10, bold: true, color: dT > 0.5 ? C.orange : C.white, align: "center", name: "hsHL" });
}

function inside() {
  const steps = [
    { o: { dT: 15, arrows: 1 }, h: "Current makes heat", b: "Moving electrons carry power P = I_D · V_D. That power must turn into heat somewhere.", c: C.orange, k: "Every working transistor turns its power into heat." },
    { o: { dT: 30, arrows: 1 }, h: "Hot spot at the drain end", b: "Near the drain the field is strongest. Fast electrons hit the silicon atoms there and the crystal vibrates: it heats up.", c: C.red, k: "The hot spot forms at the drain end of the wire." },
    { o: { dT: 43.6, arrows: 1, trap: 1 }, h: "The oxide traps the heat", b: "The wire is wrapped in SiO₂ and HfO₂, which conduct heat 10–100× worse than silicon. Heat cannot get out easily.", c: C.red, k: "Good for gate control, bad for cooling." },
    { o: { dT: 43.6, arrows: 1, trap: 1, exit: 1 }, h: "Heat escapes through metal", b: "It leaves through the drain, the gate metal and the contacts to 300 K. A harder path means a hotter channel: ΔT = R_th · P.", c: C.green, k: "Better heat paths (lower R_th) keep the channel cool: that is our project." },
  ];
  steps.forEach((st, i) => {
    const s = slide();
    header(s, "Self-heating – What happens inside", "Same GAA wire, now running at V_G = V_D = 0.7 V (side view along the channel)");
    stepDots(s, steps.length, i);
    hotScene(s, st.o);
    card(s, { x: 7.4, y: 1.7, w: 5.33, h: 2.6, n: i + 1, head: st.h, body: st.b, color: st.c });
    key(s, st.k);
    notes(s, st.b);
  });
}

function dtSweep() {
  const vgs = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
  const keys = ["V_G = 0.2 V: almost no current, almost no heat: the wire stays near 300 K.", "Low power: a little Joule heat appears at the drain end.", "Current rises: heat grows and collects where the field is strongest.", "More current, more heat: the oxide around the wire holds it in.", "Heat now flows out through the contacts and the gate metal.", "On point: 19.2 µW → 43.6 K hotter. The slope of this line is R_th."];
  const pts = D.VG.map((v, j) => [D.repHi[j] * 0.7, D.tRep[j] - 300]);
  vgs.forEach((vg, i) => {
    const s = slide();
    header(s, "Self-heating – Where the heat goes", "Reproduced GAAFET, V_D = 0.7 V, V_G raised step by step (Silvaco Atlas)");
    stepDots(s, vgs.length, i);
    const id = D.at(D.repHi, vg), P = id * 0.7, dT = D.at(D.tRep.map((t) => t - 299.999), vg);
    hotScene(s, { dT, arrows: vg >= 0.3 ? 1 : 0, exit: vg >= 0.6 ? 1 : 0 });
    const box = { x: 8.0, y: 1.8, w: 4.6, h: 2.6 };
    const { mx, my } = axes(s, box, { xr: [0, 20], yr: [0, 50], xt: [0, 5, 10, 15, 20], yt: [0, 10, 20, 30, 40, 50], xl: "power P = I_D·V_D (µW)", yl: "temperature rise ΔT (K)" });
    G(s, pts.map(([p, t]) => [mx(p), my(t)]), { color: "C9CCD3", w: 2, name: "ivGhost" });
    const n = Math.max(2, Math.round(vg / 0.025) + 1);
    G(s, pts.slice(0, n).map(([p, t]) => [mx(p), my(t)]), { color: C.orange, w: 3, name: "ivTrail" });
    E(s, { cx: mx(P), cy: my(dT), rx: 0.09, fill: C.red, line: C.white, lw: 1.5, name: "ivPt" });
    T(s, dT.toFixed(1) + " K", { x: mx(P) - 1.0, y: my(dT) - 0.36, w: 0.95, h: 0.24, size: 11, bold: true, color: C.red, align: "right", name: "ivPtL" });
    chips(s, [
      { k: "power P", v: P.toFixed(1) + " µW", d: i ? 1 : 0, good: false },
      { k: "rise ΔT", v: dT.toFixed(1) + " K", d: i ? 1 : 0, good: false },
      { k: "R_th = ΔT / P", v: (dT / P).toFixed(2) + " K/µW", d: 0 },
    ], { x: 7.5, y: 4.85, w: 1.65, h: 0.72 });
    knob(s, { x: 7.7, y: 6.05, w: 4.9, label: "KNOB: gate voltage V_G", ticks: [0, 0.2, 0.4, 0.6, 0.7], val: vg, fmt: (v) => v.toFixed(1), min: 0, max: 0.7, unit: " V", color: C.purple });
    key(s, keys[i]);
    notes(s, "Each point is one gate voltage of the V_D = 0.7 V Atlas sweep, plotted as temperature rise against dissipated power. At the on point R_th = 2.27 × 10⁶ K/W.");
  });
}

function heatMetrics() {
  const Ts = [300, 343.6, 400];
  Ts.forEach((Tk, k) => {
    const s = slide();
    header(s, "Self-heating – Heat changes every metric", "Turn the temperature knob and watch the switch get worse");
    stepDots(s, Ts.length, k);
    const box = { x: 1.3, y: 1.85, w: 5.6, h: 3.6 };
    const { mx, my } = axes(s, box, { xr: [300, 400], yr: [0.5, 1.0], xt: [300, 325, 350, 375, 400], yt: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0], yf: (v) => Math.round(v * 100) + " %", xl: "channel temperature T (K)", yl: "mobility μ(T) / μ(300 K)" });
    G(s, range(300, 400, 30).map((t) => [mx(t), my((300 / t) ** 2)]), { color: C.blue, w: 2.5, name: "hmC" });
    const mu = (300 / Tk) ** 2;
    L(s, mx(Tk), my(0.5), mx(Tk), my(mu), { color: C.mute, w: 0.75, dash: "dash", name: "hmV" });
    E(s, { cx: mx(Tk), cy: my(mu), rx: 0.1, fill: k ? C.red : C.blue, line: C.white, lw: 1.5, name: "hmP" });
    T(s, "μ = " + Math.round(mu * 100) + " %", { x: k === 2 ? mx(Tk) - 1.45 : mx(Tk) + 0.15, y: k === 0 ? my(mu) + 0.1 : my(mu) - 0.32, w: 1.3, h: 0.26, size: 12, bold: true, color: k ? C.red : C.blue, align: k === 2 ? "right" : "left", name: "hmPL" });
    if (Tk > 300 && Tk < 350) T(s, "343.6 K = peak of our reproduced device", { x: mx(Tk) - 0.6, y: my(0.5) - 0.35, w: 3, h: 0.24, size: 10, color: C.grey, name: "hmNote" });
    const ss = 0.1984 * Tk;
    chips(s, [
      { k: "mobility μ  (μ ∝ T⁻²)", v: Math.round(mu * 100) + " %", d: k ? -1 : 0, good: false },
      { k: "I_on → slower circuit", v: k ? "falls" : "base", d: k ? -1 : 0, good: false },
      { k: "SS limit (kT/q)·ln10", v: ss.toFixed(1), d: k ? 1 : 0, good: false },
      { k: "I_off → more power", v: k ? "rises" : "base", d: k ? 1 : 0, good: false },
      { k: "V_T (≈ −1.6 mV/K)", v: (Tk === 300 ? "0" : "−" + Math.round(1.6 * (Tk - 300))) + " mV", d: k ? -1 : 0, good: false },
      { k: "ageing (HCD, BTI)", v: k ? "faster" : "base", d: k ? 1 : 0, good: false },
    ], { x: 7.5, y: 1.8, w: 2.55, h: 0.82, cols: 2 });
    knob(s, { x: 7.7, y: 5.4, w: 4.9, label: "KNOB: channel temperature T", ticks: [300, 325, 350, 375, 400], val: Tk, min: 300, max: 400, fmt: (v) => Math.round(v * 10) / 10, unit: " K", color: C.orange });
    key(s, ["At 300 K the device behaves as designed.", "At our reproduced peak, 343.6 K, mobility is already 24 % lower.", "At 400 K the switch is slower, leakier and ages faster."][k]);
    notes(s, "Mobility follows roughly T to the minus 2. This is why the project lowers ΔT: a cooler channel keeps I_on, SS and I_off healthy.");
  });
}

function crossing() {
  const s = slide();
  header(s, "Self-heating – What heat does to the current", "Heat helps a little below 0.57 V and hurts above it [4]");
  const box = { x: 1.3, y: 1.85, w: 6.0, h: 3.7 };
  const { mx, my } = axes(s, box, { xr: [0.3, 0.7], yr: [0, 30], xt: [0.3, 0.4, 0.5, 0.6, 0.7], yt: [0, 10, 20, 30], yf: (v) => v + " µA", xl: "gate voltage V_GS (V)", yl: "I_D (schematic)" });
  const f0 = (v) => 30 * ((v - 0.25) / 0.45) ** 1.6;
  const f1 = (v) => f0(v) * (1 + 0.25 * (0.57 - v) / 0.27 * (v < 0.57 ? 1 : 1.6));
  G(s, range(0.3, 0.7, 30).map((v) => [mx(v), my(f0(v))]), { color: C.grey, w: 2.25, dash: "dash" });
  G(s, range(0.3, 0.7, 30).map((v) => [mx(v), my(f1(v))]), { color: C.red, w: 3 });
  E(s, { cx: mx(0.57), cy: my(f0(0.57)), rx: 0.09, fill: C.ink });
  T(s, "cross at 0.57 V", { x: mx(0.57) - 1.6, y: my(f0(0.57)) - 0.1, w: 1.5, h: 0.25, size: 11, bold: true, align: "right" });
  T(s, "without self-heating", { x: mx(0.4), y: my(f0(0.47)) - 0.45, w: 1.8, h: 0.24, size: 10, color: C.grey });
  T(s, "with self-heating", { x: mx(0.62), y: my(f1(0.64)) + 0.2, w: 1.8, h: 0.24, size: 10, bold: true, color: C.red });
  card(s, { x: 7.9, y: 1.75, w: 4.83, h: 1.75, head: "V_GS < 0.57 V: I_D slightly up", body: "Heat creates extra electron–hole pairs (SRH generation), adding a little current.", color: C.orange });
  card(s, { x: 7.9, y: 3.7, w: 4.83, h: 1.95, head: "V_GS > 0.57 V: I_on down", body: "Hot lattice → more phonon scattering → mobility μ falls, worst at the source end → less I_on.", color: C.red });
  T(s, "Schematic of the trend reported by Kang et al. [4] (exaggerated for clarity).", { x: 7.9, y: 5.75, w: 4.83, h: 0.25, size: 10, color: C.mute });
  key(s, "In the on-state heat lowers mobility and I_on: that is the loss our project fights.");
  notes(s, "Below about 0.57 V heat adds a little generation current; above it, mobility loss dominates and on-current drops.");
}

function crosstalk() {
  const s = slide();
  header(s, "Self-heating – Thermal crosstalk", "A hot transistor heats its neighbour through the shared gate metal and substrate");
  R(s, { x: 1.0, y: 4.6, w: 6.0, h: 0.7, fill: C.sub, r: 0.04 });
  T(s, "shared gate metal and substrate", { x: 1.0, y: 4.8, w: 6, h: 0.3, size: 11, color: "8A6D1F", align: "center" });
  R(s, { x: 1.4, y: 2.2, w: 2.2, h: 2.2, fill: C.heat3, r: 0.1 });
  T(s, "NMOS on\nΔT_SH = 64.8 K", { x: 1.4, y: 2.2, w: 2.2, h: 2.2, size: 15, bold: true, color: C.white, align: "center", valign: "middle" });
  R(s, { x: 4.4, y: 2.2, w: 2.2, h: 2.2, fill: C.heat1, r: 0.1 });
  T(s, "PMOS off\nΔT_cross = 22.4 K", { x: 4.4, y: 2.2, w: 2.2, h: 2.2, size: 15, bold: true, color: C.orange, align: "center", valign: "middle" });
  L(s, 3.65, 3.3, 4.35, 3.3, { color: C.red, w: 3, arrow: true });
  T(s, "heat", { x: 3.6, y: 2.95, w: 0.8, h: 0.25, size: 11, bold: true, color: C.red, align: "center" });
  R(s, { x: 7.8, y: 1.75, w: 4.93, h: 2.2, fill: C.panel, r: 0.08 });
  T(s, "Crosstalk coefficient", { x: 8.05, y: 1.9, w: 4.4, h: 0.3, size: 13, bold: true, color: C.grey });
  T(s, "α = ΔT_cross / ΔT_SH", { x: 8.05, y: 2.3, w: 4.4, h: 0.4, size: 18, bold: true });
  T(s, "= 22.4 / 64.8 = 34.6 %", { x: 8.05, y: 2.8, w: 4.4, h: 0.6, size: 28, bold: true, color: C.red });
  T(s, "base paper [1]", { x: 8.05, y: 3.45, w: 4.4, h: 0.3, size: 11, color: C.grey });
  T(s, "About a third of the hot device's rise reaches the device next to it. Lowering self-heating at the source lowers crosstalk with it.", { x: 7.8, y: 4.2, w: 4.9, h: 1.2, size: 14, color: C.grey });
  key(s, "Self-heating first, then crosstalk: our project builds on the first.");
  notes(s, "Transistors in a cell share the gate metal and the substrate. Heat from the active NMOS spreads into the PMOS next to it, even though the PMOS is off.");
}

function chapter4() {
  section("4 · The new problem: heat");
  notes(contents(3), "Chapter 4: the price of gate-all-around is heat.");
  kappa();
  ohm();
  inside();
  dtSweep();
  heatMetrics();
  crossing();
  crosstalk();
}
module.exports = { chapter4, hotScene };
