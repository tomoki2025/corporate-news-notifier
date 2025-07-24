const nodemailer = require('nodemailer');
const { getNews } = require('./scrape-news');

async function sendEmail() {
  const newsItems = await getNews();

  const text = newsItems.map(item => {
    return [
      `■ ${item.title}`,
      `カテゴリ: ${item.category}`,
      `日付: ${item.date}`,
      `URL: ${item.url}`,
      '------------------------------'
    ].join('\n');
  }).join('\n\n');

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
    text: text,
  });

  console.log('メール送信成功:', info.messageId);
}

sendEmail().catch(console.error);
