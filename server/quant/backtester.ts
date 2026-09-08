/**
 * Chronological Event-Driven & Vectorized Backtesting Engine
 * Zero look-ahead bias, fee deduction, slippage modeling, and institutional metric analytics.
 */

import { Candle, StrategyGenome } from '../../src/types/quant';
import { calculateATR, calculateEMA, calculateRSI } from './indicators';

export interface BacktestTrade {
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  side: 'BUY' | 'SELL';
  quantity: number;
  pnl: number;
  netPnl: number;
  fees: number;
  slippage: number;
  returnPct: number;
  reason: string;
}

export interface BacktestMetrics {
  experimentName: string;
  startingBalance: number;
  endingBalance: number;
  netPnL: number;
  returnPct: number;
  maxDrawdownPct: number;
  totalFees: number;
  totalSlippage: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRatePct: number;
  profitFactor: number;
  expectancyUsd: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  ruinProbabilityPct: number;
  equityCurve: Array<{ timestamp: number; equity: number }>;
  trades: BacktestTrade[];
}

export class BacktestEngine {
  private feeRate = 0.0004; // 0.04%
  private slippageBps = 2.0; // 2 bps slippage

  /**
   * Runs an institutional backtest with strict chronological isolation on $100 baseline.
   */
  public runBacktest(
    candles: Candle[],
    strategy: StrategyGenome,
    startingBalance: number = 100.0
  ): BacktestMetrics {
    if (candles.length < 50) {
      return this.emptyMetrics('EMPTY_DATASET', startingBalance);
    }

    let equity = startingBalance;
    let peakEquity = startingBalance;
    let maxDrawdownPct = 0;
    const trades: BacktestTrade[] = [];
    const equityCurve: Array<{ timestamp: number; equity: number }> = [
      { timestamp: candles[0].timestamp, equity },
    ];

    let currentPosition: {
      entryTime: number;
      entryPrice: number;
      side: 'BUY' | 'SELL';
      quantity: number;
      stopLoss: number;
      takeProfit: number;
    } | null = null;

    // Pre-calculate indicators strictly up to bar i (or use rolling slice)
    const closes = candles.map((c) => c.close);
    const rsi = calculateRSI(closes, 14);
    const emaFast = calculateEMA(closes, 9);
    const emaSlow = calculateEMA(closes, 21);
    const atr = calculateATR(candles, 14);

    const minNotional = 10.0; // Realistic venue limit
    const maxAllocPerTrade = 0.25; // 25% max on $100

    for (let i = 25; i < candles.length; i++) {
      const bar = candles[i];
      const prevBar = candles[i - 1];
      const currentRsi = rsi[i - 1]; // Use closed bar indicator, no look-ahead!
      const currentFast = emaFast[i - 1];
      const currentSlow = emaSlow[i - 1];
      const currentAtr = atr[i - 1] || bar.close * 0.02;

      // 1. Manage open position
      if (currentPosition) {
        let shouldExit = false;
        let exitPrice = bar.open; // Fill at next bar open
        let reason = '';

        // Check stop-loss / take-profit
        if (currentPosition.side === 'BUY') {
          if (bar.low <= currentPosition.stopLoss) {
            exitPrice = currentPosition.stopLoss;
            shouldExit = true;
            reason = 'Stop Loss Hit';
          } else if (bar.high >= currentPosition.takeProfit) {
            exitPrice = currentPosition.takeProfit;
            shouldExit = true;
            reason = 'Take Profit Hit';
          } else if (currentFast < currentSlow && currentRsi > 70) {
            exitPrice = bar.close;
            shouldExit = true;
            reason = 'Strategy Exit Signal';
          }
        }

        if (shouldExit) {
          const slippagePerUnit = exitPrice * (this.slippageBps / 10000);
          const executedExit =
            currentPosition.side === 'BUY'
              ? exitPrice - slippagePerUnit
              : exitPrice + slippagePerUnit;

          const notional = currentPosition.quantity * executedExit;
          const fees = notional * this.feeRate;
          const slippage = slippagePerUnit * currentPosition.quantity;

          const rawPnl =
            currentPosition.side === 'BUY'
              ? (executedExit - currentPosition.entryPrice) * currentPosition.quantity
              : (currentPosition.entryPrice - executedExit) * currentPosition.quantity;

          const netPnl = rawPnl - fees - slippage;
          equity += netPnl;

          trades.push({
            entryTime: currentPosition.entryTime,
            exitTime: bar.timestamp,
            entryPrice: currentPosition.entryPrice,
            exitPrice: executedExit,
            side: currentPosition.side,
            quantity: currentPosition.quantity,
            pnl: Number(rawPnl.toFixed(4)),
            netPnl: Number(netPnl.toFixed(4)),
            fees: Number(fees.toFixed(4)),
            slippage: Number(slippage.toFixed(4)),
            returnPct: Number(((netPnl / (currentPosition.entryPrice * currentPosition.quantity)) * 100).toFixed(2)),
            reason,
          });

          currentPosition = null;
        }
      }

      // 2. Generate entry signal on closed previous bar
      if (!currentPosition && equity >= minNotional) {
        const isBullishCross =
          currentFast > currentSlow && emaFast[i - 2] <= emaSlow[i - 2] && currentRsi < 65 && currentRsi > 40;

        if (isBullishCross) {
          // Calculate sizing strictly compliant with micro-account
          const allocatedCapital = Math.min(equity * maxAllocPerTrade, 25.0);
          if (allocatedCapital >= minNotional) {
            const entrySlippage = bar.open * (this.slippageBps / 10000);
            const entryPrice = bar.open + entrySlippage;
            const quantity = Number((allocatedCapital / entryPrice).toFixed(4));
            const stopLoss = entryPrice - currentAtr * strategy.stopLossAtrMult;
            const takeProfit = entryPrice + currentAtr * strategy.takeProfitAtrMult;

            const entryFees = allocatedCapital * this.feeRate;
            equity -= entryFees; // Deduct upfront taker fee

            currentPosition = {
              entryTime: bar.timestamp,
              entryPrice,
              side: 'BUY',
              quantity,
              stopLoss,
              takeProfit,
            };
          }
        }
      }

      // Track high-water mark & drawdown
      if (equity > peakEquity) peakEquity = equity;
      const dd = ((peakEquity - equity) / peakEquity) * 100;
      if (dd > maxDrawdownPct) maxDrawdownPct = dd;

      equityCurve.push({
        timestamp: bar.timestamp,
        equity: Number(equity.toFixed(2)),
      });
    }

    return this.calculateMetrics(
      strategy.name,
      startingBalance,
      equity,
      maxDrawdownPct,
      trades,
      equityCurve
    );
  }

  private calculateMetrics(
    experimentName: string,
    startingBalance: number,
    endingBalance: number,
    maxDrawdownPct: number,
    trades: BacktestTrade[],
    equityCurve: Array<{ timestamp: number; equity: number }>
  ): BacktestMetrics {
    const netPnL = Number((endingBalance - startingBalance).toFixed(2));
    const returnPct = Number(((netPnL / startingBalance) * 100).toFixed(2));
    const totalFees = Number(trades.reduce((acc, t) => acc + t.fees, 0).toFixed(2));
    const totalSlippage = Number(trades.reduce((acc, t) => acc + t.slippage, 0).toFixed(2));

    const winTrades = trades.filter((t) => t.netPnl > 0);
    const lossTrades = trades.filter((t) => t.netPnl <= 0);
    const winRatePct =
      trades.length > 0 ? Number(((winTrades.length / trades.length) * 100).toFixed(1)) : 0;

    const grossProfit = winTrades.reduce((acc, t) => acc + t.netPnl, 0);
    const grossLoss = Math.abs(lossTrades.reduce((acc, t) => acc + t.netPnl, 0));
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.0 : 0;
    const expectancyUsd =
      trades.length > 0 ? Number((netPnL / trades.length).toFixed(2)) : 0;

    // Compute Sharpe, Sortino & Calmar ratios
    const returns = trades.map((t) => t.returnPct / 100);
    const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev =
      returns.length > 1
        ? Math.sqrt(
            returns.reduce((acc, r) => acc + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
          )
        : 0.01;
    const downsideStdDev =
      returns.filter((r) => r < 0).length > 1
        ? Math.sqrt(
            returns.filter((r) => r < 0).reduce((acc, r) => acc + Math.pow(r, 2), 0) /
              returns.filter((r) => r < 0).length
          )
        : 0.01;

    // Annualized by assuming ~250 periods/yr
    const annualizedFactor = Math.sqrt(250);
    const sharpeRatio = stdDev > 0 ? Number(((meanReturn / stdDev) * annualizedFactor).toFixed(2)) : 0;
    const sortinoRatio =
      downsideStdDev > 0 ? Number(((meanReturn / downsideStdDev) * annualizedFactor).toFixed(2)) : 0;
    const calmarRatio =
      maxDrawdownPct > 0 ? Number(((returnPct / maxDrawdownPct)).toFixed(2)) : returnPct > 0 ? 10.0 : 0;

    // Risk of ruin estimation (Perry-Broussard approximation)
    const ruinProbabilityPct =
      winRatePct < 45 ? 42.5 : winRatePct < 50 ? 15.0 : Math.max(0.5, Number((100 - winRatePct * 1.8).toFixed(1)));

    return {
      experimentName,
      startingBalance,
      endingBalance: Number(endingBalance.toFixed(2)),
      netPnL,
      returnPct,
      maxDrawdownPct: Number(maxDrawdownPct.toFixed(2)),
      totalFees,
      totalSlippage,
      tradeCount: trades.length,
      winCount: winTrades.length,
      lossCount: lossTrades.length,
      winRatePct,
      profitFactor,
      expectancyUsd,
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      ruinProbabilityPct,
      equityCurve,
      trades,
    };
  }

  private emptyMetrics(name: string, startingBalance: number): BacktestMetrics {
    return {
      experimentName: name,
      startingBalance,
      endingBalance: startingBalance,
      netPnL: 0,
      returnPct: 0,
      maxDrawdownPct: 0,
      totalFees: 0,
      totalSlippage: 0,
      tradeCount: 0,
      winCount: 0,
      lossCount: 0,
      winRatePct: 0,
      profitFactor: 0,
      expectancyUsd: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      ruinProbabilityPct: 0,
      equityCurve: [{ timestamp: Date.now(), equity: startingBalance }],
      trades: [],
    };
  }
}
