const nodemailer = require('nodemailer');
const { getNews } = require('./scrape-news');

async function sendEmail() {
  const news = await getNews();

  if (!news || typeof news !== 'string' || news.includes('新着ニュースはありません')) {
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
    text: news,
  });

  console.log('メール送信成功:', info.messageId);
}

sendEmail().catch(console.error);
