const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://spacedata.jp/news', { waitUntil: 'domcontentloaded' });

  const articles = await page.$$eval('a.sd.appear', (links) => {
    return links.map((el) => {
      const href = el.getAttribute('href');
      const textBlocks = el.querySelectorAll('p');
      const dateText = textBlocks.length >= 1 ? textBlocks[0].textContent.trim() : '';
      const category = textBlocks.length >= 2 ? textBlocks[1].textContent.trim() : '';
      const title = textBlocks.length >= 3 ? textBlocks[2].textContent.trim() : '';
      const description = textBlocks.length >= 4 ? textBlocks[3].textContent.trim() : '';
      return {
        date: dateText,
        category,
        title,
        description,
        url: 'https://spacedata.jp/' + href
      };
    });
  });

  await browser.close();

  // 保存先
  const filePath = path.resolve(__dirname, 'spacedata.json');
  const prevData = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : [];

  // 差分取得
  const newArticles = articles.filter(
    (article) => !prevData.some((prev) => prev.url === article.url)
  );

  // 保存
  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));

  // 差分出力
  const diffPath = path.resolve(__dirname, 'spacedata_diff.json');
  fs.writeFileSync(diffPath, JSON.stringify(newArticles, null, 2));

  console.log('✅ Scraping completed. New articles:', newArticles.length);
})();
