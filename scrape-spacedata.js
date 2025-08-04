const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'https://spacedata.jp/news';
const dataDir = path.join(__dirname, 'data');
const outputFile = path.join(dataDir, 'spacedata.json');
const newFile = path.join(dataDir, 'spacedata_new.json');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  try {
    await page.waitForSelector('a.sd.appear', { timeout: 30000 });

    // ニュース記事へのURLだけを抽出
    const articleLinks = await page.$$eval('a.sd.appear', as =>
      as
        .map(a => a.href)
        .filter(href =>
          href.includes('/news/') &&
          !href.includes('/category') &&
          !href.endsWith('/news') &&
          !href.includes('company') &&
          !href.includes('recruit') &&
          !href.includes('case') &&
          !href.includes('contact') &&
          !href.includes('youtube') &&
          !href.includes('x.com') &&
          !href.includes('instagram') &&
          !href.includes('linkedin')
        )
    );

    const articles = [];

    for (const link of articleLinks) {
      try {
        const articlePage = await browser.newPage();
        await articlePage.goto(link, { waitUntil: 'domcontentloaded', timeout: 0 });

        const result = await articlePage.evaluate(() => {
          const dateMatch = document.body.innerText.match(/\d{4}\/\d{1,2}\/\d{1,2}/);
          const date = dateMatch ? dateMatch[0] : null;

          const titleEl = document.querySelector('main h1');
          const title = titleEl ? titleEl.innerText.trim() : null;

          const p = document.querySelector('main p');
          const summary = p ? p.innerText.trim().replace(/\s+/g, ' ') : null;

          return { date, title, summary };
        });

        if (result.title && result.date && result.summary) {
          articles.push({
            company: 'SpaceData',
            date: result.date,
            title: result.title,
            summary: result.summary,
            url: link
          });
        }

        await articlePage.close();
      } catch (e) {
        console.warn(`⚠️ 記事取得失敗: ${link}`);
      }
    }

    // data/ フォルダ作成
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    let oldArticles = [];
    if (fs.existsSync(outputFile)) {
      oldArticles = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    }

    const newArticles = articles.filter(a => !oldArticles.some(old => old.url === a.url));

    fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2));

    if (newArticles.length > 0) {
      fs.writeFileSync(newFile, JSON.stringify(newArticles, null, 2));
      console.log('🆕 spacedata_new.json に新着を書き込みました');
    } else {
      console.log('✅ 新着ニュースはありません');
    }

  } catch (err) {
    console.error(`❌ セレクタ取得失敗: ${err.message}`);
  } finally {
    await browser.close();
  }
})();
