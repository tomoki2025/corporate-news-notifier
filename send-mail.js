  require("dotenv").config();
const nodemailer = require("nodemailer");
const getNews = require("./scrape-news");  

async function sendEmail() {
  const news = await getNews();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const subject =
    Object.keys(news).length > 0
      ? "📰 本日の新着企業ニュース"
      : "📭 本日の新着ニュースはありません";

  let content = "";

  if (Object.keys(news).length > 0) {
    for (const company in news) {
      content += `■ ${company}\n`;
      for (const item of news[company]) {
        content += `- 日付：${item.date}｜タイトル：${item.title}\n  記事内容：${item.summary}\n  URL：${item.url}\n\n`;
      }
    }
  } else {
    content = "本日の新着企業ニュースはありませんでした。";
  }

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject,
    text: content,
  });

  console.log("✅ メール送信完了");
}

sendEmail();
