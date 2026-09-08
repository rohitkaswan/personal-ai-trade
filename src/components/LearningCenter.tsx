/**
 * Learning Center & Institutional Memory Component
 * Preserves comprehensive trade post-mortems, MAE/MFE excursions,
 * and experience replay: "Have we seen this market state before?"
 */

import React, { useState } from 'react';
import {
  BookOpen,
  History,
  TrendingUp,
  Brain,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { TradeLearningRecord } from '../types/quant';

interface LearningCenterProps {
  records: TradeLearningRecord[];
  driftReports: any[];
  onQueryExperience: (params: { regime: string; volatility: number; trend: number }) => Promise<any>;
}

export const LearningCenter: React.FC<LearningCenterProps> = ({
  records,
  driftReports,
  onQueryExperience,
}) => {
  const [replayRegime, setReplayRegime] = useState<string>('TREND_UP');
  const [replayResult, setReplayResult] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQuerying(true);
    try {
      const res = await onQueryExperience({
        regime: replayRegime,
        volatility: 0.015,
        trend: 0.25,
      });
      setReplayResult(res.result);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div id="learning-center-container" className="space-y-6 p-4 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase">
              Institutional Memory & Experience Replay
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              Ensures the platform never repeats a documented mistake. Every closed trade undergoes automatic
              post-trade analysis documenting Maximum Adverse Excursion (MAE) and lessons learned.
            </p>
          </div>
        </div>
      </div>

      {/* Experience Replay Search Card */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase">
              Experience Replay: "Have We Seen This Market State Before?"
            </h3>
          </div>
        </div>

        <form onSubmit={handleQuery} className="flex flex-wrap items-center gap-3">
          <select
            value={replayRegime}
            onChange={(e) => setReplayRegime(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="TREND_UP">TREND_UP Regime</option>
            <option value="TREND_DOWN">TREND_DOWN Regime</option>
            <option value="RANGE">RANGE / CONSOLIDATION</option>
            <option value="VOLATILE_BREAKOUT">VOLATILE BREAKOUT</option>
            <option value="MOMENTUM">MOMENTUM RUN</option>
          </select>

          <button
            type="submit"
            disabled={isQuerying}
            className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors disabled:opacity-50"
          >
            {isQuerying ? 'Searching Experience Base...' : 'QUERY HISTORICAL REPLAY'}
          </button>
        </form>

        {replayResult && (
          <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-300">
              <span>Matching Historical Trades: <strong className="text-emerald-400">{replayResult.matchCount}</strong></span>
              <span>Historical Win Rate: <strong className="text-emerald-400">{replayResult.historicalWinRate}%</strong></span>
              <span>Cumulative PnL: <strong className={replayResult.cumulativePnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>${replayResult.cumulativePnL}</strong></span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
              AI Synthesis: {replayResult.synthesisAdvice}
            </div>
          </div>
        )}
      </div>

      {/* Trade Learning Records Archive */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Trade Learning Records ({records.length})
          </h3>
          <span className="text-[10px] text-slate-500">Includes MAE / MFE Excursion Metrics</span>
        </div>

        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.tradeId}
              className="p-3 bg-slate-950 rounded border border-slate-800/80 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-bold">{rec.tradeId} ({rec.symbol})</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      rec.realizedPnL >= 0
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    PnL: {rec.realizedPnL >= 0 ? '+' : ''}${rec.realizedPnL.toFixed(4)} ({rec.returnPct}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Regime: {rec.regimeAtEntry} | Confidence: {(rec.modelConfidenceAtEntry * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 bg-slate-900 p-2 rounded">
                <div>Entry: ${rec.entryPrice}</div>
                <div>Exit: ${rec.exitPrice}</div>
                <div>Max Adverse (MAE): <strong className="text-rose-400">{rec.maxAdverseExcursionBps} bps</strong></div>
                <div>Max Favorable (MFE): <strong className="text-emerald-400">{rec.maxFavorableExcursionBps} bps</strong></div>
              </div>

              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                Analysis: {rec.postTradeAnalysis}
              </p>

              {rec.lessonsLearned?.length > 0 && (
                <div className="text-[11px] text-slate-400">
                  <span className="font-bold text-amber-400">Lessons Learned: </span>
                  {rec.lessonsLearned.join(' ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
