const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'https://spacedata.jp/news';
const dataDir = path.join(__dirname, 'data');
const outputFile = path.join(dataDir, 'spacedata.json');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    // .news_list が出るまで明示的に待つ
    await page.waitForSelector('.news_list', { timeout: 15000 });

    // ニュース記事の取得
    const articles = await page.$$eval('.news_list .list a', anchors =>
      anchors.map(a => {
        const title = a.querySelector('.ttl')?.innerText.trim() || '';
        const href = a.href;
        return { title, url: href };
      }).filter(a => a.title && a.url)
    );

    console.log(`✅ anchor length: ${articles.length}`);
    console.log(`✅ first anchor sample: ${articles[0] ? articles[0].title : 'N/A'}`);

    // 過去データの読み込み
    let oldArticles = [];
    if (fs.existsSync(outputFile)) {
      oldArticles = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    }

    // 差分の抽出
    const newArticles = articles.filter(a => !oldArticles.some(old => old.url === a.url));

    // 全体保存
    fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2));

    // 新着のみ保存
    if (newArticles.length > 0) {
      const newFile = path.join(dataDir, 'spacedata_new.json');
      fs.writeFileSync(newFile, JSON.stringify(newArticles, null, 2));
    }

    console.log(`🟡 Scraping completed. New articles: ${newArticles.length}`);
    console.log(`🔎 spacedata_new.json 内容確認用：`);
    console.log(JSON.stringify(newArticles, null, 2));
  } catch (err) {
    console.error(`❌ エラー: ${err.message}`);
  } finally {
    await browser.close();
  }
})();
