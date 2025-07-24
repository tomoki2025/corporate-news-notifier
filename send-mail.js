const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { getNews } = require('./scrape-news');

const SITE_ID = '10X';
const DATA_FILE = `./data/${SITE_ID}.json`;             // 今回の全記事保存
const SENT_FILE = `./data/${SITE_ID}_sent.json`;        // 送信済み履歴保存

// 差分検出
function getNewArticles(current, previous) {
  const prevUrls = new Set(previous.map(article => article.url));
  return current.filter(article => !prevUrls.has(article.url));
}

// 本文を構築
function buildEmailBody(articles) {
  if (articles.length === 0) {
    return '本日の新着ニュースはありません。';
  }

  return articles.map(article => {
    return `■ ${article.title}
カテゴリ: ${article.category}
日付: ${article.date}
URL: ${article.url}
--------------------------`;
  }).join('\n\n');
}

async function sendEmail() {
  const news = await getNews();

  // 送信済み履歴を読み込む（初回は空配列）
  let sentNews = [];
  if (fs.existsSync(SENT_FILE)) {
    const raw = fs.readFileSync(SENT_FILE, 'utf-8');
    sentNews = JSON.parse(raw);
  }

  // 差分抽出
  const newArticles = getNewArticles(news, sentNews);

  const emailText = buildEmailBody(newArticles);

  // Gmail送信設定
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
    text: emailText,
  });

  console.log('📩 メール送信成功:', info.messageId);

  // 差分あったら履歴更新
  if (newArticles.length > 0) {
    fs.writeFileSync(SENT_FILE, JSON.stringify(news, null, 2), 'utf-8');
  }
}

sendEmail().catch(console.error);
