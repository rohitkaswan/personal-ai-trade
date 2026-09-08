/**
 * Fast Numerical Layer - Technical & Market Microstructure Indicators
 * High-performance, zero-external-dependency, zero look-ahead bias implementations.
 */

import { Candle, OrderBook } from '../../src/types/quant';

export function calculateSMA(values: number[], period: number): number[] {
  if (values.length < period) return values.map(() => values[values.length - 1] || 0);
  const result: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) {
      result.push(sum / period);
    } else {
      result.push(sum / (i + 1));
    }
  }
  return result;
}

export function calculateEMA(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const result: number[] = [values[0]];
  const multiplier = 2 / (period + 1);

  for (let i = 1; i < values.length; i++) {
    const val = (values[i] - result[i - 1]) * multiplier + result[i - 1];
    result.push(val);
  }
  return result;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length <= period) return closes.map(() => 50);
  const rsi: number[] = new Array(closes.length).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }

  return rsi;
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  const macdLine = fastEMA.map((f, i) => f - (slowEMA[i] || 0));
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((m, i) => m - (signalLine[i] || 0));

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateATR(candles: Candle[], period: number = 14): number[] {
  if (candles.length === 0) return [];
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }

  return calculateSMA(tr, period);
}

export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMult: number = 2
): { middle: number[]; upper: number[]; lower: number[]; bandwidth: number[] } {
  const sma = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = closes.slice(start, i + 1);
    const mean = sma[i];
    const variance =
      slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance);

    const up = mean + stdDevMult * stdDev;
    const low = mean - stdDevMult * stdDev;
    upper.push(up);
    lower.push(low);
    bandwidth.push(mean > 0 ? (up - low) / mean : 0);
  }

  return { middle: sma, upper, lower, bandwidth };
}

export function calculateVWAP(candles: Candle[]): number[] {
  let cumulativeTypicalPriceVolume = 0;
  let cumulativeVolume = 0;
  const vwap: number[] = [];

  for (const c of candles) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTypicalPriceVolume += typicalPrice * c.volume;
    cumulativeVolume += c.volume;
    vwap.push(cumulativeVolume > 0 ? cumulativeTypicalPriceVolume / cumulativeVolume : c.close);
  }

  return vwap;
}

export function calculateOrderBookImbalance(orderBook?: OrderBook): number {
  if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) return 0;
  const bidQty = orderBook.bids.slice(0, 5).reduce((acc, b) => acc + b.quantity, 0);
  const askQty = orderBook.asks.slice(0, 5).reduce((acc, a) => acc + a.quantity, 0);
  const total = bidQty + askQty;
  if (total === 0) return 0;
  return (bidQty - askQty) / total; // -1 to +1
}

export function calculateMicroprice(orderBook?: OrderBook): number {
  if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) return 0;
  const bestBid = orderBook.bids[0];
  const bestAsk = orderBook.asks[0];
  const totalQty = bestBid.quantity + bestAsk.quantity;
  if (totalQty === 0) return (bestBid.price + bestAsk.price) / 2;
  return (bestBid.price * bestAsk.quantity + bestAsk.price * bestBid.quantity) / totalQty;
}

export function calculateHurstExponent(prices: number[]): number {
  if (prices.length < 30) return 0.5; // Random walk neutral
  // Simplified rescaled range (R/S) method
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std = Math.sqrt(
    returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / returns.length
  );
  if (std === 0) return 0.5;

  let cumulative = 0;
  let maxCum = -Infinity;
  let minCum = Infinity;
  for (const r of returns) {
    cumulative += r - mean;
    if (cumulative > maxCum) maxCum = cumulative;
    if (cumulative < minCum) minCum = cumulative;
  }
  const range = maxCum - minCum;
  const rs = range / std;
  const hurst = Math.log(rs) / Math.log(prices.length);
  return Math.min(Math.max(hurst, 0.05), 0.95);
}

export function calculateZScore(value: number, history: number[]): number {
  if (history.length < 2) return 0;
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length;
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  return (value - mean) / std;
}
