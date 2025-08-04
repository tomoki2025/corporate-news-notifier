const fs = require("fs");

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function getNews() {
  const newData = JSON.parse(fs.readFileSync("spacedata_new.json"));
  const oldData = fs.existsSync("spacedata_old.json")
    ? JSON.parse(fs.readFileSync("spacedata_old.json"))
    : [];

  const oldUrls = new Set(oldData.map(n => n.url));
  const oldTitles = new Set(oldData.map(n => normalize(n.title)));

  const diff = newData.filter(n =>
    !oldUrls.has(n.url) && !oldTitles.has(normalize(n.title))
  );

  fs.writeFileSync("spacedata_old.json", JSON.stringify(newData, null, 2));

  return diff;
}

module.exports = { getNews };
