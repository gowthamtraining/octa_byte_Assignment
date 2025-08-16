import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Define types for better type safety
interface Stock {
  id: number;
  particulars: string;
  purchasePrice: number;
  quantity: number;
  nseBse: string;
  sector: string;
  soldPrice?: number;
  fallbackCMP?: number;
}

interface StockWithData extends Stock {
  cmp: number;
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  peRatio: number | null;
  latestEarnings: number | null;
  dataSource: 'yahoo' | 'alpha' | 'fallback' | 'unavailable';
  lastUpdated: string;
}

interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercent: number;
}

interface PortfolioResponse {
  stocks: StockWithData[];
  sectors: SectorSummary[];
  summary: Omit<SectorSummary, 'sector'>;
  timestamp: string;
  cacheStatus: 'fresh' | 'cached';
}

// Stocks known to be unavailable on financial APIs
const UNAVAILABLE_STOCKS = new Set(['SAVANI', 'BAJAJHLDNG', 'GENSOL']);

// Complete portfolio data with fallback prices
const portfolioData: Stock[] = [
  // Financial Sector
  { id: 1, particulars: 'HDFC Bank', purchasePrice: 1490, quantity: 50, nseBse: 'HDFCBANK', sector: 'Financial', fallbackCMP: 1700.15 },
  { id: 2, particulars: 'Bajaj Finance', purchasePrice: 6466, quantity: 15, nseBse: 'BAJFINANCE', sector: 'Financial', fallbackCMP: 8419.6 },
  { id: 3, particulars: 'ICICI Bank', purchasePrice: 780, quantity: 84, nseBse: 'ICICIBANK', sector: 'Financial', fallbackCMP: 1215.5 },
  { id: 4, particulars: 'Bajaj Housing', purchasePrice: 130, quantity: 504, nseBse: 'BAJAJHLDNG', sector: 'Financial', fallbackCMP: 112.85 },
  { id: 5, particulars: 'Savani Financials', purchasePrice: 24, quantity: 1080, nseBse: 'SAVANI', sector: 'Financial', fallbackCMP: 14.86 },

  // Technology Sector
  { id: 10, particulars: 'Affle India', purchasePrice: 1151, quantity: 50, nseBse: 'AFFLE', sector: 'Technology', fallbackCMP: 1459.6 },
  { id: 11, particulars: 'LTI Mindtree', purchasePrice: 4775, quantity: 16, nseBse: 'LTIM', sector: 'Technology', fallbackCMP: 4793.8 },
  { id: 12, particulars: 'KPIT Tech', purchasePrice: 672, quantity: 61, nseBse: 'KPITTECH', sector: 'Technology', fallbackCMP: 1293.1 },
  { id: 13, particulars: 'Tata Tech', purchasePrice: 1072, quantity: 63, nseBse: 'TATATECH', sector: 'Technology', fallbackCMP: 662 },
  { id: 14, particulars: 'BLS E-Services', purchasePrice: 232, quantity: 191, nseBse: 'BLS', sector: 'Technology', fallbackCMP: 152.9 },
  { id: 15, particulars: 'Tanla', purchasePrice: 1134, quantity: 45, nseBse: 'TANLA', sector: 'Technology', fallbackCMP: 449.5 },

  // Consumer Sector
  { id: 17, particulars: 'Dmart', purchasePrice: 3777, quantity: 27, nseBse: 'DMART', sector: 'Consumer', fallbackCMP: 3451.1 },
  { id: 18, particulars: 'Tata Consumer', purchasePrice: 845, quantity: 90, nseBse: 'TATACONSUM', sector: 'Consumer', fallbackCMP: 961.1 },
  { id: 19, particulars: 'Pidilite', purchasePrice: 2376, quantity: 36, nseBse: 'PIDILITIND', sector: 'Consumer', fallbackCMP: 2730 },

  // Power Sector
  { id: 21, particulars: 'Tata Power', purchasePrice: 224, quantity: 225, nseBse: 'TATAPOWER', sector: 'Power', fallbackCMP: 351 },
  { id: 22, particulars: 'KPI Green', purchasePrice: 875, quantity: 50, nseBse: 'KPIGREEN', sector: 'Power', fallbackCMP: 402.4 },
  { id: 23, particulars: 'Suzlon', purchasePrice: 44, quantity: 450, nseBse: 'SUZLON', sector: 'Power', fallbackCMP: 51.36 },
  { id: 24, particulars: 'Gensol', purchasePrice: 998, quantity: 45, nseBse: 'GENSOL', sector: 'Power', fallbackCMP: 372.6 },

  // Pipe Sector
  { id: 26, particulars: 'Hariom Pipes', purchasePrice: 580, quantity: 60, nseBse: 'HARIOMPIPE', sector: 'Pipe', fallbackCMP: 355.75 },
  { id: 27, particulars: 'Astral', purchasePrice: 1517, quantity: 56, nseBse: 'ASTRAL', sector: 'Pipe', fallbackCMP: 1317.6 },
  { id: 28, particulars: 'Polycab', purchasePrice: 2818, quantity: 28, nseBse: 'POLYCAB', sector: 'Pipe', fallbackCMP: 5000 },

  // Others Sector
  { id: 30, particulars: 'Clean Science', purchasePrice: 1610, quantity: 32, nseBse: 'CLEAN', sector: 'Others', fallbackCMP: 1237.45 },
  { id: 31, particulars: 'Deepak Nitrite', purchasePrice: 2248, quantity: 27, nseBse: 'DEEPAKNTR', sector: 'Others', fallbackCMP: 1927.9 },
  { id: 32, particulars: 'Fine Organic', purchasePrice: 4284, quantity: 16, nseBse: 'FINEORG', sector: 'Others', fallbackCMP: 3743 },
  { id: 33, particulars: 'Gravita', purchasePrice: 2037, quantity: 8, nseBse: 'GRAVITA', sector: 'Others', fallbackCMP: 1614.2 },
  { id: 34, particulars: 'SBI Life', purchasePrice: 1197, quantity: 49, nseBse: 'SBILIFE', sector: 'Others', fallbackCMP: 1405.45 },

  // Sold Stocks
  { id: 38, particulars: 'Infy', purchasePrice: 1647, quantity: 36, nseBse: 'INFY', sector: 'Sold', soldPrice: 1920, fallbackCMP: 1725.3 },
  { id: 39, particulars: 'Happeist Mind', purchasePrice: 1103, quantity: 45, nseBse: 'HAPPSTMNDS', sector: 'Sold', soldPrice: 716, fallbackCMP: 701.65 },
  { id: 40, particulars: 'Easemytrip', purchasePrice: 20, quantity: 1332, nseBse: 'EASEMYTRIP', sector: 'Sold', soldPrice: 15.5, fallbackCMP: 11.51 }
];

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Helper function to format ticker symbols
function formatTicker(ticker: string): string {
  if (ticker.endsWith('.NS') || ticker.endsWith('.BO')) return ticker;
  return `${ticker}.NS`;
}

// Fetch stock data with multiple fallbacks
async function fetchStockData(ticker: string, fallbackPrice: number): Promise<{
  cmp: number;
  peRatio: number | null;
  latestEarnings: number | null;
  dataSource: 'yahoo' | 'alpha' | 'fallback' | 'unavailable';
}> {
  const baseTicker = ticker.replace('.NS', '');
  const formattedTicker = formatTicker(ticker);
  const cacheKey = `stock-${formattedTicker}`;
  const cached = cache.get(cacheKey);

  // Return cached data if available and not expired
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { ...cached.data, dataSource: 'cached' };
  }

  // Skip API calls for known unavailable stocks
  if (UNAVAILABLE_STOCKS.has(baseTicker)) {
    const result = {
      cmp: fallbackPrice,
      peRatio: null,
      latestEarnings: null,
      dataSource: 'unavailable' as const
    };
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  try {
    // Try Yahoo Finance first
    const yahooResponse = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${formattedTicker}`,
      { timeout: 3000 }
    );
    
    const yahooData = yahooResponse.data.chart.result[0]?.meta;
    if (!yahooData) throw new Error('Invalid Yahoo Finance response');

    const result = {
      cmp: yahooData.regularMarketPrice,
      peRatio: yahooData.trailingPE || null,
      latestEarnings: yahooData.epsTrailingTwelveMonths || null,
      dataSource: 'yahoo' as const
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (yahooError) {
    console.warn(`Yahoo Finance failed for ${formattedTicker}:`, yahooError.message);
    
    try {
      // Fallback to Alpha Vantage
      const alphaResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${formattedTicker}&apikey=demo`, // Replace with your API key
        { timeout: 3000 }
      );
      
      const alphaData = alphaResponse.data['Global Quote'];
      if (!alphaData) throw new Error('Invalid Alpha Vantage response');

      const result = {
        cmp: parseFloat(alphaData['05. price']),
        peRatio: alphaData['PE Ratio'] ? parseFloat(alphaData['PE Ratio']) : null,
        latestEarnings: null, // Alpha Vantage doesn't provide EPS in this endpoint
        dataSource: 'alpha' as const
      };

      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (alphaError) {
      console.warn(`Alpha Vantage failed for ${formattedTicker}:`, alphaError.message);
      
      // Final fallback to our local data
      return {
        cmp: fallbackPrice,
        peRatio: null,
        latestEarnings: null,
        dataSource: 'fallback' as const
      };
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PortfolioResponse | { error: string }>
) {
  try {
    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '-1');

    // Process all stocks in parallel
    const stocksWithData = await Promise.all(portfolioData.map(async (stock) => {
      const { cmp, peRatio, latestEarnings, dataSource } = await fetchStockData(
        stock.nseBse,
        stock.fallbackCMP || stock.purchasePrice * 1.1
      );

      const investment = stock.purchasePrice * stock.quantity;
      const presentValue = cmp * stock.quantity;
      const gainLoss = presentValue - investment;
      const gainLossPercent = (gainLoss / investment) * 100;

      return {
        ...stock,
        cmp,
        investment,
        presentValue,
        gainLoss,
        gainLossPercent,
        peRatio,
        latestEarnings,
        dataSource,
        lastUpdated: new Date().toISOString()
      };
    }));

    // Calculate sector summaries
const sectors = Array.from(new Set(portfolioData.map(stock => stock.sector)));
    const sectorSummaries: SectorSummary[] = sectors.map(sector => {
      const sectorStocks = stocksWithData.filter(stock => stock.sector === sector);
      const totalInvestment = sectorStocks.reduce((sum, stock) => sum + stock.investment, 0);
      const totalPresentValue = sectorStocks.reduce((sum, stock) => sum + stock.presentValue, 0);
      const totalGainLoss = totalPresentValue - totalInvestment;
      const gainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

      return {
        sector,
        totalInvestment,
        totalPresentValue,
        totalGainLoss,
        gainLossPercent
      };
    });

    // Calculate overall portfolio summary
    const totalInvestment = stocksWithData.reduce((sum, stock) => sum + stock.investment, 0);
    const totalPresentValue = stocksWithData.reduce((sum, stock) => sum + stock.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    // Determine if we're serving fresh or cached data
    const cacheStatus = stocksWithData.some(stock => stock.dataSource === 'cached') ? 'cached' : 'fresh';

    res.status(200).json({
      stocks: stocksWithData,
      sectors: sectorSummaries,
      summary: {
        totalInvestment,
        totalPresentValue,
        totalGainLoss,
        gainLossPercent: totalGainLossPercent
      },
      timestamp: new Date().toISOString(),
      cacheStatus
    });
  } catch (error) {
    console.error('Error processing portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
}