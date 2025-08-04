const puppeteer = require("puppeteer");

async function getArticleLinks(page) {
  const links = await page.$$eval("a.sd.appear", (anchors) =>
    anchors
      .map((a) => a.href)
      .filter(
        (href) =>
          href.includes("/news/") &&
          !href.includes("/category") &&
          !href.endsWith("/news") &&
          !href.includes("/company") &&
          !href.includes("/recruit") &&
          !href.includes("/case") &&
          !href.includes("/contact") &&
          !href.includes("youtube") &&
          !href.includes("x.com") &&
          !href.includes("instagram") &&
          !href.includes("linkedin")
      )
  );
  return links;
}

async function getArticleData(page, url) {
  const articlePage = await page.browser().newPage();
  await articlePage.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  const title = await articlePage.$eval("main h1", (el) =>
    el.innerText.trim()
  );

  const date = await articlePage.evaluate(() => {
    const match = document.body.innerText.match(/\d{4}\/\d{1,2}\/\d{1,2}/);
    return match ? match[0] : null;
  });

  const summary = await articlePage.$eval("main p", (el) =>
    el.innerText.trim().replace(/\s+/g, " ")
  );

  await articlePage.close();

  return { title, url, date, summary };
}

module.exports = async function scrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://spacedata.jp/news", {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  const links = await getArticleLinks(page);
  const results = [];

  for (const link of links) {
    try {
      const article = await getArticleData(page, link);
      results.push(article);
    } catch (err) {
      console.error(`❌ 記事取得失敗: ${link}`, err.message);
    }
  }

  await browser.close();
  return results;
};
