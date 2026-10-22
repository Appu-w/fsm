const lib = require("./lib");
const { addMorph } = require("./morph");
const { applyTheme } = require("/root/.claude/skills/synced/7dac1fbe-f1d1-4f7f-b921-b617db235df8_84e5edd9-4d65-4034-96c0-564674be4e40/pptx/scripts/apply_theme.js");

const THEME = {
  name: "GAAFET Narrative", headFontFace: lib.FONT, bodyFontFace: lib.FONT,
  colors: { dk1: "171A20", lt1: "FFFFFF", dk2: "5C5E62", lt2: "F4F5F7", accent1: "3E6AE1", accent2: "11998E", accent3: "E07B00", accent4: "D64545", accent5: "2E9E4F", accent6: "6B5BC4", hlink: "3E6AE1", folHlink: "6B5BC4" },
};

(async () => {
  const out = process.argv[2] || "GAAFET_v6.pptx";
  const only = process.argv[3]; // optional chapter filter for quick tests
  lib.newPres();
  const ch = [
    ["0", () => require("./s0").opening()],
    ["1", () => require("./s1").chapter1()],
    ["2", () => require("./s2").chapter2()],
    ["3", () => require("./s3").chapter3()],
    ["4", () => require("./s4").chapter4()],
    ["5", () => require("./s5").chapter5()],
    ["6", () => require("./s6").chapter6()],
    ["7", () => require("./s7").chapter7()],
  ];
  for (const [id, fn] of ch) {
    if (only && !only.split(",").includes(id)) continue;
    try { require.resolve("./s" + id); } catch { continue; }
    fn();
  }
  await lib.pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  const n = await addMorph(out, 900);
  console.log("wrote", out, n, "slides");
})();
