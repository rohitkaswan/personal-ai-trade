/**
 * Digital Market Twin & Synthetic Market Replay Engine
 * Models realistic execution frictions: spread, commission, latency, and square-root market impact.
 * Synthesizes adversarial market conditions (crashes, liquidity gaps, volatility shocks).
 */

import { Candle, Order, OrderBook } from '../../src/types/quant';

export interface SimulationExecutionResult {
  filled: boolean;
  fillPrice: number;
  filledQuantity: number;
  feePaid: number;
  slippagePaid: number;
  latencyMs: number;
  rejectionReason?: string;
}

export class DigitalMarketTwin {
  private baseSpreadBps: number = 2.5; // 2.5 bps default spread
  private commissionRate: number = 0.0004; // 0.04% taker fee
  private baseLatencyMs: number = 25; // 25ms execution latency

  /**
   * Simulates an order fill with realistic microstructural frictions.
   */
  public simulateOrderFill(
    order: Order,
    currentPrice: number,
    orderBook?: OrderBook,
    dailyVolumeUsd: number = 5000000
  ): SimulationExecutionResult {
    // 1. Venue minimum notional check (e.g. Binance requires >= $5 - $10)
    const notional = order.quantity * currentPrice;
    if (notional < 5.0) {
      return {
        filled: false,
        fillPrice: 0,
        filledQuantity: 0,
        feePaid: 0,
        slippagePaid: 0,
        latencyMs: this.baseLatencyMs,
        rejectionReason: `Order notional ($${notional.toFixed(2)}) below minimum venue requirement ($5.00)`,
      };
    }

    // 2. Realistic half-spread deduction
    const spreadMultiplier = order.side === 'BUY' ? 1 : -1;
    const halfSpread = (currentPrice * (this.baseSpreadBps / 10000)) / 2;

    // 3. Market impact slippage model: gamma * sigma * sqrt(Size / Volume)
    const participationRate = notional / Math.max(100000, dailyVolumeUsd);
    const impactFactor = 0.1 * Math.sqrt(participationRate);
    const slippagePerUnit = currentPrice * impactFactor;

    const fillPrice = currentPrice + spreadMultiplier * (halfSpread + slippagePerUnit);
    const feePaid = notional * this.commissionRate;
    const slippagePaid = Math.abs(fillPrice - currentPrice) * order.quantity;

    // Limit order check
    if (order.type === 'LIMIT' && order.limitPrice) {
      if (order.side === 'BUY' && fillPrice > order.limitPrice) {
        return {
          filled: false,
          fillPrice: 0,
          filledQuantity: 0,
          feePaid: 0,
          slippagePaid: 0,
          latencyMs: this.baseLatencyMs,
          rejectionReason: `Limit price exceeded: Ask $${fillPrice.toFixed(2)} > Limit $${order.limitPrice.toFixed(2)}`,
        };
      }
      if (order.side === 'SELL' && fillPrice < order.limitPrice) {
        return {
          filled: false,
          fillPrice: 0,
          filledQuantity: 0,
          feePaid: 0,
          slippagePaid: 0,
          latencyMs: this.baseLatencyMs,
          rejectionReason: `Limit price not reached: Bid $${fillPrice.toFixed(2)} < Limit $${order.limitPrice.toFixed(2)}`,
        };
      }
    }

    return {
      filled: true,
      fillPrice: Number(fillPrice.toFixed(4)),
      filledQuantity: order.quantity,
      feePaid: Number(feePaid.toFixed(4)),
      slippagePaid: Number(slippagePaid.toFixed(4)),
      latencyMs: this.baseLatencyMs + Math.floor(Math.random() * 20),
    };
  }

  /**
   * Generates realistic synthetic candle series for adversarial stress tests.
   */
  public generateSyntheticScenario(
    scenario: 'CRASH' | 'RECOVERY' | 'CHOPPY_RANGE' | 'MOMENTUM_RUN' | 'FLASH_COLLAPSE',
    startPrice: number = 100.0,
    candleCount: number = 120
  ): Candle[] {
    const candles: Candle[] = [];
    let current = startPrice;
    let now = Date.now() - candleCount * 60 * 1000;

    for (let i = 0; i < candleCount; i++) {
      let drift = 0;
      let vol = 0.003;

      if (scenario === 'CRASH') {
        drift = -0.005; // sharp downward drift
        vol = 0.015;
      } else if (scenario === 'FLASH_COLLAPSE' && i >= 40 && i <= 55) {
        drift = -0.025; // 250 bps per candle collapse
        vol = 0.04;
      } else if (scenario === 'RECOVERY') {
        drift = 0.004;
        vol = 0.008;
      } else if (scenario === 'MOMENTUM_RUN') {
        drift = 0.006;
        vol = 0.005;
      } else if (scenario === 'CHOPPY_RANGE') {
        drift = (startPrice - current) * 0.08; // mean reverting spring
        vol = 0.004;
      }

      const shock = (Math.random() - 0.5) * 2 * vol;
      const change = current * (drift + shock);
      const open = current;
      const close = Math.max(1, open + change);
      const high = Math.max(open, close) * (1 + Math.random() * vol);
      const low = Math.min(open, close) * (1 - Math.random() * vol);
      const volume = Math.round(1000 + Math.random() * 5000 * (1 + Math.abs(shock) * 50));

      candles.push({
        timestamp: now,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
        spread: 0.02,
      });

      current = close;
      now += 60 * 1000;
    }

    return candles;
  }
}
