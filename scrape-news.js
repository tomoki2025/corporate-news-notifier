const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://10x.co.jp/news/';
const SITE_ID = '10X';
const DATA_DIR = './data';
const OUTPUT_FILE = path.join(DATA_DIR, `${SITE_ID}.json`);
const SENT_FILE = path.join(DATA_DIR, `${SITE_ID}_sent.json`);

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function scrapeAndFilterNewArticles() {
  ensureDirSync(DATA_DIR);

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

  // 保存（全件）
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8');

  // 送信済みを読み込み（なければ空）
  let sent = [];
  if (fs.existsSync(SENT_FILE)) {
    try {
      sent = JSON.parse(fs.readFileSync(SENT_FILE, 'utf-8'));
    } catch (e) {
      console.error('❌ JSON parse error in SENT_FILE:', e);
    }
  }

  const sentUrls = new Set(sent.map(a => a.url));
  const newArticles = articles.filter(a => !sentUrls.has(a.url));

  if (newArticles.length > 0) {
    const updated = [...sent, ...newArticles];
    fs.writeFileSync(SENT_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  }

  console.log(`✅ 新着 ${newArticles.length} 件抽出`);
  return newArticles;
}

module.exports = { scrapeAndFilterNewArticles };
