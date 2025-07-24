const puppeteer = require('puppeteer');

const companies = [
  {
    name: '10X',
    url: 'https://10x.co.jp/news/',
    selector: '[aria-label="ニュース一覧"] a',
    base: 'https://10x.co.jp'
  }
];

async function getNews() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const results = [];

  for (const company of companies) {
    try {
      await page.goto(company.url, { waitUntil: 'networkidle2' });

      const elements = await page.$$eval(company.selector, (anchors) =>
        anchors.slice(0, 3).map((el) => {
          const text = el.textContent.trim().replace(/\s+/g, ' ');
          const href = el.href;
          return { text, href };
        })
      );

      console.log(`【${company.name}】 found ${elements.length} elements`);

      if (elements.length > 0) {
        const newsText = elements.map(el => `・${el.text} - ${el.href}`).join('\n');
        results.push(`【${company.name}】\n${newsText}\n`);
      } else {
        results.push(`【${company.name}】記事なし\n`);
      }

    } catch (err) {
      results.push(`【${company.name}】取得エラー: ${err.message}`);
    }
  }

  await browser.close();
  return results.join('\n');
}

module.exports = { getNews };
