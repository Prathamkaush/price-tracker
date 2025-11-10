import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeAmazon(query) {
  const searchURL = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(searchURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(data);

    let productInfo = null;

    $("div[data-component-type='s-search-result']").each((_, el) => {
      const item = $(el);

      let href =
        item.find("a.a-link-normal.s-no-outline").attr("href") ||
        item.find("a.a-link-normal.s-underline-text").attr("href") ||
        "";

      // Skip sponsored links and ads
      if (!href || href.startsWith("/sspa/click")) return;

      // ✅ Only accept real Amazon product pages
      if (!href.includes("/dp/")) return;

      const title =
        item.find("h2 span").first().text().trim() ||
        item.find("span.a-size-medium").first().text().trim() ||
        "Unknown Product";

      const link = href.startsWith("http")
        ? href
        : `https://www.amazon.in${href}`;

      const priceText =
        item
          .find(".a-price-whole")
          .first()
          .text()
          .replace(/[₹,]/g, "")
          .trim() || null;
      const price = priceText ? parseInt(priceText) : null;

      const image =
        item.find("img.s-image").attr("src") ||
        "https://via.placeholder.com/150";

      productInfo = { site: "Amazon", title, price, link, image };
      return false; // break loop once found
    });

    if (!productInfo)
      return { site: "Amazon", error: "No organic product found" };

    return productInfo;
  } catch (error) {
    console.error("Amazon scraper failed:", error.message);
    return { site: "Amazon", error: "Failed to fetch data" };
  }
}
