import axios from "axios";
import * as cheerio from "cheerio";

// Rotating browser user-agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

export async function scrapeSnapdeal(query) {
  const searchURL = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  try {
    // random delay (1–2s)
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

    const { data } = await axios.get(searchURL, {
      headers: {
        "User-Agent": userAgent,
        "Accept-Language": "en-US,en;q=0.9",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        Referer: "https://www.google.com/",
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
    return { site: "Snapdeal", error: "Blocked by Snapdeal" };
  }
}
