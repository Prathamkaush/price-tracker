import { scrapeAmazon } from "../utils/scrapeAmazon.js";
import { scrapeFlipkart } from "../utils/scrapeFlipkart.js";
import { scrapeSnapdeal } from "../utils/scrapeSnapdeal.js";

export const getPrices = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const [amazon, flipkart, snapdeal] = await Promise.all([
      scrapeAmazon(query),
      scrapeFlipkart(query),
      scrapeSnapdeal(query),
    ]);

    res.json({ amazon, flipkart, snapdeal });
  } catch (error) {
    console.error("Error scraping:", error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
};
