const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'https://spacedata.jp/news';
const dataDir = path.join(__dirname, 'data');
const outputFile = path.join(dataDir, 'spacedata.json');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });

    // HTML全体を一度保存して中身を確認できるように
    const pageContent = await page.content();
    fs.writeFileSync(path.join(dataDir, 'debug_spacedata.html'), pageContent);

    await page.waitForSelector('.news_list', { timeout: 30000 });

    const articles = await page.$$eval('.news_list .list a', anchors =>
      anchors.map(a => {
        const title = a.querySelector('.ttl')?.innerText.trim() || '';
        const href = a.href;
        return { title, url: href };
      }).filter(a => a.title && a.url)
    );

    console.log(`✅ anchor length: ${articles.length}`);
    console.log(`✅ first anchor sample: ${articles[0] ? articles[0].title : 'N/A'}`);

    let oldArticles = [];
    if (fs.existsSync(outputFile)) {
      oldArticles = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    }

    const newArticles = articles.filter(a => !oldArticles.some(old => old.url === a.url));

    fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2));

    if (newArticles.length > 0) {
      fs.writeFileSync(path.join(dataDir, 'spacedata_new.json'), JSON.stringify(newArticles, null, 2));
    }

    console.log(`🟡 Scraping completed. New articles: ${newArticles.length}`);
  } catch (err) {
    console.error(`❌ エラー: ${err.message}`);
  } finally {
    await browser.close();
  }
})();
