const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { getNews } = require('./scrape-news');
require('dotenv').config();

const OUTPUT_DIR = './data';
const SITE_ID = '10X';
const CURRENT_FILE = path.join(OUTPUT_DIR, `${SITE_ID}.json`);
const LAST_FILE = path.join(OUTPUT_DIR, `${SITE_ID}_last.json`);

function loadJson(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    return [];
  }
}

function saveJson(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

function formatNews(news) {
  return news.map(n => 
    `■ ${n.title}\nカテゴリ: ${n.category}\n日付: ${n.date}\nURL: ${n.url}\n----------------------`
  ).join('\n\n');
}

async function sendEmail(newsItems) {
  if (newsItems.length === 0) {
    console.log('新着なし。メール送信スキップ');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const info = await transporter.sendMail({
    from: `"企業ニュースBot" <${process.env.GMAIL_USER}>`,
    to: 'tomokikadotani2020@gmail.com',
    subject: `本日の企業ニュース（${new Date().toLocaleDateString('ja-JP')}）`,
    text: formatNews(newsItems)
  });

  console.log(`✅ メール送信完了: ${info.messageId}`);
}

(async () => {
  const currentNews = loadJson(CURRENT_FILE);
  const lastNews = loadJson(LAST_FILE);

  const lastUrls = new Set(lastNews.map(n => n.url));
  const newItems = currentNews.filter(n => !lastUrls.has(n.url));

  console.log(`🆕 新着 ${newItems.length} 件抽出`);
  await sendEmail(newItems);

  saveJson(LAST_FILE, currentNews); // 最後に送ったニュースを更新
})();
