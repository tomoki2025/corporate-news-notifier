const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const NEWS_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(NEWS_DIR, 'news.json');
const NEWS_URL = 'https://10x.co.jp/news/';

async function scrape() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.goto(NEWS_URL, { waitUntil: 'domcontentloaded' });

  const newsItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.p-news__list li'));
    return items.map(item => {
      const anchor = item.querySelector('a');
      const link = anchor?.href || '';
      const title = anchor?.innerText.trim() || '';
      return { title, link };
    });
  });

  await browser.close();

  // ディレクトリがなければ作成
  if (!fs.existsSync(NEWS_DIR)) {
    fs.mkdirSync(NEWS_DIR);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(newsItems, null, 2));
  console.log(`✅ ニュースを保存しました: ${newsItems.length}件`);
}

if (require.main === module) {
  scrape().catch(err => {
    console.error('❌ スクレイピング中にエラーが発生しました:', err);
    process.exit(1);
  });
}

module.exports = { scrape };
