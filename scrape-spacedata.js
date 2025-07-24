const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://spacedata.jp/news", { waitUntil: "domcontentloaded" });

  const newItems = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a.sd.appear"));
    return anchors.map((a) => {
      const url = a.href;
      const ps = a.querySelectorAll("p.text");

      return {
        date: ps[0]?.innerText.trim() || "日付不明",
        company: "SpaceData",
        title: ps[2]?.innerText.trim() || "タイトル不明",
        url: url.startsWith("http") ? url : `https://spacedata.jp/${url.replace(/^\//, "")}`,
      };
    });
  });

  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const filePath = path.join(dataDir, "spacedata.json");
  let existingItems = [];

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf8");
    try {
      existingItems = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error:", e);
    }
  }

  const existingUrls = new Set(existingItems.map((item) => item.url));
  const newUniqueItems = newItems.filter((item) => !existingUrls.has(item.url));

  if (newUniqueItems.length > 0) {
    const updatedItems = [...newUniqueItems, ...existingItems];
    fs.writeFileSync(filePath, JSON.stringify(updatedItems, null, 2), "utf8");
  }

  fs.writeFileSync(
    path.join(dataDir, "spacedata_diff.json"),
    JSON.stringify(newUniqueItems, null, 2),
    "utf8"
  );

  await browser.close();
})();
