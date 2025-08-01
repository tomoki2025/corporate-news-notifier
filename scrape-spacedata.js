const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://spacedata.jp/news', { waitUntil: 'networkidle2' });

  // 明示的に数秒待機する（JSレンダリング対応）
  await page.waitForTimeout(5000);

  const newsItems = await page.$$eval('.news-items li a.news-link', links =>
    links.map(link => ({
      title: link.innerText.trim(),
      url: link.href
    }))
  );

  console.log(newsItems);

  await browser.close();
})();
