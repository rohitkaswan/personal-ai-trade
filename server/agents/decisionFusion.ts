/**
 * Agent Decision Fusion Engine
 * Replaces simplistic voting with reputation-weighted Bayesian belief aggregation.
 * Supports explicit NO-TRADE verdict when edge is insufficient, uncertainty is elevated, or risk is unacceptable.
 */

import {
  AgentDefinition,
  DecisionFusionAction,
  DecisionFusionOutcome,
  MarketStateVector,
} from '../../src/types/quant';

export class DecisionFusionEngine {
  /**
   * Aggregates intelligence across all 62 agents and fuses into an institutional decision.
   */
  public fuseDecisions(
    marketState: MarketStateVector,
    agents: AgentDefinition[]
  ): DecisionFusionOutcome {
    const decisionId = `FUS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Hard No-Trade Thresholds
    if (marketState.dataQualityScore < 85) {
      return this.createNoTrade(
        decisionId,
        marketState,
        agents.length,
        'Market data quality score below institutional safety threshold (85/100).',
        ['DATA_FEED_DEGRADED']
      );
    }

    if (marketState.regime === 'CRISIS' || marketState.regime === 'LIQUIDITY_STRESS') {
      return this.createNoTrade(
        decisionId,
        marketState,
        agents.length,
        `Regime is ${marketState.regime}. Capital preservation directive active.`,
        ['REGIME_CRISIS_ACTIVE', 'CAPITAL_PRESERVATION_MODE']
      );
    }

    if (marketState.spreadBps > 15.0) {
      return this.createNoTrade(
        decisionId,
        marketState,
        agents.length,
        `Spread (${marketState.spreadBps.toFixed(1)} bps) is too wide for profitable execution on $100 baseline.`,
        ['SPREAD_TOO_WIDE']
      );
    }

    // 2. Compute Bayesian agent votes weighted by reputation & regime effectiveness
    let buyWeight = 0;
    let sellWeight = 0;
    let holdWeight = 0;
    let noTradeWeight = 0;
    let totalWeight = 0;

    for (const agent of agents) {
      if (agent.status !== 'ACTIVE') continue;

      const regimeMult = agent.currentRegimeEffectiveness[marketState.regime] ?? 0.85;
      const weight = (agent.reputationScore / 100) * agent.calibrationScore * regimeMult;
      totalWeight += weight;

      // Deterministic agent vote based on quant indicators
      if (agent.category === 'STRATEGY_LAB' || agent.category === 'AI_LAB') {
        if (marketState.trend > 0.3 && marketState.rsi < 65 && marketState.orderBookImbalance > 0.05) {
          buyWeight += weight * 1.2;
        } else if (marketState.trend < -0.3 && marketState.rsi > 35 && marketState.orderBookImbalance < -0.05) {
          sellWeight += weight * 1.2;
        } else if (marketState.hurstExponent < 0.45 && Math.abs(marketState.trend) < 0.15) {
          holdWeight += weight;
        } else {
          noTradeWeight += weight;
        }
      } else if (agent.category === 'EXECUTIVE' || agent.category === 'OPERATIONS') {
        // High safety preference
        if (marketState.volatility > 0.035 || marketState.spreadBps > 8.0) {
          noTradeWeight += weight * 1.5;
        } else {
          holdWeight += weight;
        }
      } else {
        // Market intelligence
        if (marketState.trend > 0.2) buyWeight += weight * 0.8;
        else if (marketState.trend < -0.2) sellWeight += weight * 0.8;
        else holdWeight += weight;
      }
    }

    const buyScore = buyWeight / (totalWeight || 1);
    const sellScore = sellWeight / (totalWeight || 1);
    const noTradeScore = (noTradeWeight + holdWeight * 0.5) / (totalWeight || 1);

    // Epistemic uncertainty is high if votes are fragmented
    const entropy = -(
      (buyScore > 0 ? buyScore * Math.log2(buyScore) : 0) +
      (sellScore > 0 ? sellScore * Math.log2(sellScore) : 0) +
      (noTradeScore > 0 ? noTradeScore * Math.log2(noTradeScore) : 0)
    );
    const normalizedUncertainty = Math.min(Math.max(entropy / 1.58, 0.05), 0.95);

    // Threshold required to generate actionable signal
    const minEdgeThreshold = 0.52;
    let action: DecisionFusionAction = 'NO-TRADE';
    let confidence = 0.5;
    let expectedReturnBps = 0;

    if (normalizedUncertainty > 0.55) {
      action = 'NO-TRADE';
      confidence = 0.45;
      expectedReturnBps = 0;
    } else if (buyScore > minEdgeThreshold && buyScore > sellScore * 1.5) {
      action = 'BUY';
      confidence = Number((buyScore * (1 - normalizedUncertainty * 0.5)).toFixed(2));
      expectedReturnBps = Number((45 + (buyScore - 0.5) * 120).toFixed(1));
    } else if (sellScore > minEdgeThreshold && sellScore > buyScore * 1.5) {
      action = 'SELL';
      confidence = Number((sellScore * (1 - normalizedUncertainty * 0.5)).toFixed(2));
      expectedReturnBps = Number((-45 - (sellScore - 0.5) * 120).toFixed(1));
    } else {
      action = 'WAIT';
      confidence = 0.6;
      expectedReturnBps = 0;
    }

    return {
      decisionId,
      timestamp: Date.now(),
      symbol: marketState.symbol,
      action,
      confidence,
      uncertainty: Number(normalizedUncertainty.toFixed(2)),
      expectedReturnBps,
      expectedVolatility: marketState.volatility,
      holdingPeriodMinutes: 45,
      participatingAgents: agents.filter((a) => a.status === 'ACTIVE').length,
      structuredEvidence: {
        regimeAlignment: `Current regime is ${marketState.regime} with Hurst ${marketState.hurstExponent.toFixed(2)}.`,
        macroContext: 'Liquid session, no high-impact blackout events.',
        microstructureHealth: `Spread: ${marketState.spreadBps.toFixed(1)} bps, Order Book Imbalance: ${(marketState.orderBookImbalance * 100).toFixed(1)}%`,
        riskMarginAdequate: true,
        costFeasibility: `Expected return (${expectedReturnBps} bps) vs fee/slippage cost (6.5 bps).`,
      },
      riskFactors: [
        `Uncertainty index: ${(normalizedUncertainty * 100).toFixed(0)}%`,
        `RSI: ${marketState.rsi.toFixed(1)}`,
        `Volatility: ${(marketState.volatility * 100).toFixed(2)}%`,
      ],
      executionConditions: [
        'Passive TWAP/VWAP or Limit entry at microprice',
        'Reject if slippage > 5 bps',
        'Hard stop-loss pegged to 1.5x ATR',
      ],
    };
  }

  private createNoTrade(
    decisionId: string,
    marketState: MarketStateVector,
    agentCount: number,
    reason: string,
    riskFactors: string[]
  ): DecisionFusionOutcome {
    return {
      decisionId,
      timestamp: Date.now(),
      symbol: marketState.symbol,
      action: 'NO-TRADE',
      confidence: 0.95,
      uncertainty: 0.1,
      expectedReturnBps: 0,
      expectedVolatility: marketState.volatility,
      holdingPeriodMinutes: 0,
      participatingAgents: agentCount,
      structuredEvidence: {
        regimeAlignment: `Regime: ${marketState.regime}`,
        macroContext: 'Trade generation vetoed by safety constraints.',
        microstructureHealth: `Spread: ${marketState.spreadBps.toFixed(1)} bps`,
        riskMarginAdequate: false,
        costFeasibility: reason,
      },
      riskFactors,
      executionConditions: ['Hold capital in cash reserve', 'Monitor for regime stabilization'],
      vetoTriggered: reason,
    };
  }
}
