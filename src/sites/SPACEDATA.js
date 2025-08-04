module.exports = {
  url: 'https://spacedata.jp/news',
  siteName: 'SPACEDATA',
  articleSelector: 'a.sd.appear',

  // フィルタ済みのリンク一覧を返す（不要URLを除外）
  getArticleLinks: async (page) => {
    const links = await page.$$eval('a.sd.appear', anchors =>
      anchors
        .map(a => a.href)
        .filter(href =>
          href.includes('/news/') &&
          !href.includes('/category') &&
          !href.endsWith('/news') &&
          !href.includes('/company') &&
          !href.includes('/recruit') &&
          !href.includes('/case') &&
          !href.includes('/contact') &&
          !href.includes('youtube') &&
          !href.includes('x.com') &&
          !href.includes('instagram') &&
          !href.includes('linkedin')
        )
    );
    return links;
  },

  // 記事詳細ページから title, date, summary を抽出
  getArticleData: async (page, element) => {
    const url = await element.evaluate(el => el.href);

    const articlePage = await page.browser().newPage();
    await articlePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    // タイトル取得
    const title = await articlePage.$eval('main h1', el => el.innerText.trim());

    // 日付取得（正規表現で本文から抽出）
    const date = await articlePage.evaluate(() => {
      const match = document.body.innerText.match(/\d{4}\/\d{1,2}\/\d{1,2}/);
      return match ? match[0] : null;
    });

    // 要約（main内のpから取得）
    const summary = await articlePage.$eval('main p', el =>
      el.innerText.trim().replace(/\s+/g, ' ')
    );

    await articlePage.close();

    return {
      title,
      url,
      date,
      summary
    };
  }
};
