const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"], // ←★ ここがエラー回避の決め手！
  });
  const page = await browser.newPage();
  await page.goto("https://spacedata.jp/news", { waitUntil: "networkidle2" });

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
