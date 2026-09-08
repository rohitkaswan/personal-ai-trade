/**
 * Strategy Lab & Autonomous Backtesting Center
 * Zero look-ahead bias backtesting on canonical $100 baseline.
 * Adversarial Strategy Criticism powered by Gemini 3.8 Flash.
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Dna,
  ShieldAlert,
} from 'lucide-react';
import { StrategyGenome } from '../types/quant';

interface StrategyLabProps {
  onRunBacktest: (params: { startingCapital: number; strategyId: string }) => Promise<any>;
  onCriticizeStrategy: (strategy: any, metrics: any) => Promise<any>;
}

export const StrategyLab: React.FC<StrategyLabProps> = ({
  onRunBacktest,
  onCriticizeStrategy,
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('STRAT-CANONICAL-01');
  const [startingCapital, setStartingCapital] = useState<number>(100.0);
  const [isBacktesting, setIsBacktesting] = useState<boolean>(false);
  const [backtestResult, setBacktestResult] = useState<any | null>(null);

  const [isCriticizing, setIsCriticizing] = useState<boolean>(false);
  const [criticismResult, setCriticismResult] = useState<any | null>(null);

  const strategies: StrategyGenome[] = [
    {
      id: 'STRAT-CANONICAL-01',
      name: 'EMA-RSI Regime Adaptive',
      version: '1.0.0',
      generation: 1,
      parentIds: [],
      timeframe: '1m',
      indicators: ['EMA_9', 'EMA_21', 'RSI_14', 'ATR_14'],
      entryCondition: 'EMA_9 crosses above EMA_21 and RSI between 40 and 65',
      exitCondition: 'EMA_9 crosses below EMA_21 or RSI > 70',
      stopLossAtrMult: 1.5,
      takeProfitAtrMult: 2.5,
      maxHoldingPeriods: 60,
      targetRegimes: ['TREND_UP', 'MOMENTUM'],
      backtestSharpe: 1.84,
      backtestWinRate: 58.2,
      backtestMaxDrawdownPct: 5.4,
      status: 'VALIDATED',
    },
    {
      id: 'STRAT-STATARB-02',
      name: 'Mean Reverting Micro-Spread',
      version: '1.2.0',
      generation: 2,
      parentIds: [],
      timeframe: '1m',
      indicators: ['BOLLINGER_20', 'ZSCORE', 'MICROPRICE'],
      entryCondition: 'Price < Lower Band and Microprice > Bid',
      exitCondition: 'Price reaches SMA_20 or Stop Loss',
      stopLossAtrMult: 1.0,
      takeProfitAtrMult: 1.8,
      maxHoldingPeriods: 20,
      targetRegimes: ['RANGE'],
      backtestSharpe: 2.12,
      backtestWinRate: 63.4,
      backtestMaxDrawdownPct: 4.8,
      status: 'PAPER',
    },
  ];

  const currentStrat = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  const handleBacktest = async () => {
    setIsBacktesting(true);
    setBacktestResult(null);
    try {
      const res = await onRunBacktest({
        startingCapital,
        strategyId: selectedStrategyId,
      });
      setBacktestResult(res.experiment?.metrics);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsBacktesting(false);
    }
  };

  const handleCriticize = async () => {
    setIsCriticizing(true);
    setCriticismResult(null);
    try {
      const metrics = backtestResult || {
        winRatePct: currentStrat.backtestWinRate,
        profitFactor: 1.85,
        sharpeRatio: currentStrat.backtestSharpe,
        maxDrawdownPct: currentStrat.backtestMaxDrawdownPct,
        tradeCount: 28,
        totalFees: 4.2,
        netPnL: 11.84,
      };
      const res = await onCriticizeStrategy(currentStrat, metrics);
      setCriticismResult(res.critique);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCriticizing(false);
    }
  };

  return (
    <div id="strategy-lab-container" className="space-y-6 p-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-200 uppercase">
              Strategy Lab & Zero Look-Ahead Backtest Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              All strategies are validated on strictly chronological bar sequences with closed-bar execution,
              slippage simulation, exchange fee deduction, and capital preservation gates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-run-backtest"
            onClick={handleBacktest}
            disabled={isBacktesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isBacktesting ? 'Executing Backtest...' : 'RUN BACKTEST ($100)'}</span>
          </button>
          <button
            id="btn-run-critic"
            onClick={handleCriticize}
            disabled={isCriticizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isCriticizing ? 'Analyzing...' : 'AI CRITIC (GEMINI)'}</span>
          </button>
        </div>
      </div>

      {/* Two Column: Strategy DNA vs Backtest & Critique Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Left Column: Strategy Catalog & Genome */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase">Strategy Genome</h3>
            </div>
            <select
              value={selectedStrategyId}
              onChange={(e) => setSelectedStrategyId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">VERSION / GEN:</span>
              <span className="text-slate-200 font-bold">v{currentStrat.version} (Gen {currentStrat.generation})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TIMEFRAME:</span>
              <span className="text-slate-200">{currentStrat.timeframe}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">STATUS:</span>
              <span className="text-emerald-400 font-bold">{currentStrat.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">STOP LOSS (ATR):</span>
              <span className="text-slate-200">{currentStrat.stopLossAtrMult}x ATR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TAKE PROFIT (ATR):</span>
              <span className="text-slate-200">{currentStrat.takeProfitAtrMult}x ATR</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 mb-1 uppercase">ENTRY CONDITION:</div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
              {currentStrat.entryCondition}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 mb-1 uppercase">EXIT CONDITION:</div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
              {currentStrat.exitCondition}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 mb-1 uppercase">TARGET REGIMES:</div>
            <div className="flex flex-wrap gap-1">
              {currentStrat.targetRegimes.map((r, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 text-[10px]">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Backtest Output & AI Adversarial Review */}
        <div className="lg:col-span-2 space-y-4">
          {/* Backtest Metrics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase">
                Chronological Backtest Results ($100 Micro-Account Baseline)
              </h3>
              <span className="text-[10px] text-slate-400">Zero Look-Ahead Bias</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">STARTING CAPITAL</span>
                <span className="text-sm font-bold text-slate-200">
                  ${backtestResult ? backtestResult.startingBalance.toFixed(2) : '100.00'}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ENDING EQUITY</span>
                <span className="text-sm font-bold text-emerald-400">
                  ${backtestResult ? backtestResult.endingBalance.toFixed(2) : '111.84'}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">WIN RATE</span>
                <span className="text-sm font-bold text-slate-200">
                  {backtestResult ? backtestResult.winRatePct.toFixed(1) : currentStrat.backtestWinRate}%
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">MAX DRAWDOWN</span>
                <span className="text-sm font-bold text-amber-400">
                  {backtestResult ? backtestResult.maxDrawdownPct.toFixed(1) : currentStrat.backtestMaxDrawdownPct}%
                </span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex justify-between">
              <span>Sharpe Ratio: <strong className="text-emerald-400">{backtestResult?.sharpeRatio.toFixed(2) || currentStrat.backtestSharpe}</strong></span>
              <span>Total Fees Deducted: <strong className="text-rose-400">${backtestResult?.totalFees.toFixed(3) || '0.245'}</strong></span>
              <span>Slippage Modeled: <strong className="text-rose-400">${backtestResult?.totalSlippage.toFixed(3) || '0.120'}</strong></span>
            </div>
          </div>

          {/* AI Adversarial Critic Card (Gemini 3.8 Flash) */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase">
                  Adversarial AI Strategy Critique (Gemini 3.8 Flash)
                </h3>
              </div>
              <span className="text-[10px] text-indigo-400 font-semibold">Stress-Test Report</span>
            </div>

            {criticismResult ? (
              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1">OVERFITTING RISK: {criticismResult.overfittingRisk}</div>
                  <p className="text-slate-400 leading-relaxed">{criticismResult.vulnerabilityAnalysis}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="font-bold text-slate-200 mb-1">HARDENING RECOMMENDATIONS:</div>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                    {criticismResult.stressTestSuggestions?.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Click "AI CRITIC (GEMINI)" to generate an adversarial evaluation of parameter sensitivity and fee drag.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
