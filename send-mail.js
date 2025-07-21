// send-mail.js
const nodemailer = require('nodemailer');

async function sendEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tomokikadotani2020@gmail.com',
      pass: 'uzdyknfnrpgpgmlm' // アプリパスワード（スペースなし）
    }
  });

  const info = await transporter.sendMail({
    from: '"通知ボット" <あなたのGmailアドレス>',
    to: 'tomokikadotani2020@gmail.com',
    subject: '定期通知テスト',
    text: 'これはGitHub Actionsからの定期通知です。',
  });

  console.log('メール送信成功:', info.messageId);
}

sendEmail().catch(console.error);
