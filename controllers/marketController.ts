/**
 * marketController — Real-time Market Data API layer
 * Fetches live prices, OHLCV chart data, and company fundamentals
 * from the Alpha Vantage-backed /market/ endpoints.
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';

// ── Types ──────────────────────────────────────────
export interface OHLCVPoint {
  t: string;   // date string
  o: number;   // open
  h: number;   // high
  l: number;   // low
  c: number;   // close
  v: number;   // volume
}

export interface QuoteData {
  symbol: string;
  price: number;
}

export interface FundamentalsData {
  name: string;
  description: string;
  sector: string;
  pe_ratio: string;
  dividend_yield: string;
  market_cap: string;
  '52_week_high': string;
  '52_week_low': string;
}

// ── API Calls ──────────────────────────────────────

/**
 * GET /market/chart?symbol=VOO&range=1M
 * Returns OHLCV points for rendering price charts.
 */
export async function fetchChartData(
  symbol: string,
  range: string = '1M'
): Promise<OHLCVPoint[]> {
  try {
    const res = await fetch(`${API_BASE}/market/chart?symbol=${symbol}&range=${range}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.warn('fetchChartData error:', e);
    return [];
  }
}

/**
 * GET /market/quote?symbol=VOO
 * Returns the latest live price for a symbol.
 */
export async function fetchQuote(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/market/quote?symbol=${symbol}`);
    if (!res.ok) return null;
    const json: QuoteData = await res.json();
    return json.price;
  } catch (e) {
    console.warn('fetchQuote error:', e);
    return null;
  }
}

/**
 * GET /market/fundamentals?symbol=VOO
 * Returns company overview / ETF details.
 */
export async function fetchFundamentals(
  symbol: string
): Promise<FundamentalsData | null> {
  try {
    const res = await fetch(`${API_BASE}/market/fundamentals?symbol=${symbol}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('fetchFundamentals error:', e);
    return null;
  }
}
