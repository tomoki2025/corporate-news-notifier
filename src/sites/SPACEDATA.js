module.exports = {
  url: 'https://spacedata.jp/news',
  siteName: 'SPACEDATA',
  articleSelector: "a.sd.appear",
  getArticleData: async (page, element) => {
    const title = await element.$eval("h2", el => el.innerText.trim());
    const url = await element.evaluate(el => el.href);
    const date = await element.$eval("time", el => el.innerText.trim());

    return { title, url, date };
  }
};
