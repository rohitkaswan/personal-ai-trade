/**
 * Deterministic Risk Firewall Center
 * Enforces non-negotiable risk limits, final veto authority,
 * real-time stress testing, and tamper-evident audit logs.
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Sliders,
  History,
  RotateCcw,
} from 'lucide-react';
import { RiskFirewallAuditEntry, RiskLimits } from '../types/quant';

interface RiskCenterProps {
  limits: RiskLimits | null;
  auditLog: RiskFirewallAuditEntry[];
  killSwitchActive: boolean;
  onToggleKillSwitch: () => void;
  onUpdateLimits: (limits: Partial<RiskLimits>) => Promise<any>;
  onRunVetoTest: () => Promise<any>;
}

export const RiskCenter: React.FC<RiskCenterProps> = ({
  limits,
  auditLog,
  killSwitchActive,
  onToggleKillSwitch,
  onUpdateLimits,
  onRunVetoTest,
}) => {
  const [maxRiskPct, setMaxRiskPct] = useState(limits?.maxRiskPerTradePct || 1.5);
  const [maxPosUsd, setMaxPosUsd] = useState(limits?.maxPositionNotionalUsd || 25.0);
  const [maxExposureUsd, setMaxExposureUsd] = useState(limits?.maxTotalExposureUsd || 60.0);
  const [maxDrawdownPct, setMaxDrawdownPct] = useState(limits?.maxCumulativeDrawdownPct || 8.0);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [vetoTestOutput, setVetoTestOutput] = useState<any | null>(null);

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      await onUpdateLimits({
        maxRiskPerTradePct: maxRiskPct,
        maxPositionNotionalUsd: maxPosUsd,
        maxTotalExposureUsd: maxExposureUsd,
        maxCumulativeDrawdownPct: maxDrawdownPct,
      });
      setSaveStatus('Limits updated successfully.');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus(err.message || 'Failed to update limits');
    }
  };

  const handleVetoTest = async () => {
    try {
      const res = await onRunVetoTest();
      setVetoTestOutput(res);
    } catch (err: any) {
      setVetoTestOutput({ error: err.message });
    }
  };

  return (
    <div id="risk-center-container" className="space-y-6 p-4">
      {/* Top Banner: Independent Firewall Independence */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-200 uppercase">
              Deterministic Risk Firewall (Non-Bypassable Authority)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              The Risk Firewall operates outside the agent loop and holds final, unilateral veto authority over all orders.
              AI agents cannot modify or bypass these constraints. Any violation results in deterministic rejection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-run-adversarial-veto"
            onClick={handleVetoTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-semibold transition-colors"
          >
            <Flame className="w-4 h-4" />
            <span>TRIGGER ADVERSARIAL VETO TEST</span>
          </button>
        </div>
      </div>

      {/* Adversarial Test Result Banner */}
      {vetoTestOutput && (
        <div className="bg-slate-900 border border-amber-500/40 rounded p-4 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>EMPIRICAL RISK VETO VERIFICATION RESULT:</span>
            </div>
            <button
              onClick={() => setVetoTestOutput(null)}
              className="text-slate-500 hover:text-slate-300"
            >
              Dismiss
            </button>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Verdict: <strong className="text-rose-400">{vetoTestOutput.result?.riskCheck?.verdict}</strong> |
            Order Status: <strong className="text-rose-400">{vetoTestOutput.result?.order?.status}</strong>
            <div className="mt-1 text-slate-400">
              Reasons: {vetoTestOutput.result?.riskCheck?.reasons?.join('; ')}
            </div>
          </div>
        </div>
      )}

      {/* Two Column Grid: Configurable Limits vs Active Enforcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Limits Configuration Form */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
                Risk Firewall Constraints ($100 Micro-Account)
              </h3>
            </div>
          </div>

          <form onSubmit={handleSaveLimits} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">MAX RISK PER TRADE (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxRiskPct}
                  onChange={(e) => setMaxRiskPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Default: 1.5% ($1.50 on $100)</span>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">MAX POSITION NOTIONAL ($)</label>
                <input
                  type="number"
                  step="1"
                  value={maxPosUsd}
                  onChange={(e) => setMaxPosUsd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Default: $25.00 (25% cap)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">MAX GROSS EXPOSURE ($)</label>
                <input
                  type="number"
                  step="5"
                  value={maxExposureUsd}
                  onChange={(e) => setMaxExposureUsd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Default: $60.00 (60% cap)</span>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">MAX CUMULATIVE DRAWDOWN (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxDrawdownPct}
                  onChange={(e) => setMaxDrawdownPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Default: 8.0% halt threshold</span>
              </div>
            </div>

            {saveStatus && (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-400">
                {saveStatus}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
            >
              SAVE FIREWALL PARAMETERS
            </button>
          </form>
        </div>

        {/* Emergency Kill Switch Status Card */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
                Emergency Circuit Breaker
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  killSwitchActive
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {killSwitchActive ? 'HALT ACTIVE' : 'NORMAL ARMED'}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              When engaged, the Kill Switch vetoes all incoming and in-flight orders with immediate effect.
              Existing positions are guarded and new risk creation is strictly prohibited until disengaged.
            </p>

            <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Inactivity Timeout:</span>
                <span>60 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Spread Tolerance:</span>
                <span>20.0 bps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Min Data Quality:</span>
                <span>80.0 / 100</span>
              </div>
            </div>
          </div>

          <button
            onClick={onToggleKillSwitch}
            className={`w-full mt-4 py-2.5 rounded font-mono text-xs font-bold transition-all ${
              killSwitchActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950'
            }`}
          >
            {killSwitchActive ? 'DISENGAGE EMERGENCY KILL SWITCH' : 'ENGAGE EMERGENCY KILL SWITCH'}
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
              Firewall Audit Log (Last {auditLog.length} Evaluations)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Tamper-evident logs</span>
        </div>

        {auditLog.length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-mono text-xs">
            No firewall evaluations logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-1">
                  <th className="py-1">TIMESTAMP</th>
                  <th>ORDER ID</th>
                  <th>SYMBOL</th>
                  <th>VERDICT</th>
                  <th>REASONS / AUDIT NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLog.slice(0, 10).map((entry, idx) => (
                  <tr key={idx} className="text-slate-300">
                    <td className="py-2 text-slate-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="text-slate-400">{entry.orderId}</td>
                    <td>{entry.symbol}</td>
                    <td>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          entry.verdict === 'APPROVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {entry.verdict}
                      </span>
                    </td>
                    <td className="text-slate-400 max-w-md truncate">
                      {entry.reasons.join('; ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
