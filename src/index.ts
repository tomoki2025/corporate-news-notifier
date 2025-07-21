import { scrapeSpacely } from './sites/Spacely'

async function main() {
  const articles = await scrapeSpacely()

  console.log("📰 新着ニュース一覧:")
  for (const article of articles) {
    console.log(`- ${article.title}: ${article.url}`)
  }
}

main()
