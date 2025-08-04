const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const newFile = path.join(dataDir, "spacedata_new.json");
const oldFile = path.join(dataDir, "spacedata_old.json");

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function getNews() {
  if (!fs.existsSync(newFile)) {
    console.warn("⚠️ spacedata_new.json が存在しません");
    return [];
  }

  const newData = JSON.parse(fs.readFileSync(newFile));
  const oldData = fs.existsSync(oldFile)
    ? JSON.parse(fs.readFileSync(oldFile))
    : [];

  const oldUrls = new Set(oldData.map(n => n.url));
  const oldTitles = new Set(oldData.map(n => normalize(n.title)));

  const diff = newData.filter(
    n => !oldUrls.has(n.url) && !oldTitles.has(normalize(n.title))
  );

  fs.writeFileSync(oldFile, JSON.stringify(newData, null, 2));

  return diff;
}

module.exports = { getNews };
