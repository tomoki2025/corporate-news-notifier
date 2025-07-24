const nodemailer = require('nodemailer');
const { scrapeAndFilterNewArticles } = require('./scrape-news');
require('dotenv').config(); // .env対応している場合（していなければ削除してもOK）

async function sendEmail() {
  const articles = await scrapeAndFilterNewArticles();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const newsText = articles.length
    ? articles.map(n =>
        `■ ${n.title}\nカテゴリ: ${n.category}\n日付: ${n.date}\nURL: ${n.url}\n--------------------------`
      ).join('\n\n')
    : '本日の新着ニュースはありません。';

  const info = await transporter.sendMail({
    from: `"企業ニュースBot" <${process.env.GMAIL_USER}>`,
    to: 'tomokikadotani2020@gmail.com',
    subject: `本日の企業ニュース（${new Date().toLocaleDateString('ja-JP')}）`,
    text: newsText,
  });

  console.log(`✅ メール送信完了: ${info.messageId}`);
}

sendEmail().catch(console.error);
