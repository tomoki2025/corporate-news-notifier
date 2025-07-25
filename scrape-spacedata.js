const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://spacedata.jp/news", { waitUntil: "domcontentloaded" });

  try {
    await page.waitForSelector(".sd a.appear", { timeout: 5000 });
  } catch (e) {
    console.log("⚠️ 記事セレクタが見つかりませんでした");
    await browser.close();
    return;
  }

  const articles = await page.evaluate(() => {
    const nodes = document.querySelectorAll(".sd a.appear");
    const items = [];

    nodes.forEach((el) => {
      const title = el.querySelector(".title")?.textContent?.trim() || "";
      const url = el.href;
      const date = el.querySelector(".date")?.textContent?.trim() || "";

      if (title && url) {
        items.push({ title, url, date });
      }
    });

    return items;
  });

  await browser.close();

  const filePath = path.join("data", "spacedata.json");
  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), "utf-8");

  console.log(`✅ 取得した記事数: ${articles.length}`);
  console.log(articles);
})();
