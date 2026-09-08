/**
 * Model Lab & Governance Center
 * Champion / Challenger / Shadow Model Lifecycle, Drift Detection (PSI),
 * and Safe Rollback Capabilities.
 */

import React, { useState } from 'react';
import {
  BrainCircuit,
  Award,
  RotateCcw,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { ModelMetadata } from '../types/quant';

interface ModelLabProps {
  models: ModelMetadata[];
  onPromoteChallenger: (challengerId: string) => Promise<any>;
  onRollbackChampion: () => Promise<any>;
  onRefreshModels: () => void;
}

export const ModelLab: React.FC<ModelLabProps> = ({
  models,
  onPromoteChallenger,
  onRollbackChampion,
  onRefreshModels,
}) => {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const champion = models.find((m) => m.role === 'CHAMPION');
  const challenger = models.find((m) => m.role === 'CHALLENGER');

  const handlePromote = async (id: string) => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await onPromoteChallenger(id);
      setActionMessage(res.message);
      onRefreshModels();
    } catch (err: any) {
      setActionMessage(err.message || 'Promotion failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollback = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await onRollbackChampion();
      setActionMessage(res.message);
      onRefreshModels();
    } catch (err: any) {
      setActionMessage(err.message || 'Rollback failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="model-lab-container" className="space-y-6 p-4">
      {/* Top Banner: Strict Model Governance */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-200 uppercase">
              Model Governance & Champion / Challenger Sandbox
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              Strictly enforces out-of-sample promotion gates. Challengers run in shadow mode and must demonstrate
              superior Sharpe ratio, lower Brier uncertainty, and stable feature distributions (PSI &lt; 0.15) before production rollout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {champion?.rollbackVersion && (
            <button
              id="btn-rollback-champion"
              onClick={handleRollback}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Safe Rollback</span>
            </button>
          )}
          <button
            onClick={onRefreshModels}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Refresh models"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded bg-slate-900 border border-sky-500/40 text-xs font-mono text-slate-200 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-500 hover:text-slate-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {models.map((model) => {
          const isChampion = model.role === 'CHAMPION';
          const isChallenger = model.role === 'CHALLENGER';

          return (
            <div
              key={model.id}
              className={`rounded p-4 border flex flex-col justify-between ${
                isChampion
                  ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                  : isChallenger
                  ? 'bg-slate-900 border-sky-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400 font-bold">{model.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isChampion
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : isChallenger
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {model.role}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{model.name}</h3>
                <div className="text-[11px] text-slate-500">v{model.version} ({model.architecture})</div>

                {/* Metrics */}
                <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Out-Of-Sample Sharpe:</span>
                    <span className="text-emerald-400 font-bold">{model.outOfSampleSharpe.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accuracy (Regime F1):</span>
                    <span className="text-slate-200">{model.outOfSampleAccuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Brier Uncertainty:</span>
                    <span className="text-slate-200">{model.brierUncertaintyScore.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Feature Drift (PSI):</span>
                    <span
                      className={`font-semibold ${
                        model.psiScore < 0.1 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {model.psiScore.toFixed(3)} ({model.driftStatus})
                    </span>
                  </div>
                </div>

                {/* Feature Inputs */}
                <div className="mt-3">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">Feature Set:</div>
                  <div className="flex flex-wrap gap-1">
                    {model.features.map((f, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                {isChallenger ? (
                  <button
                    onClick={() => handlePromote(model.id)}
                    disabled={isLoading}
                    className="w-full py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>PROMOTE TO CHAMPION</span>
                  </button>
                ) : isChampion ? (
                  <div className="text-center py-1.5 text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>ACTIVE PRODUCTION INFERENCE</span>
                  </div>
                ) : (
                  <div className="text-center py-1.5 text-slate-500">
                    SHADOW EVALUATION
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
