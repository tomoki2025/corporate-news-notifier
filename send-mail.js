require("dotenv").config();
const nodemailer = require("nodemailer");
const { getNews } = require("./scrape-news");
const path = require("path");

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
    news.length > 0 ? "📰 本日の新着企業ニュース" : "📭 本日の新着ニュースはありません";

  const content =
    news.length > 0
      ? news
          .map((n) =>
            `・${n.date}｜${n.company}｜${n.title}\n→ ${n.summary}\n${n.url}`
          )
          .join("\n\n")
      : "本日の新着企業ニュースはありませんでした。";

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject,
    text: content,
  });

  console.log("✅ メール送信完了");
}

sendEmail();
