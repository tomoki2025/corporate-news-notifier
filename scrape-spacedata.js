const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://spacedata.jp/news', { waitUntil: 'domcontentloaded' });

  const articles = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('a.sd.appear'));
    return items.map(item => {
      const title = item.querySelector('.title')?.innerText || '';
      const date = item.querySelector('.date')?.innerText || '';
      const url = item.href || '';
      return { title, date, url };
    });
  });

  console.log('✅ 取得した記事数:', articles.length);
  console.log(JSON.stringify(articles, null, 2));

  await browser.close();
})();
