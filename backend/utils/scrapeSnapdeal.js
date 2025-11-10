import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeSnapdeal(query) {
  const searchURL = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;

  try {
    const { data } = await axios.get(searchURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.snapdeal.com/",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        Connection: "keep-alive",
      },
    });

    const $ = cheerio.load(data);
    const firstProduct = $(".product-tuple-listing").first();

    if (!firstProduct.length) {
      return { site: "Snapdeal", error: "No products found" };
    }

    const title =
      firstProduct.find(".product-title").text().trim() ||
      firstProduct.find(".product-title").attr("title") ||
      "Unknown Product";

    const link =
      "https://www.snapdeal.com" +
      (firstProduct.find(".dp-widget-link").attr("href") || "");

    const image =
      firstProduct.find("img.product-image").attr("src") ||
      firstProduct.find("img").attr("data-src") ||
      "https://via.placeholder.com/150";

    let priceText =
      firstProduct.find(".product-price").text().trim() ||
      firstProduct.find(".lfloat.product-price").text().trim() ||
      firstProduct.find("[data-price]").attr("data-price") ||
      "";

    priceText = priceText.replace(/(Rs\.?|₹|\s|,)/g, "").trim();
    const price = priceText ? parseInt(priceText) : null;

    return { site: "Snapdeal", title, price, link, image };
  } catch (error) {
    console.error("Snapdeal scraper failed:", error.message);
    return { site: "Snapdeal", error: "Failed to fetch data" };
  }
}
