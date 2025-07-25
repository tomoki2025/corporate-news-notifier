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

  // HTML全体を一度取得してログ出力（調査用）
  const html = await page.content();
  // console.log(html); // ← デバッグ用に必要なら出す

  // 適切なセレクタを使用（修正済み）
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
