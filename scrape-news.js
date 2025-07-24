const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://10x.co.jp/news/';
const SITE_ID = '10X';
const OUTPUT_FILE = `./data/${SITE_ID}.json`;

async function getNews() {
  try {
    const { data: html } = await axios.get(TARGET_URL);
    const $ = cheerio.load(html);
    const articles = [];

    $('.link-card').each((_, el) => {
      const $el = $(el);
      const url = 'https://10x.co.jp' + $el.attr('href');
      const title = $el.find('.link-card-title').text().trim();
      const date = $el.find('.link-card-date').text().trim();
      const category = $el.find('.link-card-category').text().trim();
      const styleAttr = $el.find('.card-with-thumbnail-picture-content').attr('style');
      const imageUrl = styleAttr ? styleAttr.match(/url\\('(.+?)'\\)/)?.[1] || null : null;

      articles.push({ title, url, date, imageUrl, category });
    });

    console.log(`【${SITE_ID}】 found ${articles.length} elements`);

    // ./data ディレクトリがなければ作成
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8');

    return articles;
  } catch (err) {
    console.error(`Error scraping ${SITE_ID}:`, err);
    return [];
  }
}

module.exports = { getNews };
