const fs = require("fs");
const path = require("path");

async function getNews() {
  const results = {};
  const sitesDir = path.join(__dirname, "src", "sites");

  const siteFiles = fs
    .readdirSync(sitesDir)
    .filter((file) => file.endsWith(".js"));

  for (const file of siteFiles) {
    const sitePath = path.join(sitesDir, file);
    const siteName = path.basename(file, ".js");

    try {
      console.log(`🚀 スクレイピング開始: ${siteName}`);
      const scrape = require(sitePath);
      const siteNews = await scrape(); // 各scrape関数は配列を返す前提
      if (siteNews && siteNews.length > 0) {
        results[siteName] = siteNews;
      }
      console.log(`✅ 完了: ${siteName}\n`);
    } catch (err) {
      console.error(`❌ エラー（${siteName}）: ${err.message}`);
    }
  }

  return results;
}

module.exports = getNews;
