const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const dataDir = path.join(__dirname, 'data');

function formatNewsSummary(company, articles) {
  if (articles.length === 0) return '';
  const lines = [`■ ${company}`];
  for (const article of articles) {
    lines.push(`- 日付：${article.date}`);
    lines.push(`- タイトル：${article.title}`);
    lines.push(`- 記事内容：${article.summary}`);
    lines.push(''); // 空行で区切り
  }
  return lines.join('\n');
}

// 🔍 data フォルダ内の *_new.json をすべて読み込み
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('_new.json'));

let fullBody = '';

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const articles = JSON.parse(raw);
  if (articles.length === 0) continue;
  const company = articles[0].company || file.replace('_new.json', '');
  fullBody += formatNewsSummary(company, articles) + '\n';
}

// ✉️ メール送信（差分がある場合のみ）
if (fullBody.trim().length === 0) {
  console.log('✅ 新着ニュースはありません（メール送信なし）');
  process.exit(0);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.GMAIL_USER,
  to: process.env.GMAIL_USER,
  subject: '【企業ニュース通知】新着記事のお知らせ',
  text: fullBody
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.error('❌ メール送信失敗:', error);
  } else {
    console.log('✅ メール送信成功:', info.response);
  }
});
