import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

export async function scrapeFlipkart(query) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // 👈 Run visible for testing
      slowMo: 100,     // 👈 Small delay between actions
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
      executablePath: puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Wait for product element
    await page.waitForSelector("a.s1Q9rs, ._4rR01T, a.CGtC98", { timeout: 15000 });

    const product = await page.evaluate(() => {
      const title =
        document.querySelector("a.s1Q9rs, ._4rR01T, a.CGtC98")?.innerText.trim() ||
        "Unknown Product";
      const priceText =
        document.querySelector("._30jeq3, .Nx9bqj")?.innerText.replace(/[₹,]/g, "") || null;
      const price = priceText ? parseInt(priceText) : null;
      const href =
        document.querySelector("a.s1Q9rs, a._1fQZEK, a.CGtC98")?.getAttribute("href") || "";
      const link = href ? `https://www.flipkart.com${href}` : "";
      const image =
        document.querySelector("img._396cs4, img._2r_T1I, img.DByuf4")?.getAttribute("src") || "";

      return { title, price, link, image };
    });

    console.log("✅ Product found:", product);
    await browser.close();
    return { site: "Flipkart", ...product };
  } catch (err) {
    console.error("Flipkart scraper failed:", err.message);
    if (browser) await browser.close();
    return { site: "Flipkart", error: err.message };
  }
}
