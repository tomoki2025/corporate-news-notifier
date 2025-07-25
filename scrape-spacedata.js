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

  // 正しいセレクタでニュースを取得
  const articles = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll(".news_list li a"));
    return anchors.map((a) => ({
      title: a.querySelector("p")?.innerText.trim(),
      url: a.href,
      date: a.querySelector("time")?.innerText.trim()
    }));
  });

  await browser.close();

  let oldArticles = [];
  if (fs.existsSync(dataFilePath)) {
    const rawData = fs.readFileSync(dataFilePath);
    oldArticles = JSON.parse(rawData);
  }

  const oldUrls = new Set(oldArticles.map((a) => a.url));
  const newArticles = articles.filter((a) => !oldUrls.has(a.url));

  if (newArticles.length > 0) {
    const allArticles = [...newArticles, ...oldArticles];
    fs.writeFileSync(dataFilePath, JSON.stringify(allArticles, null, 2));
  }

  console.log(`Scraping completed. New articles: ${newArticles.length}`);
  if (newArticles.length > 0) {
    console.log("New articles found:");
    console.log(newArticles);
  }
})();
