// Chapter 7: conclusion
const { C, section, slide, T, R, E, L, header, key, notes, stepDots } = require("./lib");
const { contents, gaaRings } = require("./s0");

function gains() {
  const s = slide();
  header(s, "Conclusion – What the work gives, and what it costs", "Advantages on the left, limitations on the right");
  const adv = [["Matches the base paper", "68.0 K vs 64.8 K at 30 µW (+5 %)."], ["Cooler optimal device", "−16.4 % ΔT, 2.5× less leakage, I_on −7.8 %."], ["Runs on a laptop", "Block Newton, 24k nodes, 15–35 min per device."]];
  const lim = [["Wire, not sheet", "Equal area, but rounder than the 20 × 5 nm sheet."], ["Lumped heat exit", "Substrate and copper wiring folded into one fitted α."], ["One device only", "Crosstalk needs a second device in the deck."]];
  [[adv, "Advantages", C.green, 0.6], [lim, "Limitations", C.orange, 6.77]].forEach(([list, h, col, x]) => {
    T(s, h, { x, y: 1.6, w: 5.96, h: 0.4, size: 18, bold: true, color: col });
    list.forEach(([a, b], i) => {
      const y = 2.15 + i * 1.25;
      R(s, { x, y, w: 5.96, h: 1.08, fill: C.panel, r: 0.08 });
      E(s, { cx: x + 0.45, cy: y + 0.54, rx: 0.22, fill: col });
      T(s, col === C.green ? "✓" : "!", { x: x + 0.23, y: y + 0.32, w: 0.44, h: 0.44, size: 14, bold: true, color: C.white, align: "center", valign: "middle" });
      T(s, a, { x: x + 0.85, y: y + 0.14, w: 4.9, h: 0.36, size: 15, bold: true });
      T(s, b, { x: x + 0.85, y: y + 0.52, w: 4.9, h: 0.45, size: 12, color: C.grey });
    });
  });
  key(s, "A calibrated single-device model, ready to extend to crosstalk.");
  notes(s, "Advantages: we match the base paper, we have a cooler device, and the method runs on a laptop. Limitations: our channel is a wire not a sheet, the substrate and wiring are lumped into one alpha, and we model one device only.");
}

function story() {
  const st = [["MOSFET", "short L_g leaks", "DIBL 202 mV/V", C.red], ["GAAFET", "gate on all sides", "DIBL 17 mV/V", C.blue], ["Heat", "oxide traps it", "ΔT 64.8 K", C.orange], ["Reproduce", "68.0 vs 64.8 K", "+5 %", C.ink], ["Optimal", "spacer + WF", "16.4 % cooler", C.green]];
  st.forEach((_, k) => {
    const s = slide();
    header(s, "Conclusion – The whole story", "From a leaking MOSFET to a cooler GAAFET, in five steps");
    stepDots(s, st.length, k);
    st.forEach(([h, a, b, col], i) => {
      const x = 0.6 + i * 2.5, on = i <= k;
      if (i) L(s, x - 0.35, 3.0, x - 0.05, 3.0, { color: on ? C.ink : C.line, w: 2, arrow: true, name: "stA" + i });
      R(s, { x, y: 1.9, w: 2.15, h: 2.3, fill: on ? (i === k ? col : C.panel) : "FAFAFB", r: 0.1, name: "stB" + i });
      T(s, String(i + 1), { x: x + 0.2, y: 2.05, w: 0.5, h: 0.4, size: 16, bold: true, color: i === k ? C.white : on ? col : "D0D2D6", name: "stN" + i });
      T(s, h, { x: x + 0.2, y: 2.5, w: 1.85, h: 0.45, size: 18, bold: true, color: i === k ? C.white : on ? C.ink : "D0D2D6", name: "stH" + i });
      T(s, a, { x: x + 0.2, y: 3.0, w: 1.85, h: 0.5, size: 12, color: i === k ? "F2F2F2" : on ? C.grey : "D0D2D6", name: "stT" + i });
      T(s, b, { x: x + 0.2, y: 3.6, w: 1.85, h: 0.4, size: 14, bold: true, color: i === k ? C.white : on ? col : "D0D2D6", name: "stV" + i });
    });
    const msg = ["Short planar transistors let the drain take over the channel.", "Wrapping the gate all round restores control: λ 4.37 → 2.18 nm.", "But the oxide that wraps the channel also traps its heat.", "Our Atlas GAAFET heats like the base paper, within 5 %.", "A high-κ spacer and a 0.03 eV work-function step make it 16.4 % cooler."][k];
    T(s, msg, { x: 0.6, y: 4.6, w: 12.13, h: 0.6, size: 20, align: "center", valign: "middle", name: "stMsg" });
    key(s, "Control fixed by GAA; heat lowered by design.");
    notes(s, "A one-slide recap: short MOSFETs leak, GAA fixes that, GAA traps heat, we reproduced the heat of the base paper, and we lowered it with a better spacer and a small work-function shift.");
  });
}

function next() {
  const s = slide();
  header(s, "Conclusion – Next steps", "From one hot device to thermal crosstalk between devices");
  const n = [["Two devices", "Place the calibrated GAAFET next to a second one on a shared substrate."], ["Crosstalk α", "Measure ΔT_cross / ΔT_SH and compare with 34.6 % in the paper."], ["Geometry sweep", "Gate oxide, BOX thickness and channel length vs R_eff = ΔT / P."], ["Mitigation", "High-κ BOX (DLC-type) [2] and metal heat paths such as wrap-around contacts [4]."]];
  n.forEach(([h, b], i) => {
    const x = 0.6 + i * 3.08;
    R(s, { x, y: 1.9, w: 2.85, h: 3.4, fill: C.panel, r: 0.08 });
    E(s, { cx: x + 0.55, cy: 2.5, rx: 0.3, fill: C.blue });
    T(s, String(i + 1), { x: x + 0.25, y: 2.2, w: 0.6, h: 0.6, size: 18, bold: true, color: C.white, align: "center", valign: "middle" });
    T(s, h, { x: x + 0.25, y: 3.05, w: 2.4, h: 0.4, size: 17, bold: true });
    T(s, b, { x: x + 0.25, y: 3.55, w: 2.4, h: 1.5, size: 13, color: C.grey });
  });
  key(s, "Next: two devices, a shared substrate, and the crosstalk coefficient.");
  notes(s, "Next we place a second device beside the calibrated one, measure the crosstalk coefficient and compare it with the paper's 34.6 percent, then sweep geometry and try a high-conductivity buried oxide.");
}

function refs() {
  const s = slide();
  header(s, "References");
  const r = [
    '[1] S. Chen, H. Wu, R. Wang, R. Huang, and L. Zhang, "Thermal crosstalk analysis in advanced CMOS circuits: Insights from 3nm gate-all-around transistor technology," in Proc. IEEE EDTM, 2025, doi: 10.1109/EDTM61175.2025.11040984.',
    '[2] S. Rathore, R. K. Jaisawal, P. N. Kondekar, and N. Bagga, "Demonstration of a nanosheet FET with high thermal conductivity material as buried oxide: Mitigation of self-heating effect," IEEE Trans. Electron Devices, vol. 70, no. 4, pp. 1970–1976, Apr. 2023.',
    '[3] L. Cai, W. Chen, G. Du, X. Zhang, and X. Liu, "Investigation of self-heating effect on stacked nanosheet GAA transistors," in Proc. VLSI-TSA, 2018, doi: 10.1109/VLSI-TSA.2018.8403821.',
    '[4] S. J. Kang, J. H. Kim, Y. S. Song, S. Go, and S. Kim, "Investigation of self-heating effects in vertically stacked GAA MOSFET with wrap-around contact," IEEE Trans. Electron Devices, vol. 69, no. 3, pp. 910–914, Mar. 2022, doi: 10.1109/TED.2022.3140283.',
    '[5] M. Belkhiria and F. Echouchene, "Analysis of heat transfer in GAAFET transistor with linear doping based on single-phase lag model," in Proc. SSD, 2021, doi: 10.1109/SSD52085.2021.9429320.',
    "[6] Silvaco Inc., Atlas User's Manual, version 5.28.1.R.",
  ];
  T(s, r.join("\n"), { x: 0.6, y: 1.4, w: 12.13, h: 4.8, size: 13, color: C.ink, psa: 10 });
  notes(s, "Full references for the five papers and the simulator.");
}

function thanks() {
  const s = slide("TITLE");
  T(s, "Thank you", { x: 0.6, y: 2.3, w: 7, h: 1.0, size: 44, name: "title" });
  T(s, "Questions and discussion", { x: 0.62, y: 3.3, w: 7, h: 0.5, size: 18, color: C.grey, name: "sub" });
  gaaRings(s, 10.6, 3.0, 1.15);
  L(s, 0.6, 5.35, 12.73, 5.35, { color: C.line, w: 0.75 });
  T(s, "Nithyanand B  ·  Priyadharshini K  ·  Sivaprakash R", { x: 0.6, y: 5.55, w: 9, h: 0.35, size: 16 });
  T(s, "M.Tech VLSI Design  ·  Analog VLSI and Device Modelling Lab (25VL681)", { x: 0.6, y: 6.0, w: 9, h: 0.3, size: 13, bold: true });
}

function chapter7() {
  section("7 · Conclusion");
  notes(contents(6), "Chapter 7: what we gained, and what comes next.");
  gains();
  story();
  next();
  refs();
  thanks();
}
module.exports = { chapter7 };
