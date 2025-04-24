import { formatPrice, convertToToman } from '../utils/helpers'; // Adjust path if needed

// ---------------------- Constants (URLs and Asset Definitions) ----------------------

const CHANDE_URL = 'https://chande.net';
const TGJU_BASE_URL = 'https://www.tgju.org/profile';

// Define structure/keys expected by the screens
const CURRENCIES = [
  // Note: fetchCode should match the exact text used in the <th> tag on chande.net
  { key: 'usd', fetchCode: 'USD', title: 'دلار آمریکا', unit: 'تومان' },
  { key: 'eur', fetchCode: 'EUR', title: 'یورو', unit: 'تومان' },
  { key: 'gbp', fetchCode: 'GBP', title: 'پوند', unit: 'تومان' },
  { key: 'aed', fetchCode: 'AED', title: 'درهم', unit: 'تومان' },
];

const GOLD_ASSETS = [
  { key: 'geram18', title: 'طلا 18 عیار', unit: 'تومان', url: `${TGJU_BASE_URL}/geram18` },
  // { key: 'ons', title: 'انس جهانی طلا', unit: 'دلار', url: `${TGJU_BASE_URL}/ons` }, // Needs different parsing/unit handling
  { key: 'mithqal', title: 'مثقال طلا', unit: 'تومان', url: `${TGJU_BASE_URL}/mesghal` },
  { key: 'geram24', title: 'طلای ۲۴ عیار', unit: 'تومان', url: `${TGJU_BASE_URL}/geram24` },
  //{ key: 'abshode', title: 'آبشده نقدی', unit: 'تومان', url: `${TGJU_BASE_URL}/gold_futures` }, // Need correct key from API/HTML if used
];

const COIN_ASSETS = [
  { key: 'emami', title: 'سکه امامی', unit: 'تومان', url: `${TGJU_BASE_URL}/sekee` },
  { key: 'baharAzadi', title: 'سکه بهار آزادی', unit: 'تومان', url: `${TGJU_BASE_URL}/sekeb` }, // URL might need checking
  { key: 'nim', title: 'نیم سکه', unit: 'تومان', url: `${TGJU_BASE_URL}/nim` },
  { key: 'rob', title: 'ربع سکه', unit: 'تومان', url: `${TGJU_BASE_URL}/rob` },
  { key: 'gerami', title: 'سکه گرمی', unit: 'تومان', url: `${TGJU_BASE_URL}/gerami` },
];

// ---------------------- Helper: Fetch and Parse HTML ----------------------

const fetchHtml = async (url, caller = '') => {
  console.log(`[${caller}] Fetching HTML from: ${url}`);
  try {
    // Using a timeout to prevent hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(url, {
      signal: controller.signal, // Add abort signal
      headers: { // Add headers to mimic browser request
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8',
        'Cache-Control': 'no-cache', // Try to avoid cached results
        'Pragma': 'no-cache',
      }
    });

    clearTimeout(timeoutId); // Clear timeout if fetch completes

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }
    const html = await response.text();
    console.log(`[${caller}] Successfully fetched HTML from: ${url} (Length: ${html.length})`);
    return html;
  } catch (error) {
    if (error.name === 'AbortError') {
        console.error(`[${caller}] Fetch timeout for ${url}:`, error);
    } else {
        console.error(`[${caller}] Error fetching HTML from ${url}:`, error);
    }
    return null; // Return null on fetch error or timeout
  }
};

const parsePrice = (html, regex, identifier) => {
  if (!html) return "erorr";
  try {
    const match = html.match(regex);
    if (match && match[1]) {
      // Clean the string: remove commas, maybe extra spaces, etc.
      const priceString = match[1].replace(/,/g, '').trim();
      const price = parseFloat(priceString);
      if (!isNaN(price)) {
        console.log(`[Parser] Found price for ${identifier}: ${price}`);
        return price;
      } else {
          console.warn(`[Parser] Parsed string "${priceString}" is not a valid number for ${identifier}.`);
          return "erorr";
      }
    }
    console.warn(`[Parser] Could not find price for ${identifier} using regex: ${regex}`);
    return "erorr";
  } catch (error) {
    console.error(`[Parser] Error parsing price for ${identifier}:`, error);
    return "erorr";
  }
};

// ---------------------- Scraping Functions ----------------------

const fetchPriceFromChande = async (currencyCode) => {
  const html = await fetchHtml(CHANDE_URL, `fetchPriceFromChande(${currencyCode})`);
  // Regex looks for <th>CurrencyCode</th> followed by <td>Price</td>
  const regex = new RegExp(`<th.*?>${currencyCode}</th>.*?<td.*?>(.*?)<\\/td>`, 'is'); // 'is' flags: case-insensitive, dotall
  return parsePrice(html, regex, `Chande-${currencyCode}`);
};

const fetchPriceFromTGJUPage = async (url, identifier) => {
  const html = await fetchHtml(url, `fetchPriceFromTGJUPage(${identifier})`);
  // Regex targeting the specific price span/td on TGJU pages
  // Note: This is fragile and might break if TGJU changes layout.
  // Example: Look for <td class="info-price">123,456</td> or similar structure
  const regex = /<td\s+class=["']info-price["'][^>]*>([\d,]+)<\/td>/is; // More specific
  let price = parsePrice(html, regex, `TGJU-${identifier}`);

  // Fallback regex if the primary one fails (less specific)
  if (price === "erorr" && html) {
      console.warn(`[Parser] Primary regex failed for TGJU-${identifier}. Trying fallback.`);
      // Looks for any <td> containing numbers and commas, hoping it's the price
      const fallbackRegex = /<td[^>]*>([\d,]+)<\/td>/is;
      price = parsePrice(html, fallbackRegex, `TGJU-${identifier}-Fallback`);
  }
  return price;
};

// ---------------------- Exported API Functions ----------------------

export const fetchCurrencyPrices = async () => {
  console.log('[API] Fetching currency prices (all from Chande)...');
  const prices = {};
  // Fetch all currencies in parallel
  const promises = CURRENCIES.map(async (currency) => {
    const price = await fetchPriceFromChande(currency.fetchCode);
    prices[currency.key] = price; // Store using the key (e.g., 'usd', 'eur')
  });

  await Promise.all(promises); // Wait for all fetches to complete
  console.log('[API] Currency prices fetched:', prices);
  return prices; // Return object: { usd: price, eur: price, ... }
};

export const fetchCurrencyRates = async () => {
  console.log('[API] Fetching currency rates (based on Chande)...');
  const rates = {};
  // Fetch all in parallel
  const promises = CURRENCIES.map(async (currency) => {
    const price = await fetchPriceFromChande(currency.fetchCode);
    // Use null if fetch fails or price is not a number
    rates[currency.key] = (price === "erorr" || isNaN(price)) ? null : price;
  });

  await Promise.all(promises);

  // --- Normalize rates against USD ---
  const usdRate = rates.usd;
  if (usdRate && typeof usdRate === 'number' && usdRate !== 0) {
      for (const key in rates) {
          if (rates[key] && typeof rates[key] === 'number') {
              rates[key] = rates[key] / usdRate; // Normalize against USD
          } else {
              rates[key] = null; // Keep as null if original fetch failed
          }
      }
       rates.usd = 1.0; // Explicitly set USD rate to 1
  } else {
      console.error('[API] Could not determine USD rate from Chande for normalization. Returning null rates.');
      // Set all rates to null if USD base rate is invalid
       CURRENCIES.forEach(c => { rates[c.key] = null; });
  }
  // --- End Normalization ---

  console.log('[API] Currency rates calculated:', rates);
  return rates; // Returns { usd: 1, eur: rate_vs_usd, ... } or nulls on error
};

export const fetchGoldPrices = async () => {
  console.log('[API] Fetching gold prices from TGJU...');
  const prices = {};
  const promises = GOLD_ASSETS.map(async (asset) => {
    const price = await fetchPriceFromTGJUPage(asset.url, asset.key);
    // Convert to Toman as per original logic (assuming TGJU gives Rial)
    prices[asset.key] = (price === "erorr" || isNaN(price)) ? "erorr" : convertToToman(price);
  });

  await Promise.all(promises);
  console.log('[API] Gold prices fetched:', prices);
  return prices; // Return object: { geram18: price, mithqal: price, ...}
};

export const fetchCoinPrices = async () => {
  console.log('[API] Fetching coin prices from TGJU...');
  const prices = {};
  const promises = COIN_ASSETS.map(async (asset) => {
    const price = await fetchPriceFromTGJUPage(asset.url, asset.key);
     // Convert to Toman as per original logic (assuming TGJU gives Rial)
     prices[asset.key] = (price === "erorr" || isNaN(price)) ? "erorr" : convertToToman(price);
  });

  await Promise.all(promises);
  console.log('[API] Coin prices fetched:', prices);
  return prices; // Return object: { emami: price, baharAzadi: price, ...}
};