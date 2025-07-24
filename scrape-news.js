const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const TARGET_URL = 'https://10x.co.jp/news/';
const SITE_ID = '10X';
const OUTPUT_FILE = `./data/${SITE_ID}.json`;
const SENT_FILE = `./data/${SITE_ID}_sent.json`;

async function getNews() {
  const { data: html } = await axios.get(TARGET_URL);
  const $ = cheerio.load(html);
  const articles = [];

  $('.link-card').each((_, el) => {
    const $el = $(el);
    const url = 'https://10x.co.jp' + $el.attr('href');
    const title = $el.find('.link-card-title').text().trim();
    const date = $el.find('.link-card-date').text().trim();
    const category = $el.find('.link-card-category').text().trim();
    articles.push({ title, url, date, category });
  });

  // 🔽 ディレクトリの存在チェック（なければ作成）
  const dir = path.dirname(SENT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 🔽 初回ファイルがなければ空リスト
  const sentUrls = fs.existsSync(SENT_FILE)
    ? JSON.parse(fs.readFileSync(SENT_FILE, 'utf-8'))
    : [];

  const newArticles = articles.filter(article => !sentUrls.includes(article.url));

  if (newArticles.length > 0) {
    const updated = [...sentUrls, ...newArticles.map(a => a.url)];
    fs.writeFileSync(SENT_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8');

  if (newArticles.length === 0) {
    return '本日の新着ニュースはありません。';
  }

  return newArticles.map(article => {
    return `■ ${article.title}\nカテゴリ: ${article.category}\n日付: ${article.date}\nURL: ${article.url}\n------------------------`;
  }).join('\n\n');
}

module.exports = { getNews };
