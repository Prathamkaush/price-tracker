import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeFlipkart(query) {
  const searchURL = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(searchURL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForSelector("a.s1Q9rs, ._4rR01T, a.CGtC98", {
      timeout: 15000,
    });

    const product = await page.evaluate(() => {
      const title =
        document.querySelector("a.s1Q9rs, ._4rR01T, a.CGtC98")?.innerText.trim() ||
        "Unknown Product";

      const priceText =
        document
          .querySelector("._30jeq3, .Nx9bqj")
          ?.innerText.replace(/[₹,]/g, "") || null;
      const price = priceText ? parseInt(priceText) : null;

      const href =
        document.querySelector("a.s1Q9rs, a._1fQZEK, a.CGtC98")?.getAttribute("href") || "";
      const link = href.startsWith("http")
        ? href
        : href
        ? `https://www.flipkart.com${href}`
        : "";

      const image =
        document.querySelector("img._396cs4, img._2r_T1I, img.DByuf4")?.getAttribute("src") ||
        "https://via.placeholder.com/150";

      return { title, price, link, image };
    });

    await browser.close();
    return { site: "Flipkart", ...product };
  } catch (error) {
    console.error("Flipkart scraper failed:", error.message);
    if (browser) await browser.close();
    return { site: "Flipkart", error: "Failed to fetch data" };
  }
}
