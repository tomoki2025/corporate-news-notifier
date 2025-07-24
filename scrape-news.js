const puppeteer = require('puppeteer');

async function getNews() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const companies = [
    { name: '10X', url: 'https://10x.co.jp/news/' },
    { name: 'Deeping Source', url: 'https://www.deepingsource.io/jp/news' },
    { name: 'Sakana.AI', url: 'https://sakana.ai/blog/' },
    { name: 'Groq', url: 'https://groq.com/groq-in-the-news/' },
    { name: 'MODE', url: 'https://www.modenetworks.com/news/' },
    { name: 'Idein', url: 'https://www.idein.jp/ja/news' },
    { name: 'Datamesh', url: 'https://www.datamesh.co.jp/news.html' },
    { name: 'Turing', url: 'https://tur.ing/news' },
    { name: 'テンエックス', url: 'https://tx-inc.com/ja/press-jp/' },
    { name: 'Tinker Mode', url: 'https://news.tinkermode.jp/' },
    { name: 'Findy', url: 'https://findy.co.jp/news/' },
    { name: 'MOV', url: 'https://mov.am/news' },
    { name: 'SpaceData', url: 'https://spacedata.jp/news' }
  ];

  const results = [];

  for (const company of companies) {
    try {
      await page.goto(company.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const title = await page.title();
      const firstHeadline = await page.evaluate(() => {
        const el = document.querySelector('h1, h2, h3, article, li, p');
        return el?.innerText?.trim() || '';
      });

      results.push({ name: company.name, url: company.url, headline: firstHeadline });
    } catch (err) {
      results.push({ name: company.name, url: company.url, headline: '取得失敗' });
    }
  }

  await browser.close();
  return results;
}

// ←これがないと require で使えない！
module.exports = { getNews };
