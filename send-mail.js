const nodemailer = require('nodemailer');

async function sendMail(subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"News Notifier" <${process.env.MAIL_USER}>`,
    to: 'tomokikadotani@kddi.com', // ←ここに通知を受け取りたい宛先を記入
    subject,
    text,
  });

  console.log('Email sent:', info.response);
}

module.exports = sendMail;
