const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://spacedata.jp/news', { waitUntil: 'networkidle2' });

  await page.waitForSelector('.news-items li a.news-link');

  const links = await page.$$eval('.news-items li a.news-link', anchors =>
    anchors.map(anchor => ({
      title: anchor.textContent.trim(),
      url: anchor.href
    }))
  );

  const filePath = path.join(__dirname, 'data', 'spacedata.json');
  fs.writeFileSync(filePath, JSON.stringify(links, null, 2));

  console.log('✅ SpaceDataニュース取得完了');

  await browser.close();
})();
