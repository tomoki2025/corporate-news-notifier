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
        els.map((el) => {
          const date = el.querySelector('time')?.textContent.trim() || '';
          const category = el.querySelector('.news-list__category')?.textContent.trim() || '';
          const title = el.querySelector('.news-list__title')?.textContent.trim() || '';
          const excerpt = el.querySelector('.news-list__excerpt')?.textContent.trim() || '';
          const href = el.href;
          return {
            date,
            category,
            title,
            excerpt,
            href
          };
        })
      );

      console.log(`【${company.name}】 found ${elements.length} elements`);

      if (elements.length > 0) {
        const formatted = elements.map(el =>
          `・${el.date} [${el.category}] ${el.title}\n　${el.excerpt}\n　${el.href}`
        );
        results.push(`【${company.name}】\n${formatted.join('\n')}\n`);
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
