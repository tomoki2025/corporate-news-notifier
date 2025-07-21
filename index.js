const sendMail = require('./send-mail');

(async () => {
  try {
    await sendMail(
      '📰 ニューススクレイピング完了',
      'スクレイピング処理が正常に完了しました。'
    );
  } catch (error) {
    console.error('メール送信に失敗しました:', error);
    process.exit(1);
  }
})();
