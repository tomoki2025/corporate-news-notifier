const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const TARGET_URL = 'https://10x.co.jp/news/';
const SITE_ID = '10X';
const OUTPUT_FILE = `./data/${SITE_ID}.json`;
const SENT_FILE = `./data/${SITE_ID}_sent.json`;

// ニュース一覧を取得し、新着だけ返す
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

  // 保存ファイルがなければ空リスト
  const sentUrls = fs.existsSync(SENT_FILE)
    ? JSON.parse(fs.readFileSync(SENT_FILE, 'utf-8'))
    : [];

  // 新着ニュースを抽出
  const newArticles = articles.filter(article => !sentUrls.includes(article.url));

  // 新着があれば、履歴を更新
  if (newArticles.length > 0) {
    const updated = [...sentUrls, ...newArticles.map(a => a.url)];
    fs.writeFileSync(SENT_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  }

  // デバッグ用に全体保存（オプション）
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8');

  // メール本文生成
  if (newArticles.length === 0) {
    return '本日の新着ニュースはありません。';
  }

  return newArticles.map(article => {
    return `■ ${article.title}\nカテゴリ: ${article.category}\n日付: ${article.date}\nURL: ${article.url}\n------------------------`;
  }).join('\n\n');
}

module.exports = { getNews };
