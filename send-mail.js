require("dotenv").config();
const nodemailer = require("nodemailer");
const { getNews } = require("./scrape-news");

async function sendEmail() {
  const news = await getNews();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_FROM,
      pass: process.env.MAIL_PASS,
    },
  });

  const subject = news.length > 0 ? "📰 本日の新着企業ニュース" : "📭 本日の新着ニュースはありません";
  const content =
    news.length > 0
      ? news.map((n) => `・${n.date}｜${n.company}｜${n.title}｜${n.url}`).join("\n")
      : "本日の新着企業ニュースはありませんでした。";

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject,
    text: content,
  });

  console.log("✅ メール送信完了");
}

sendEmail();
