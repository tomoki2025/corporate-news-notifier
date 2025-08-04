const axios = require("axios");
const cheerio = require("cheerio");

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

async function fetchHtml(url) {
  const { data } = await axios.get(url);
  return cheerio.load(data);
}

module.exports = {
  normalize,
  fetchHtml,
};
