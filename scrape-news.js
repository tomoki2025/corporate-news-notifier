const axios = require('axios');
const cheerio = require('cheerio');

// 各社のURL一覧
const companies = [
  {
    name: 'KDDI',
    url: 'https://www.kddi.com/corporate/news_release/',
    selector: '.newsList li a',
  },
  {
    name: 'SoftBank',
    url: 'https://www.softbank.jp/corp/news/press/',
    selector: '.p-press__list a',
  },
  {
    name: '10X',
    url: 'https://10x.co.jp/news/',
    selector: 'a.newsListItem',
    base: 'https://10x.co.jp',
  }
  // 必要に応じて追加
];

// ニュース取得関数
async function getNews() {
  const results = [];

  for (const company of companies) {
    try {
      const { data } = await axios.get(company.url);
      const $ = cheerio.load(data);
      const links = $(company.selector);

      const latest = [];  // ← これが抜けてた！

      links.slice(0, 3).each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href');
        const url = href.startsWith('http')
          ? href
          : (company.base ? company.base + href : href);
        latest.push(`・${text} - ${url}`);
      });

      results.push(`【${company.name}】\n${latest.join('\n')}\n`);
    } catch (err) {
      results.push(`【${company.name}】取得エラー: ${err.message}`);
    }
  }

  return results.join('\n');
}

module.exports = { getNews };
