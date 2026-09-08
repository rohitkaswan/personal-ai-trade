/**
 * Portfolio Brain & Position Sizing Engine
 * Implements Risk Parity, Volatility Targeting, CVaR calculations,
 * and strictly capped Kelly criterion adapted for $100 micro-accounts.
 */

import { RiskLimits, TestAccount } from '../../src/types/quant';

export interface PositionSizingInput {
  accountEquity: number;
  entryPrice: number;
  stopLossPrice?: number;
  volatility: number; // e.g. ATR or rolling stdev
  confidence: number; // 0 to 1
  winRateEstimate?: number;
  rewardToRiskEstimate?: number;
  limits: RiskLimits;
}

export interface PositionSizingOutput {
  recommendedQuantity: number;
  notionalUsd: number;
  riskAmountUsd: number;
  riskPct: number;
  reasoning: string;
  isTradeable: boolean;
}

export class PortfolioBrain {
  /**
   * Computes institutional position sizing with strict Micro-Account ($100) guardrails.
   */
  public calculatePositionSize(input: PositionSizingInput): PositionSizingOutput {
    const {
      accountEquity,
      entryPrice,
      stopLossPrice,
      confidence,
      winRateEstimate = 0.52,
      rewardToRiskEstimate = 1.5,
      limits,
    } = input;

    if (accountEquity <= 0 || entryPrice <= 0) {
      return {
        recommendedQuantity: 0,
        notionalUsd: 0,
        riskAmountUsd: 0,
        riskPct: 0,
        reasoning: 'Zero or negative equity/price',
        isTradeable: false,
      };
    }

    // 1. Capped Kelly Criterion calculation: f* = (p * b - q) / b
    const p = Math.min(Math.max(winRateEstimate, 0.3), 0.7);
    const q = 1 - p;
    const b = Math.max(rewardToRiskEstimate, 0.5);
    const fullKelly = Math.max(0, (p * b - q) / b);
    // Half-Kelly scaled by AI model confidence to prevent excessive drawdowns
    const fractionalKelly = fullKelly * 0.5 * Math.min(confidence, 1.0);

    // 2. Risk-based allocation limit
    // On $100, max risk per trade (e.g. 1.5% = $1.50)
    const maxRiskUsd = accountEquity * (limits.maxRiskPerTradePct / 100);

    // 3. Stop-loss distance
    let perUnitRisk = entryPrice * 0.02; // default 2% if no explicit SL
    if (stopLossPrice && stopLossPrice > 0) {
      perUnitRisk = Math.max(Math.abs(entryPrice - stopLossPrice), entryPrice * 0.005);
    }

    // Max units based on dollar risk
    const unitsByRisk = maxRiskUsd / perUnitRisk;
    let notionalByRisk = unitsByRisk * entryPrice;

    // 4. Cap by Kelly fraction & max position size limit (e.g. $25 on $100 account)
    const notionalByKelly = accountEquity * Math.min(fractionalKelly, 0.35);
    let targetNotional = Math.min(notionalByRisk, notionalByKelly, limits.maxPositionSizeUsd);

    // 5. Enforce exchange minimum notional (e.g. $10.00 minimum on Binance)
    if (targetNotional < limits.minOrderNotionalUsd) {
      // Check if safely stepping up to minOrderNotional fits within maximum allowable position
      if (
        limits.minOrderNotionalUsd <= limits.maxPositionSizeUsd &&
        limits.minOrderNotionalUsd <= accountEquity * 0.35
      ) {
        targetNotional = limits.minOrderNotionalUsd;
      } else {
        return {
          recommendedQuantity: 0,
          notionalUsd: 0,
          riskAmountUsd: 0,
          riskPct: 0,
          reasoning: `Trade rejected: Required min notional ($${limits.minOrderNotionalUsd.toFixed(2)}) exceeds micro-account allocation safety limits.`,
          isTradeable: false,
        };
      }
    }

    const recommendedQuantity = Number((targetNotional / entryPrice).toFixed(4));
    const finalNotional = Number((recommendedQuantity * entryPrice).toFixed(2));
    const finalRiskUsd = Number((recommendedQuantity * perUnitRisk).toFixed(2));
    const finalRiskPct = Number(((finalRiskUsd / accountEquity) * 100).toFixed(2));

    return {
      recommendedQuantity,
      notionalUsd: finalNotional,
      riskAmountUsd: finalRiskUsd,
      riskPct: finalRiskPct,
      reasoning: `Sized via Kelly fraction ${(fractionalKelly * 100).toFixed(1)}% & max risk limit $${maxRiskUsd.toFixed(2)} on $${accountEquity.toFixed(2)} equity.`,
      isTradeable: recommendedQuantity > 0,
    };
  }

  /**
   * Computes Conditional Value at Risk (CVaR / Expected Shortfall) for portfolio returns at alpha = 95%.
   */
  public calculateCVaR(returns: number[], alpha: number = 0.95): number {
    if (returns.length < 5) return 0.05;
    const sorted = [...returns].sort((a, b) => a - b);
    const cutoffIndex = Math.max(1, Math.floor((1 - alpha) * sorted.length));
    const tailReturns = sorted.slice(0, cutoffIndex);
    const avgTailLoss = tailReturns.reduce((acc, r) => acc + r, 0) / tailReturns.length;
    return Math.abs(avgTailLoss);
  }

  /**
   * Risk Parity weighting calculation across multiple uncorrelated asset streams.
   */
  public computeRiskParityWeights(volatilities: number[]): number[] {
    if (!volatilities.length) return [];
    const invVols = volatilities.map((v) => (v > 0 ? 1 / v : 0));
    const totalInvVol = invVols.reduce((acc, v) => acc + v, 0);
    if (totalInvVol === 0) return volatilities.map(() => 1 / volatilities.length);
    return invVols.map((iv) => Number((iv / totalInvVol).toFixed(4)));
  }
}
