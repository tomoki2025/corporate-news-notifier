const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://spacedata.jp/news", { waitUntil: "domcontentloaded" });

  // 十分な描画時間を確保（5秒）
  await page.waitForTimeout(5000);

  const articles = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a.sd.appear"));
    return anchors.map(a => ({
      title: a.textContent.trim(),
      url: a.href,
      date: (a.querySelector("p")?.textContent || "").trim()
    }));
  });

  // 保存先ディレクトリ作成
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // 保存先ファイル
  const filePath = path.join(dataDir, "spacedata.json");

  // 既存データの読み込み
  let existing = [];
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  // 差分抽出
  const existingUrls = new Set(existing.map(a => a.url));
  const newArticles = articles.filter(a => !existingUrls.has(a.url));

  // 保存
  fs.writeFileSync(filePath, JSON.stringify([...newArticles, ...existing], null, 2));

  // 出力
  console.log("取得した記事数:", newArticles.length);
  console.log(newArticles);

  await browser.close();
})();
