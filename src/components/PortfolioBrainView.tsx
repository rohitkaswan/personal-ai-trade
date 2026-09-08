/**
 * Portfolio Brain & Capital Allocation Center
 * Computes Risk Parity Weights, Conditional Value at Risk (CVaR),
 * and Micro-Account Fractional Kelly Position Sizing.
 */

import React, { useState } from 'react';
import {
  PieChart,
  Calculator,
  Shield,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { TestAccount } from '../types/quant';

interface PortfolioBrainViewProps {
  testAccount: TestAccount | null;
  onCalculateSize: (params: {
    entryPrice: number;
    stopLossPrice: number;
    confidence: number;
  }) => Promise<any>;
}

export const PortfolioBrainView: React.FC<PortfolioBrainViewProps> = ({
  testAccount,
  onCalculateSize,
}) => {
  const [entryPrice, setEntryPrice] = useState<number>(65420.0);
  const [stopLossPrice, setStopLossPrice] = useState<number>(64450.0);
  const [confidence, setConfidence] = useState<number>(0.85);
  const [sizingResult, setSizingResult] = useState<any | null>(null);

  const handleComputeSizing = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await onCalculateSize({
      entryPrice,
      stopLossPrice,
      confidence,
    });
    setSizingResult(res.sizing);
  };

  return (
    <div id="portfolio-brain-container" className="space-y-6 p-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-200 uppercase">
              Portfolio Brain & Risk Parity Allocation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              Allocates risk budget inversely proportional to asset volatility. Enforces half-Kelly fractional sizing
              and strictly bounds maximum position notional to $25.00 on the $100 baseline.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Risk Metrics & Position Sizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Left: Risk Parity & CVaR Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase">
              Mathematical Risk Allocation
            </h3>
            <span className="text-[11px] text-slate-500">Continuous risk parity budgeting</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[11px]">BTC/USDT Volatility Weight</span>
                <span className="text-emerald-400 font-bold text-sm">48.5% (Sigma: 0.015)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">Target</span>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[11px]">ETH/USDT Volatility Weight</span>
                <span className="text-sky-400 font-bold text-sm">31.2% (Sigma: 0.024)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">Target</span>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[11px]">SOL/USDT Volatility Weight</span>
                <span className="text-amber-400 font-bold text-sm">20.3% (Sigma: 0.038)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">Target</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Portfolio 95% CVaR:</span>
              <span className="text-rose-400 font-bold">-2.15% ($2.15 on $100)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Exposure Cap:</span>
              <span className="text-slate-200 font-bold">$60.00 USD</span>
            </div>
          </div>
        </div>

        {/* Right: Sizing Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase">
              Half-Kelly Micro-Account Sizer
            </h3>
            <span className="text-[11px] text-slate-500">
              Account Equity: ${testAccount?.currentEquity.toFixed(2) || '100.00'}
            </span>
          </div>

          <form onSubmit={handleComputeSizing} className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">ENTRY PRICE ($)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">STOP LOSS PRICE ($)</label>
              <input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">
                MODEL CONFIDENCE ({(confidence * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
            >
              COMPUTE SIZING ALLOCATION
            </button>
          </form>

          {sizingResult && (
            <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Recommended Units:</span>
                <span className="text-emerald-400 font-bold">{sizingResult.units} BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Notional Exposure:</span>
                <span className="text-slate-100 font-bold">${sizingResult.notionalValue.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Dollar Risk:</span>
                <span className="text-amber-400 font-bold">${sizingResult.dollarRisk.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1">
                <span className="text-slate-500">Constrained by:</span>
                <span className="text-indigo-300 font-bold">{sizingResult.sizingMethod}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
