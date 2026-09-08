/**
 * Autonomous Research Center
 * Scientific experiment tracking, canonical $100 baseline verification,
 * and AI Hypothesis Generation powered by Gemini 3.8 Flash.
 */

import React, { useState } from 'react';
import {
  Microscope,
  Sparkles,
  FlaskConical,
  CheckCircle2,
  Calendar,
  Hash,
  ArrowUpRight,
  Database,
} from 'lucide-react';
import { MarketRegimeType } from '../types/quant';

interface ResearchCenterProps {
  experiments: any[];
  currentRegime: MarketRegimeType;
  onGenerateHypothesis: (params: { regime: string; weakness: string }) => Promise<any>;
}

export const ResearchCenter: React.FC<ResearchCenterProps> = ({
  experiments,
  currentRegime,
  onGenerateHypothesis,
}) => {
  const [weakness, setWeakness] = useState<string>(
    'Elevated false breakout rate during low-volume micro-ranges'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hypothesisResult, setHypothesisResult] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setHypothesisResult(null);
    try {
      const res = await onGenerateHypothesis({
        regime: currentRegime,
        weakness,
      });
      setHypothesisResult(res.hypothesis);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="research-center-container" className="space-y-6 p-4 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase">
              Autonomous Quantitative Research & Experiment Repository
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              Tracks reproducible empirical experiments under fixed random seeds, versioned market datasets,
              and strict out-of-sample validation.
            </p>
          </div>
        </div>
      </div>

      {/* AI Hypothesis Generator (Gemini 3.8 Flash) */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase">
              Autonomous Hypothesis Generator (Gemini 3.8 Flash)
            </h3>
          </div>
          <span className="text-[10px] text-indigo-400 font-semibold">Active Regime: {currentRegime}</span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">
              OBSERVED STRATEGY WEAKNESS OR REGIME ANOMALY:
            </label>
            <input
              type="text"
              value={weakness}
              onChange={(e) => setWeakness(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Synthesizing Hypothesis...' : 'GENERATE SCIENTIFIC HYPOTHESIS'}</span>
          </button>
        </form>

        {hypothesisResult && (
          <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-[11px] text-slate-300">
            <div className="font-bold text-emerald-400">HYPOTHESIS ID: {hypothesisResult.id}</div>
            <div className="text-slate-200 font-semibold">{hypothesisResult.statement}</div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Rationale: {hypothesisResult.rationale}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
              <span>Target Metrics: {hypothesisResult.targetMetrics?.join(', ')}</span>
              <span>Falsification Threshold: {hypothesisResult.falsificationThreshold}</span>
            </div>
          </div>
        )}
      </div>

      {/* Experiments Repository */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Validated Experiments Archive ({experiments.length})
          </h3>
          <span className="text-[10px] text-slate-500">Includes Canonical $100 Baseline</span>
        </div>

        <div className="space-y-3">
          {experiments.map((exp) => (
            <div
              key={exp.experimentId}
              className="p-3 bg-slate-950 rounded border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{exp.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                    {exp.status}
                  </span>
                </div>
                <span className="text-slate-500 text-[10px]">
                  Seed: {exp.randomSeed} | Dataset: {exp.datasetVersion}
                </span>
              </div>

              <p className="text-slate-400 text-xs font-sans leading-relaxed">{exp.hypothesis}</p>

              {exp.metrics && (
                <div className="p-2 rounded bg-slate-900 border border-slate-800/60 flex flex-wrap gap-4 text-[11px]">
                  <div>Starting: <strong className="text-slate-200">${exp.metrics.startingBalance.toFixed(2)}</strong></div>
                  <div>Ending: <strong className="text-emerald-400">${exp.metrics.endingBalance.toFixed(2)}</strong></div>
                  <div>Return: <strong className="text-emerald-400">+{exp.metrics.returnPct.toFixed(2)}%</strong></div>
                  <div>Max DD: <strong className="text-amber-400">{exp.metrics.maxDrawdownPct.toFixed(1)}%</strong></div>
                  <div>Sharpe: <strong className="text-emerald-400">{exp.metrics.sharpeRatio.toFixed(2)}</strong></div>
                </div>
              )}

              {exp.conclusion && (
                <div className="text-[11px] text-slate-300 italic border-l-2 border-emerald-500 pl-2">
                  Conclusion: {exp.conclusion}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
