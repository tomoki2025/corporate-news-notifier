const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'spacedata.json');
const diffPath = path.join(__dirname, 'data', 'spacedata_diff.json');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('https://spacedata.jp/news', { waitUntil: 'networkidle2' });

  // 必要に応じて描画を待つ
  await new Promise(resolve => setTimeout(resolve, 3000));

  const articles = await page.$$eval('a.sd.appear', links =>
    links.map(link => {
      const ps = link.querySelectorAll('p.text.sd.appear');

      return {
        title: ps[2]?.innerText.trim() || '',             // タイトル文
        date: ps[0]?.innerText.trim() || '',              // 公開日
        category: ps[1]?.innerText.trim() || '',          // ニュース／プレスリリース等
        summary: ps[3]?.innerText.trim() || '',           // 本文リード文
        url: new URL(link.getAttribute('href'), 'https://spacedata.jp').toString()
      };
    })
  );

  // 差分検出（URLで判定）
  let oldArticles = [];
  if (fs.existsSync(filePath)) {
    oldArticles = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  const oldUrls = oldArticles.map(a => a.url);
  const newArticles = articles.filter(a => !oldUrls.includes(a.url));

  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
  fs.writeFileSync(diffPath, JSON.stringify(newArticles, null, 2));

  console.log('✅ 完了：記事取得件数 =', articles.length, ' 差分 =', newArticles.length);

  await browser.close();
})();
