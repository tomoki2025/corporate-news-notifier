const fs = require("fs");

async function getNews() {
  const filePath = "./data/news.json";

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const data = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveNews(news) {
  fs.writeFileSync("./data/news.json", JSON.stringify(news, null, 2));
}

module.exports = { getNews, saveNews };
