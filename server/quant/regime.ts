/**
 * Market Regime Engine
 * Ensemble statistical regime classification
 */

import { Candle, MarketRegime, MarketRegimeType } from '../../src/types/quant';
import {
  calculateATR,
  calculateBollingerBands,
  calculateEMA,
  calculateHurstExponent,
} from './indicators';

export class MarketRegimeEngine {
  private regimeHistory: Array<{ timestamp: number; regime: MarketRegimeType; confidence: number }> = [];

  public detectRegime(candles: Candle[]): MarketRegime {
    if (candles.length < 20) {
      return {
        current: 'UNKNOWN',
        probability: 0.5,
        confidence: 0.3,
        transitionProbability: { RANGE: 0.5, UNKNOWN: 0.5 },
        regimeHistory: this.regimeHistory,
        detectedAt: Date.now(),
      };
    }

    const closes = candles.map((c) => c.close);
    const lastClose = closes[closes.length - 1];
    const prevClose = closes[Math.max(0, closes.length - 10)];
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, Math.min(50, closes.length));
    const lastEma20 = ema20[ema20.length - 1];
    const lastEma50 = ema50[ema50.length - 1];

    const atr = calculateATR(candles, 14);
    const currentAtr = atr[atr.length - 1] || 1;
    const avgAtr = atr.slice(-20).reduce((a, b) => a + b, 0) / Math.max(1, atr.slice(-20).length);
    const atrRatio = currentAtr / (avgAtr || 1);

    const bb = calculateBollingerBands(closes, 20, 2);
    const bandwidth = bb.bandwidth[bb.bandwidth.length - 1] || 0.05;
    const hurst = calculateHurstExponent(closes.slice(-50));

    // Calculate rolling 10-period return and drawdown
    const recentReturn = (lastClose - prevClose) / prevClose;
    const maxHigh = Math.max(...candles.slice(-20).map((c) => c.high));
    const drawdownFromHigh = (lastClose - maxHigh) / maxHigh;

    let detected: MarketRegimeType = 'RANGE';
    let probability = 0.65;
    let confidence = 0.7;

    // Regime logic rules
    if (drawdownFromHigh < -0.15 && atrRatio > 2.0) {
      detected = 'CRISIS';
      probability = 0.92;
      confidence = 0.88;
    } else if (atrRatio > 2.2 || bandwidth > 0.12) {
      detected = 'HIGH_VOLATILITY';
      probability = 0.85;
      confidence = 0.8;
    } else if (atrRatio < 0.6 && bandwidth < 0.03) {
      detected = 'LOW_VOLATILITY';
      probability = 0.82;
      confidence = 0.85;
    } else if (hurst > 0.62 && lastClose > lastEma20 && lastEma20 > lastEma50 && recentReturn > 0.015) {
      detected = 'TREND_UP';
      probability = 0.88;
      confidence = 0.82;
    } else if (hurst > 0.62 && lastClose < lastEma20 && lastEma20 < lastEma50 && recentReturn < -0.015) {
      detected = 'TREND_DOWN';
      probability = 0.88;
      confidence = 0.82;
    } else if (hurst < 0.42) {
      detected = 'MEAN_REVERSION';
      probability = 0.78;
      confidence = 0.75;
    } else if (Math.abs(recentReturn) < 0.01 && bandwidth < 0.06) {
      detected = 'RANGE';
      probability = 0.8;
      confidence = 0.85;
    } else {
      detected = 'TRANSITION';
      probability = 0.6;
      confidence = 0.6;
    }

    const transitionProbability: Record<string, number> = {
      TREND_UP: detected === 'TREND_UP' ? 0.75 : 0.1,
      TREND_DOWN: detected === 'TREND_DOWN' ? 0.75 : 0.1,
      RANGE: detected === 'RANGE' ? 0.7 : 0.15,
      HIGH_VOLATILITY: detected === 'HIGH_VOLATILITY' ? 0.65 : 0.1,
      LOW_VOLATILITY: detected === 'LOW_VOLATILITY' ? 0.7 : 0.1,
      TRANSITION: 0.15,
    };

    const record = {
      timestamp: Date.now(),
      regime: detected,
      confidence,
    };
    this.regimeHistory.push(record);
    if (this.regimeHistory.length > 100) this.regimeHistory.shift();

    return {
      current: detected,
      probability,
      confidence,
      transitionProbability,
      regimeHistory: this.regimeHistory,
      detectedAt: Date.now(),
    };
  }
}
