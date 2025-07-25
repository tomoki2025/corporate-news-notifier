const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const url = "https://spacedata.jp/news";
const dataFilePath = path.join(__dirname, "data", "spacedata.json");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const anchors = await page.$$eval(".news_list li a", (elements) => {
    return elements.map((a) => ({
      title: a.querySelector("p")?.innerText.trim(),
      url: a.href,
      date: a.querySelector("time")?.innerText.trim()
    }));
  });

  console.log("✅ anchor length:", anchors.length);
  console.log("✅ first anchor sample:", anchors[0]);

  await browser.close();

  let oldArticles = [];
  if (fs.existsSync(dataFilePath)) {
    const rawData = fs.readFileSync(dataFilePath);
    oldArticles = JSON.parse(rawData);
  }

  const oldUrls = new Set(oldArticles.map((a) => a.url));
  const newArticles = anchors.filter((a) => !oldUrls.has(a.url));

  if (newArticles.length > 0) {
    const allArticles = [...newArticles, ...oldArticles];
    fs.writeFileSync(dataFilePath, JSON.stringify(allArticles, null, 2));
  }

  console.log(`🟡 Scraping completed. New articles: ${newArticles.length}`);
})();
