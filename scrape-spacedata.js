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
    // セレクタが出現するまで待機
    await page.waitForSelector('a.sd.appear', { timeout: 30000 });

    // 要素抽出 ＋ 不要リンク除外
    const anchors = await page.$$eval('a.sd.appear', as =>
      as
        .map(a => ({
          title: a.innerText.trim(),
          url: a.href,
          company: "SpaceData",
          date: new Date().toISOString().split('T')[0]
        }))
        .filter(item =>
          item.url.includes('/news/') &&
          !item.url.includes('/category') &&
          !item.url.endsWith('/news') &&
          !item.url.includes('company') &&
          !item.url.includes('recruit') &&
          !item.url.includes('case') &&
          !item.url.includes('contact') &&
          !item.url.includes('youtube') &&
          !item.url.includes('x.com') &&
          !item.url.includes('instagram') &&
          !item.url.includes('linkedin')
        )
    );

    console.log(`✅ anchor length: ${anchors.length}`);
    console.log(`✅ first anchor sample: ${anchors[0] ? anchors[0].title : 'N/A'}`);

    // dataディレクトリがなければ作成
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // 既存データ読み込み
    let oldArticles = [];
    if (fs.existsSync(outputFile)) {
      oldArticles = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    }

    // 差分抽出
    const newArticles = anchors.filter(
      a => !oldArticles.some(old => old.url === a.url)
    );

    // 全データ保存（旧ファイル）
    fs.writeFileSync(outputFile, JSON.stringify(anchors, null, 2));

    // 新着だけ保存（通知用）
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
