const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'https://spacedata.jp/news';
const dataDir = path.join(__dirname, 'data');
const outputFile = path.join(dataDir, 'spacedata.json');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

  try {
    // 👇 ここが重要：明確に <a class="sd appear"> を待つ
    await page.waitForSelector('a.sd.appear', { timeout: 15000 });

    const anchors = await page.$$eval('a.sd.appear', as =>
      as.map(a => ({
        title: a.innerText.trim(),
        url: a.href
      }))
    );

    console.log(`✅ anchor length: ${anchors.length}`);
    console.log(`✅ first anchor sample: ${anchors[0] ? anchors[0].title : 'N/A'}`);

    let oldArticles = [];
    if (fs.existsSync(outputFile)) {
      oldArticles = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    }

    const newArticles = anchors.filter(a => !oldArticles.some(old => old.url === a.url));
    fs.writeFileSync(outputFile, JSON.stringify(anchors, null, 2));

    console.log(`🟡 Scraping completed. New articles: ${newArticles.length}`);

    if (newArticles.length > 0) {
      const newFile = path.join(dataDir, 'spacedata_new.json');
      fs.writeFileSync(newFile, JSON.stringify(newArticles, null, 2));
    }
  } catch (err) {
    console.error(`❌ セレクタが取得できませんでした: ${err.message}`);
  } finally {
    await browser.close();
  }
})();
