const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const dataDir = path.join(__dirname, "data");
const outputPath = path.join(dataDir, "spacedata_new.json");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  const url = "https://spacedata.jp/news";

  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

    // HTMLを一旦保存（デバッグ用）
    const html = await page.content();
    fs.writeFileSync(path.join(dataDir, "debug_spacedata.html"), html);

    // セレクタの待機（SpaceDataに合った構造）
    await page.waitForSelector(".news-items li a.news-link", { timeout: 30000 });

    // 記事の取得
    const articles = await page.$$eval(".news-items li a.news-link", anchors =>
      anchors.map(a => ({
        title: a.innerText.trim(),
        url: a.href
      })).filter(a => a.title && a.url)
    );

    // 結果を保存
    fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), "utf8");
    console.log("✅ SpaceData記事の取得に成功しました。");
  } catch (error) {
    console.error("❌ スクレイピングエラー:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
