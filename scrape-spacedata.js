const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://spacedata.jp/news';
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    // ✅ 正しいセレクタに修正
    await page.waitForSelector('.newsList li a', { timeout: 15000 });

    const anchors = await page.$$eval('.newsList li a', (as) =>
      as.map((a) => ({
        title: a.querySelector('.title')?.innerText.trim() || '',
        url: a.href,
      }))
    );

    console.log(`✅ anchor length: ${anchors.length}`);
    console.log(`✅ first anchor sample: ${anchors[0] ? anchors[0].title : 'N/A'}`);

    fs.writeFileSync('data/spacedata_new.json', JSON.stringify(anchors, null, 2));
    console.log(`🔎 spacedata_new.json 内容確認用：\n${JSON.stringify(anchors, null, 2)}`);
  } catch (error) {
    console.error(`❌ セレクタが取得できませんでした: ${error.message}`);
    fs.writeFileSync('data/spacedata_new.json', '[]');
  } finally {
    await browser.close();
    console.log(`🟡 Scraping completed. New articles: ${fs.existsSync('data/spacedata_new.json') ? JSON.parse(fs.readFileSync('data/spacedata_new.json')).length : 0}`);
  }
})();
