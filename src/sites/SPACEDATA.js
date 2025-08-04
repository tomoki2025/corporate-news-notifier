module.exports = {
  url: 'https://spacedata.jp/news',
  siteName: 'SPACEDATA',
  articleSelector: "a.sd.appear",
  getArticleData: async (page, element) => {
    const url = await element.evaluate(el => el.href);

    const articlePage = await page.browser().newPage();
    await articlePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    const title = await articlePage.$eval("main h1", el => el.innerText.trim());
    const dateMatch = await articlePage.evaluate(() => {
      const match = document.body.innerText.match(/\d{4}\/\d{1,2}\/\d{1,2}/);
      return match ? match[0] : null;
    });
    const summary = await articlePage.$eval("main p", el => el.innerText.trim().replace(/\s+/g, " "));

    await articlePage.close();

    return {
      title,
      url,
      date: dateMatch,
      summary
    };
  }
};
