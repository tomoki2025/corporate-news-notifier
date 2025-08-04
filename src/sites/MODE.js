const { fetchHtml, normalize } = require("./base");

const BASE_URL = "https://www.tinkermode.jp/news";

async function scrapeMODE() {
  const $ = await fetchHtml(BASE_URL);

  const articles = [];

  $(".article").each((_, el) => {
    const title = normalize($(el).find(".title").text());
    const url = new URL($(el).find("a").attr("href"), BASE_URL).href;
    const date = normalize($(el).find(".date").text());
    const summary = normalize($(el).find(".text").text());

    // 実データがないものは除外
    if (title && url && date) {
      articles.push({
        company: "MODE",
        date,
        title,
        url,
        summary,
      });
    }
  });

  return articles;
}

module.exports = scrapeMODE;
