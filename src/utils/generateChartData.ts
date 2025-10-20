import { ChartData } from "@/components/custom-chart";
import { ParsedBinanceKline } from "@/types/general.types";

interface CryptoConfig {
  startingPrice: number;
  volatilityMultiplier: number;
  growthFactor: number;
  baseVolatility: number;
  minPrice: number;
  // Price targets for different bull run peaks
  peak2013: number;
  peak2017: number;
  peak2021: number;
  peak2025: number;
}

const CRYPTO_CONFIGS: { [key: string]: CryptoConfig } = {
  BTC: {
    startingPrice: 13.5,
    volatilityMultiplier: 1.0,
    growthFactor: 1.0,
    baseVolatility: 0.045,  // Increased from 0.025 for more variation
    minPrice: 10,
    peak2013: 1200,
    peak2017: 19800,
    peak2021: 68900,
    peak2025: 95000,
  },
  ETH: {
    startingPrice: 0.75,
    volatilityMultiplier: 1.2,
    growthFactor: 1.18,
    baseVolatility: 0.055,  // Increased from 0.035 for more variation
    minPrice: 0.5,
    peak2013: 2.5,
    peak2017: 1420,
    peak2021: 4850,
    peak2025: 6800,
  },
  BNB: {
    startingPrice: 0.1,
    volatilityMultiplier: 1.3,
    growthFactor: 1.3,
    baseVolatility: 0.06,  // Increased from 0.04 for more variation
    minPrice: 0.05,
    peak2013: 0.5,
    peak2017: 25,
    peak2021: 690,
    peak2025: 850,
  },
  SOL: {
    startingPrice: 0.22,
    volatilityMultiplier: 1.6,
    growthFactor: 1.55,
    baseVolatility: 0.075,  // Increased from 0.055 for more variation
    minPrice: 0.1,
    peak2013: 1.2,
    peak2017: 8.5,
    peak2021: 260,
    peak2025: 380,
  },
  XRP: {
    startingPrice: 0.0058,
    volatilityMultiplier: 1.1,
    growthFactor: 1.05,
    baseVolatility: 0.05,  // Increased from 0.03 for more variation
    minPrice: 0.003,
    peak2013: 0.025,
    peak2017: 3.84,
    peak2021: 1.96,
    peak2025: 2.85,
  },
  ADA: {
    startingPrice: 0.02,
    volatilityMultiplier: 1.15,
    growthFactor: 1.12,
    baseVolatility: 0.052,  // Increased from 0.032 for more variation
    minPrice: 0.01,
    peak2013: 0.08,
    peak2017: 1.25,
    peak2021: 3.09,
    peak2025: 4.2,
  },
  DOGE: {
    startingPrice: 0.00029,
    volatilityMultiplier: 2.2,
    growthFactor: 1.28,
    baseVolatility: 0.085,  // Increased from 0.065 for more variation
    minPrice: 0.0001,
    peak2013: 0.0015,
    peak2017: 0.017,
    peak2021: 0.73,
    peak2025: 0.95,
  },
  MATIC: {
    startingPrice: 0.0035,
    volatilityMultiplier: 1.45,
    growthFactor: 1.35,
    baseVolatility: 0.065,  // Increased from 0.045 for more variation
    minPrice: 0.002,
    peak2013: 0.015,
    peak2017: 0.12,
    peak2021: 2.92,
    peak2025: 3.8,
  },
};

const CURRENCY_MULTIPLIERS: { [key: string]: number } = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  USDT: 1.0,
  USDC: 1.0,
};

// Helper function to calculate target price at any given day
const getTargetPrice = (day: number, config: CryptoConfig): number => {
  // Define key dates (days from 2013-01-01)
  const peak2013Day = 350; // Dec 2013
  const bottom2015Day = 730; // Jan 2015
  const peak2017Day = 1790; // Dec 2017
  const bottom2018Day = 2180; // Dec 2018
  const peak2021Day = 3195; // Nov 2021
  const bottom2022Day = 3530; // Nov 2022
  const peak2025Day = 4600; // Oct 2025

  // Use linear interpolation between peaks
  if (day <= peak2013Day) {
    // Growth from start to 2013 peak
    const progress = day / peak2013Day;
    return config.startingPrice + (config.peak2013 - config.startingPrice) * progress;
  } else if (day <= bottom2015Day) {
    // Crash from 2013 peak to 2015 bottom
    const progress = (day - peak2013Day) / (bottom2015Day - peak2013Day);
    const bottom = config.peak2013 * 0.15; // Bottom is ~15% of peak
    return config.peak2013 - (config.peak2013 - bottom) * progress;
  } else if (day <= peak2017Day) {
    // Recovery and bull run to 2017 peak
    const progress = (day - bottom2015Day) / (peak2017Day - bottom2015Day);
    const bottom = config.peak2013 * 0.15;
    return bottom + (config.peak2017 - bottom) * Math.pow(progress, 0.7);
  } else if (day <= bottom2018Day) {
    // 2018 crash
    const progress = (day - peak2017Day) / (bottom2018Day - peak2017Day);
    const bottom = config.peak2017 * 0.18;
    return config.peak2017 - (config.peak2017 - bottom) * progress;
  } else if (day <= peak2021Day) {
    // 2019-2021 bull run
    const progress = (day - bottom2018Day) / (peak2021Day - bottom2018Day);
    const bottom = config.peak2017 * 0.18;
    return bottom + (config.peak2021 - bottom) * Math.pow(progress, 0.65);
  } else if (day <= bottom2022Day) {
    // 2022 bear market
    const progress = (day - peak2021Day) / (bottom2022Day - peak2021Day);
    const bottom = config.peak2021 * 0.22;
    return config.peak2021 - (config.peak2021 - bottom) * progress;
  } else {
    // 2023-2025 recovery and bull run
    const progress = (day - bottom2022Day) / (peak2025Day - bottom2022Day);
    const bottom = config.peak2021 * 0.22;
    return bottom + (config.peak2025 - bottom) * Math.pow(progress, 0.75);
  }
};

export const generateRealisticTradingData = (
  baseSymbol: string = "BTC",
  destinationSymbol: string = "USD"
): ChartData[] => {
  const config = CRYPTO_CONFIGS[baseSymbol] || CRYPTO_CONFIGS.BTC;
  const currencyMultiplier = CURRENCY_MULTIPLIERS[destinationSymbol] || 1.0;

  const startDate = new Date(2013, 0, 1); // Start from Jan 2013
  const endDate = new Date(2025, 9, 1); // Oct 2025
  const daysBetween = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const data: ChartData[] = [];
  
  // Use a seeded random for consistency per crypto
  const seedRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };
  
  const random = seedRandom(baseSymbol.charCodeAt(0) * 1000);

  for (let i = 0; i < daysBetween; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Get target price for this day
    const targetPrice = getTargetPrice(i, config);
    
    // Determine volatility based on market phase
    let volatility = config.baseVolatility;
    
    // Define key dates for volatility adjustments
    const peak2013Day = 350;
    const bottom2015Day = 730;
    const peak2017Day = 1790;
    const bottom2018Day = 2180;
    const peak2021Day = 3195;
    const bottom2022Day = 3530;
    
    // Increase volatility during bull runs and crashes for more dramatic variations
    if ((i > 300 && i < 400) || // 2013 peak
        (i > 1700 && i < 1900) || // 2017 peak
        (i > 3100 && i < 3300)) { // 2021 peak
      volatility *= 3.5;  // Increased from 2.0 for more dramatic peaks
    } else if ((i > peak2013Day && i < bottom2015Day) || // 2014-2015 crash
               (i > peak2017Day && i < bottom2018Day) || // 2018 crash
               (i > peak2021Day && i < bottom2022Day)) { // 2022 crash
      volatility *= 2.5;  // Increased from 1.5 for more dramatic crashes
    }
    
    // Add daily random variation around the target
    const dailyChange = (random() - 0.5) * 2 * volatility;
    let price = targetPrice * (1 + dailyChange);
    
    // Add occasional large moves (flash crashes, pumps)
    if (random() < 0.015) {
      const bigMove = (random() - 0.5) * 0.2;
      price *= (1 + bigMove);
    }
    
    // Apply smooth transition from previous day if exists
    if (data.length > 0) {
      const prevPrice = data[data.length - 1].price;
      // Blend 85% new price with 15% previous to allow more variation while avoiding jumps
      price = price * 0.85 + prevPrice * 0.15;
    }
    
    // Apply currency multiplier
    price = price * currencyMultiplier;
    
    // Ensure price doesn't go below minimum
    price = Math.max(price, config.minPrice * currencyMultiplier);

    // Calculate 200-week moving average (approximately 1400 days)
    const maWindow = 1400;
    let ma2Year = price;
    if (i >= maWindow) {
      const startIdx = Math.max(0, i - maWindow);
      let sum = 0;
      for (let j = startIdx; j < i; j++) {
        sum += data[j].price;
      }
      ma2Year = sum / (i - startIdx);
    } else if (data.length > 0) {
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        sum += data[j].price;
      }
      ma2Year = sum / data.length;
    }

    // Calculate additional lines with more variation to fill graph space
    const profitLine = ma2Year * 3.5; // Profit line at 3.5x the 200W MA (increased from 2.5x)
    const lossLine = ma2Year * 0.5; // Loss line at 0.5x the 200W MA (decreased from 0.8x)
    const avgLine = (price + ma2Year) / 2; // Average of current price and MA

    data.push({
      date: date,
      price: price,
      ma2Year: ma2Year,
      multiplier: price / ma2Year,
      profitLine: profitLine,
      lossLine: lossLine,
      avgLine: avgLine,
    });
  }

  return data;
};




export function mapBinanceKline(data: any[]): ParsedBinanceKline {
  return {
    openTime: data[0],
    open: parseFloat(data[1]),
    high: parseFloat(data[2]),
    low: parseFloat(data[3]),
    close: parseFloat(data[4]),
    volume: parseFloat(data[5]),
    closeTime: data[6],
    quoteAssetVolume: parseFloat(data[7]),
    numberOfTrades: data[8],
    takerBuyBaseVolume: parseFloat(data[9]),
    takerBuyQuoteVolume: parseFloat(data[10]),
  };
}

/**
 * Convert Binance API data to ChartData format for CustomChart component
 */
export function convertBinanceToChartData(binanceData: ParsedBinanceKline[]): ChartData[] {
  if (!binanceData || binanceData.length === 0) return [];

  // Sort data by time
  const sortedData = [...binanceData].sort((a, b) => a.openTime - b.openTime);
  
  const result: ChartData[] = [];
  const MA_PERIOD = 200; // 200-period moving average

  sortedData.forEach((kline, index) => {
    const date = new Date(kline.openTime);
    const price = kline.close;

    // Calculate 200-period moving average
    let ma2Year = price;
    if (index >= MA_PERIOD) {
      let sum = 0;
      for (let i = index - MA_PERIOD; i < index; i++) {
        sum += sortedData[i].close;
      }
      ma2Year = sum / MA_PERIOD;
    } else if (index > 0) {
      // For early data, use what we have
      let sum = 0;
      for (let i = 0; i <= index; i++) {
        sum += sortedData[i].close;
      }
      ma2Year = sum / (index + 1);
    }

    // Calculate additional lines with variation to fill graph space
    const profitLine = ma2Year * 3.5; // Profit line at 3.5x the MA
    const lossLine = ma2Year * 0.5; // Loss line at 0.5x the MA
    const avgLine = (price + ma2Year) / 2; // Average of current price and MA

    result.push({
      date,
      price,
      ma2Year,
      multiplier: price / ma2Year,
      profitLine,
      lossLine,
      avgLine,
    });
  });

  return result;
}
