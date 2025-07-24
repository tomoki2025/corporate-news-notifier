const puppeteer = require("puppeteer");
const fs = require("fs");
const { getNews, saveNews } = require("./scrape-news");

const BASE_URL = "https://spacedata.jp/news";

async function scrapeSpacedata() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  const newItems = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a.sd.appear"));
    return anchors.map((a) => {
      const url = a.href;
      const titleEl = a.querySelector("p.text.sd.appear:nth-of-type(3)");
      const dateEl = a.querySelector("p.text.sd.appear:nth-of-type(1)");

      return {
        date: dateEl?.innerText.trim() || "日付不明",
        company: "SpaceData",
        title: titleEl?.innerText.trim() || "タイトル不明",
        url: url.startsWith("http") ? url : `https://spacedata.jp/${url.replace(/^\/+/, "")}`
      };
    });
  });

  await browser.close();
  return newItems;
}

module.exports = scrapeSpacedata;
