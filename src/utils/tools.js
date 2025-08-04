const axios = require("axios");
const cheerio = require("cheerio");

// テキストを整える関数（空白詰めなど）
function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

// 指定URLのHTMLを取得してcheerioでパースする関数
async function fetchHtml(url) {
  const { data } = await axios.get(url);
  return cheerio.load(data);
}

module.exports = {
  normalize,
  fetchHtml,
};
