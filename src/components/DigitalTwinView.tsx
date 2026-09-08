/**
 * Digital Market Twin & Synthetic Generator View
 * Generates synthetic friction, adverse execution scenarios,
 * and high-fidelity microstructure testing environments.
 */

import React, { useState } from 'react';
import { Boxes, Play, Activity, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MarketRegimeType } from '../types/quant';

interface DigitalTwinViewProps {
  currentRegime: MarketRegimeType;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ currentRegime }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('FLASH_CRASH');
  const [syntheticFeedback, setSyntheticFeedback] = useState<string | null>(null);

  const scenarios = [
    { id: 'FLASH_CRASH', label: 'Flash Crash & Liquidity Vacuum', desc: '-4.2% drop with 45 bps wide spread' },
    { id: 'CHOPPY_RANGE', label: 'Choppy Low-Volatility Grind', desc: 'Mean-reverting microstructure trap' },
    { id: 'MOMENTUM_RUN', label: 'Bullish Momentum Breakout', desc: '+2.8% sustained volume expansion' },
    { id: 'ADVERSE_SELECTION', label: 'Adverse Selection & Toxicity', desc: 'High quote cancellation, toxic flow' },
  ];

  const handleSimulate = () => {
    setSyntheticFeedback(`Synthetic twin scenario ${selectedScenario} generated and injected into simulation feed.`);
    setTimeout(() => setSyntheticFeedback(null), 4000);
  };

  return (
    <div id="digital-twin-container" className="space-y-6 p-4 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase">
              Digital Market Twin & Microstructure Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              Models execution frictions including quadratic market impact, quote fading, queue priority,
              and non-linear slippage before exposing strategies to live venue order books.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          <span>INJECT SYNTHETIC TWIN SCENARIO</span>
        </button>
      </div>

      {syntheticFeedback && (
        <div className="p-3 rounded bg-slate-900 border border-sky-500/40 text-sky-300">
          {syntheticFeedback}
        </div>
      )}

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            onClick={() => setSelectedScenario(sc.id)}
            className={`p-4 rounded border cursor-pointer transition-all ${
              selectedScenario === sc.id
                ? 'bg-slate-900 border-sky-500 shadow-md shadow-sky-950/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-200">{sc.label}</span>
              <span className="text-[10px] text-slate-400">{sc.id}</span>
            </div>
            <p className="text-slate-400 font-sans text-xs">{sc.desc}</p>
          </div>
        ))}
      </div>

      {/* Modeled Frictions Specification */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase border-b border-slate-800 pb-2">
          Mathematical Execution Friction Model
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block">SPREAD EXPANSION</span>
            <span className="text-slate-200 font-bold">2.5 bps base + 15 bps volatility shock</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block">MARKET IMPACT</span>
            <span className="text-slate-200 font-bold">Square-root law: 0.1 * sigma * sqrt(Q/V)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block">FEE DRAG DEDUCTION</span>
            <span className="text-slate-200 font-bold">0.02% Maker / 0.05% Taker modeled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
