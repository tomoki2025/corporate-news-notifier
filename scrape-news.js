const puppeteer = require('puppeteer');

const companies = [
  {
    name: '10X',
    url: 'https://10x.co.jp/news/',
    selector: 'a.news-list__item',
    base: 'https://10x.co.jp'
  }
];

async function getNews() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const results = [];

  for (const company of companies) {
    try {
      await page.goto(company.url, { waitUntil: 'domcontentloaded' });

      const elements = await page.$$eval(company.selector, (els) =>
        els.slice(0, 3).map((el) => {
          return {
            text: el.innerText.trim(),
            href: el.href
          };
        })
      );

      console.log(`【${company.name}】 found ${elements.length} elements`);

      if (elements.length > 0) {
        const latest = elements.map(el => `・${el.text} - ${el.href}`);
        results.push(`【${company.name}】\n${latest.join('\n')}\n`);
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
