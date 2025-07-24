const nodemailer = require('nodemailer');
const fs = require('fs');
const { getNews } = require('./scrape-news');
require('dotenv').config();

async function sendEmail() {
  const news = await getNews();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const subject = `本日の企業ニュース（${new Date().toLocaleDateString('ja-JP')}）`;
  const body = news.trim().length === 0 ? '本日の新着ニュースはありません。' : news;

  const info = await transporter.sendMail({
    from: `"企業ニュースBot" <${process.env.GMAIL_USER}>`,
    to: 'tomokikadotani2020@gmail.com',
    subject,
    text: body
  });

  console.log('メール送信完了:', info.messageId);
}

sendEmail().catch(console.error);
