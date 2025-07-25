const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join("data", "spacedata.json");

async function scrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto("https://spacedata.jp/news", { waitUntil: "networkidle2" });

  // 必要な要素が現れるまで待機
  await page.waitForSelector("a.sd.appear", { timeout: 10000 });

  const newsItems = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a.sd.appear"));
    return anchors.map(anchor => {
      const titleElement = anchor.querySelector("h2");
      const dateElement = anchor.querySelector("time");
      return {
        title: titleElement ? titleElement.textContent.trim() : "",
        url: anchor.href,
        date: dateElement ? dateElement.textContent.trim() : "",
      };
    });
  });

  console.log(`✅ 取得した記事数: ${newsItems.length}`);
  console.log(newsItems);

  // 保存用ディレクトリがなければ作成
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  // JSONファイルに保存
  fs.writeFileSync(DATA_FILE, JSON.stringify(newsItems, null, 2), "utf-8");

  await browser.close();
}

scrape().catch(err => {
  console.error("❌ スクレイピング中にエラー:", err);
});
