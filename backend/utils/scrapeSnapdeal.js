import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeSnapdeal(query) {
  const searchURL = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;

  try {
    const { data } = await axios.get(searchURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(data);

    // Select the first valid product
    const firstProduct = $(".product-tuple-listing").first();
    if (!firstProduct.length) {
      return { site: "Snapdeal", error: "No products found" };
    }

    const title =
      firstProduct.find(".product-title").text().trim() ||
      firstProduct.find(".product-title").attr("title") ||
      "Unknown Product";

    const link =
      firstProduct.find(".dp-widget-link").attr("href") ||
      firstProduct.find("a").attr("href") ||
      "";

    const image =
      firstProduct.find("img.product-image").attr("src") ||
      firstProduct.find("img").attr("data-src") ||
      "https://via.placeholder.com/150";

    // 🧠 New: More robust price extraction
    let priceText =
      firstProduct.find(".product-price").text().trim() ||
      firstProduct.find(".lfloat.product-price").text().trim() ||
      firstProduct.find("[data-price]").attr("data-price") ||
      "";

    // Clean up “Rs.” or “₹” and commas
    priceText = priceText.replace(/(Rs\.?|₹|\s|,)/g, "").trim();
    const price = priceText ? parseInt(priceText) : null;

    return { site: "Snapdeal", title, price, link, image };
  } catch (error) {
    console.error("Snapdeal scraper failed:", error.message);
    return { site: "Snapdeal", error: "Failed to fetch data" };
  }
}
