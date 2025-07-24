const nodemailer = require('nodemailer');
const { getNews } = require('./scrape-news');

async function sendEmail() {
  const news = await getNews();

  if (news.length === 0) {
    console.log('ニュース記事が見つかりませんでした。');
    return;
  }

  const plainText = news.map((item, index) => {
    return `■ ${item.title}
カテゴリ: ${item.category}
日付: ${item.date}
URL: ${item.url}
画像URL: ${item.imageUrl || 'なし'}
`;
  }).join('\n--------------------------\n');

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
    text: plainText,  // ← 読みやすいテキスト本文に変換
  });

  console.log('メール送信成功:', info.messageId);
}

sendEmail().catch(console.error);
