const puppeteer = require('puppeteer');

const companies = [
  {
    name: '10X',
    url: 'https://10x.co.jp/news/',
    selector: 'li.news-list__item',
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
      await page.goto(company.url, { waitUntil: 'domcontentloaded' });
      const elements = await page.$$eval(company.selector, (els) =>
        els.slice(0, 3)
          .map((el) => {
            const anchor = el.querySelector('a');
            const date = el.querySelector('time')?.textContent.trim() || '';
            const title = el.querySelector('p')?.textContent.trim() || '';
            const href = anchor?.href || '';
            return {
              text: `${date} ${title}`.trim(),
              href
            };
          })
          .filter(el => el.text.length > 0)
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
