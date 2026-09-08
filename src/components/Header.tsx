/**
 * Global Header Component
 * Institutional terminal header displaying platform state, $100 test baseline,
 * live broker status, and emergency kill-switch.
 */

import React from 'react';
import {
  Shield,
  ShieldAlert,
  Activity,
  Terminal,
  RefreshCw,
  Power,
  Server,
  Zap,
} from 'lucide-react';
import { PlatformProfile, SystemHealth, TestAccount, TradingMode } from '../types/quant';

interface HeaderProps {
  health: SystemHealth | null;
  testAccount: TestAccount | null;
  onToggleKillSwitch: () => void;
  onResetTestAccount: () => void;
  onModeChange: (mode: TradingMode) => void;
  onProfileChange: (profile: PlatformProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  testAccount,
  onToggleKillSwitch,
  onResetTestAccount,
  onModeChange,
  onProfileChange,
}) => {
  const isKillSwitchActive = health?.killSwitchEngaged ?? false;

  return (
    <header id="platform-header" className="bg-[#0f172a] border-b border-slate-800 px-4 py-2.5 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Organization */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wider text-slate-100 uppercase font-mono">
                QUANT AUTONOMOUS LAB
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                v1.0.4-PROD
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LOCAL-FIRST ENGINE</span>
              <span className="text-slate-600">|</span>
              <span>62 AUTONOMOUS AGENTS</span>
            </div>
          </div>
        </div>

        {/* Global Controls & Test Baseline */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Test Capital Badge */}
          <div
            id="test-account-baseline-badge"
            className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800"
          >
            <div className="text-left">
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                TEST CAPITAL (${testAccount?.startingBalance ? testAccount.startingBalance.toFixed(0) : '500'})
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                ${testAccount ? testAccount.currentEquity.toFixed(2) : '500.00'}{' '}
                <span className="text-[10px] text-slate-500 font-normal">
                  (P&L: {testAccount ? ((testAccount.currentEquity - testAccount.startingBalance >= 0 ? '+' : '') + (testAccount.currentEquity - testAccount.startingBalance).toFixed(2)) : '$0.00'})
                </span>
              </div>
            </div>
            <button
              id="btn-header-reset-balance"
              onClick={onResetTestAccount}
              title={`Reset Test Account to starting balance ($${testAccount?.startingBalance?.toFixed(2) || '500.00'})`}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Paper Trading Start/Pause Button */}
          <button
            id="btn-header-toggle-paper"
            onClick={() => onModeChange(health?.mode === 'PAPER' ? 'RESEARCH_ONLY' : 'PAPER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold transition-all border ${
              health?.mode === 'PAPER'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950 animate-pulse'
                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
            }`}
          >
            {health?.mode === 'PAPER' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>PAPER TRADING ACTIVE</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>START PAPER TRADING</span>
              </>
            )}
          </button>

          {/* Operational Profile Selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500 text-[10px]">PROFILE:</span>
            <select
              id="select-platform-profile"
              value={health?.profile || 'LOCAL_RESEARCH'}
              onChange={(e) => onProfileChange(e.target.value as PlatformProfile)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="LOCAL_DEV">LOCAL_DEV</option>
              <option value="LOCAL_RESEARCH">LOCAL_RESEARCH</option>
              <option value="SIMULATION">SIMULATION</option>
              <option value="PAPER">PAPER</option>
              <option value="SHADOW">SHADOW</option>
              <option value="CANARY">CANARY</option>
              <option value="LIVE">LIVE</option>
            </select>
          </div>

          {/* Trading Mode Selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500 text-[10px]">MODE:</span>
            <select
              id="select-trading-mode"
              value={health?.mode || 'RESEARCH_ONLY'}
              onChange={(e) => onModeChange(e.target.value as TradingMode)}
              className={`text-xs rounded px-2 py-1 font-bold border focus:outline-none ${
                health?.mode === 'LIVE'
                  ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              <option value="RESEARCH_ONLY">RESEARCH_ONLY</option>
              <option value="BACKTEST">BACKTEST</option>
              <option value="SIMULATION">SIMULATION</option>
              <option value="PAPER">PAPER</option>
              <option value="SHADOW">SHADOW</option>
              <option value="CANARY">CANARY</option>
              <option value="LIVE">LIVE (GATED)</option>
            </select>
          </div>

          {/* System Health Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">STATUS:</span>
            <span
              className={`font-semibold ${
                health?.status === 'HEALTHY'
                  ? 'text-emerald-400'
                  : health?.status === 'DEGRADED'
                  ? 'text-amber-400'
                  : 'text-rose-500'
              }`}
            >
              {health?.status || 'HEALTHY'}
            </span>
          </div>

          {/* Emergency Kill Switch */}
          <button
            id="btn-emergency-kill-switch"
            onClick={onToggleKillSwitch}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-semibold transition-all border ${
              isKillSwitchActive
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-rose-400 border-slate-700 hover:border-rose-600'
            }`}
          >
            {isKillSwitchActive ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                <span>KILL SWITCH ENGAGED</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>KILL SWITCH</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
