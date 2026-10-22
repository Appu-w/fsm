// Adds a Morph transition (fade fallback) to every slide, as in the AC template.
const JSZip = require("jszip");
const fs = require("fs");

const MORPH = (dur) =>
  `<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main"><mc:Choice Requires="p159"><p:transition xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" spd="slow" p14:dur="${dur}"><p159:morph option="byObject"/></p:transition></mc:Choice><mc:Fallback xmlns=""><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>`;

async function addMorph(file, dur = 900) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const names = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
  for (const n of names) {
    let x = await zip.file(n).async("string");
    if (x.includes("p159:morph")) continue;
    if (x.includes("</p:clrMapOvr>")) x = x.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + MORPH(dur));
    else x = x.replace("</p:cSld>", "</p:cSld>" + MORPH(dur));
    zip.file(n, x);
  }
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(file, buf);
  return names.length;
}
module.exports = { addMorph };
