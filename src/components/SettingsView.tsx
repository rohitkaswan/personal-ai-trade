/**
 * Platform Settings & Environment Configuration View
 */

import React, { useState } from 'react';
import { Sliders, RefreshCw, Shield, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { PlatformProfile, TestAccount, TradingMode } from '../types/quant';

interface SettingsViewProps {
  currentProfile: PlatformProfile;
  currentMode: TradingMode;
  testAccount: TestAccount | null;
  onProfileChange: (profile: PlatformProfile) => void;
  onModeChange: (mode: TradingMode) => void;
  onResetTestAccount: (amount?: number) => void;
  onSetTestBalance?: (balance: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentProfile,
  currentMode,
  testAccount,
  onProfileChange,
  onModeChange,
  onResetTestAccount,
  onSetTestBalance,
}) => {
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('500');

  const handleReset = (amount: number = 500) => {
    onResetTestAccount(amount);
    setResetMessage(`Test account reset to $${amount.toFixed(2)} baseline.`);
    setTimeout(() => setResetMessage(null), 4000);
  };

  const handleApplyCustomBalance = () => {
    const num = parseFloat(customBalanceInput);
    if (!isNaN(num) && num > 0) {
      if (onSetTestBalance) {
        onSetTestBalance(num);
      } else {
        onResetTestAccount(num);
      }
      setResetMessage(`Account balance set to $${num.toFixed(2)}.`);
      setTimeout(() => setResetMessage(null), 4000);
    }
  };

  const currentStarting = testAccount?.startingBalance || 500;
  const maxPositionLimit = (currentStarting * 0.25).toFixed(2);
  const dailyLossLimit = (currentStarting * 0.05).toFixed(2);

  return (
    <div id="settings-view-container" className="space-y-6 p-4 font-mono text-xs max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-slate-800 text-slate-200">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase">
              Platform Configuration & Environment Profiles
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Adjust platform execution profile, test capital baseline, and operational isolation policies.
            </p>
          </div>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
          {resetMessage}
        </div>
      )}

      {/* Profile & Mode Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase border-b border-slate-800 pb-2">
          Platform Deployment Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">ACTIVE PROFILE</label>
            <select
              value={currentProfile}
              onChange={(e) => onProfileChange(e.target.value as PlatformProfile)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="LOCAL_DEV">LOCAL_DEV</option>
              <option value="LOCAL_RESEARCH">LOCAL_RESEARCH</option>
              <option value="SIMULATION">SIMULATION</option>
              <option value="PAPER">PAPER</option>
              <option value="SHADOW">SHADOW</option>
              <option value="CANARY">CANARY</option>
              <option value="LIVE">LIVE (RESTRICTED)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">TRADING MODE</label>
            <select
              value={currentMode}
              onChange={(e) => onModeChange(e.target.value as TradingMode)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="RESEARCH_ONLY">RESEARCH_ONLY</option>
              <option value="BACKTEST">BACKTEST</option>
              <option value="SIMULATION">SIMULATION</option>
              <option value="PAPER">PAPER</option>
              <option value="SHADOW">SHADOW</option>
              <option value="CANARY">CANARY</option>
              <option value="LIVE">LIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Capital & Balance Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Test Account Capital & Risk Baseline
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono">
            Active: ${currentStarting.toFixed(2)} USD
          </span>
        </div>

        <p className="text-slate-400 font-sans text-xs">
          Configure active paper/simulation capital. When capital changes, the Risk Firewall automatically
          re-scales maximum position limits (25% of capital) and daily loss thresholds (5% of capital) to preserve strict capital preservation discipline.
        </p>

        {/* Current State & Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950 rounded border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[11px]">Current Equity:</span>
            <span className="text-emerald-400 font-bold text-lg">
              ${testAccount?.currentEquity.toFixed(2) || '500.00'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Max Position Limit (25%):</span>
            <span className="text-sky-400 font-bold text-lg">
              ${maxPositionLimit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Daily Loss Limit (5%):</span>
            <span className="text-amber-400 font-bold text-lg">
              ${dailyLossLimit}
            </span>
          </div>
        </div>

        {/* Capital Presets and Custom Input */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            id="btn-set-capital-500"
            onClick={() => handleReset(500)}
            className={`px-3 py-1.5 rounded font-mono font-bold transition-all border ${
              currentStarting === 500
                ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            SET $500.00 CAPITAL
          </button>
          <button
            id="btn-set-capital-100"
            onClick={() => handleReset(100)}
            className={`px-3 py-1.5 rounded font-mono font-bold transition-all border ${
              currentStarting === 100
                ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            SET $100.00 BASELINE
          </button>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400 text-[11px]">Custom ($):</span>
            <input
              type="number"
              value={customBalanceInput}
              onChange={(e) => setCustomBalanceInput(e.target.value)}
              className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-center font-mono"
            />
            <button
              onClick={handleApplyCustomBalance}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Transition Guide: 1-2 Months Paper to $100 Live Trading */}
      <div className="bg-slate-900 border border-indigo-900/40 rounded p-5 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-xs border-b border-slate-800 pb-2">
          <Shield className="w-4 h-4" />
          <span>Institutional Analysis: Will Live Trading with $100 Work After 1-2 Months of Paper Trading?</span>
        </div>

        <div className="font-sans text-xs text-slate-300 space-y-2.5 leading-relaxed">
          <p>
            <strong className="text-emerald-400 font-mono">YES, IT WILL WORK</strong> — provided you follow the micro-account execution rules and verify quantitative benchmarks during your paper trading period:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <span className="font-bold text-sky-300 block font-mono text-[11px]">
                1. Venue Minimum Notional Constraints
              </span>
              <p className="text-slate-400 text-[11px]">
                Exchanges enforce hard minimum order sizes ($5 on Binance USDT-M Futures, $10 on Binance Spot, 0.01 micro-lot on MT5 Forex/Crypto). On a $100 account, a $10 position represents 10% of equity. The platform's Half-Kelly sizer accounts for this by bounding positions between $10 and $25 (10% to 25%), ensuring orders are neither rejected by the venue nor excessively leveraged.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300 block font-mono text-[11px]">
                2. Fee Drag & Spread Impact
              </span>
              <p className="text-slate-400 text-[11px]">
                On a $100 account, a $0.05 taker fee represents 5 bps of total equity. Strategies must target clean signal-to-noise ratios (average trade return &gt; 35 bps) to outpace fee drag. The platform's backtester and paper engine simulate realistic 4 bps fee drag and 2 bps quadratic slippage on every simulated execution.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-300 block font-mono text-[11px]">
                3. The 1-2 Month Paper Trading Checklist
              </span>
              <ul className="text-slate-400 text-[11px] list-disc list-inside space-y-0.5">
                <li>Out-of-sample Sharpe Ratio &gt; 1.25 over 60+ days</li>
                <li>Feature Drift PSI &lt; 0.25 across market regimes</li>
                <li>Maximum Drawdown &lt; 8.0% during paper testing</li>
                <li>Zero broker ledger reconciliation discrepancies</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-300 block font-mono text-[11px]">
                4. Gradual Transition Path (Paper -&gt; Canary -&gt; Live)
              </span>
              <p className="text-slate-400 text-[11px]">
                Before committing full capital to LIVE mode, toggle to <code className="text-slate-200">CANARY</code> profile first for 3-5 days. Canary mode routes micro orders ($5 minimum) to the live exchange API to measure actual venue fills, latency, and real slippage before scaling to the full $100 live balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
