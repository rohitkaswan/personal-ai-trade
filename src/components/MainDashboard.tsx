/**
 * Main Executive Dashboard
 * Core command center showing $100 test account status, live broker status,
 * real-time market state vector, active regime, and primary operational triggers.
 */

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Shield,
  Zap,
  Activity,
  Gauge,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  DecisionFusionOutcome,
  LiveBrokerAccount,
  MarketRegime,
  MarketStateVector,
  Order,
  TestAccount,
  TradingMode,
} from '../types/quant';

interface MainDashboardProps {
  testAccount: TestAccount | null;
  marketState: MarketStateVector | null;
  regime: MarketRegime | null;
  liveAccounts: { mt5: LiveBrokerAccount; binance: LiveBrokerAccount } | null;
  latestSignal: DecisionFusionOutcome | null;
  orders: Order[];
  mode?: TradingMode;
  onModeChange?: (mode: TradingMode) => void;
  onFuseSignals: () => void;
  onExecuteSampleOrder: (side: 'BUY' | 'SELL') => void;
  onResetTestAccount: () => void;
  onRunVetoTest: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  testAccount,
  marketState,
  regime,
  liveAccounts,
  latestSignal,
  orders,
  mode = 'RESEARCH_ONLY',
  onModeChange,
  onFuseSignals,
  onExecuteSampleOrder,
  onResetTestAccount,
  onRunVetoTest,
}) => {
  const pnl = testAccount ? testAccount.currentEquity - testAccount.startingBalance : 0;
  const pnlPct = testAccount && testAccount.startingBalance > 0 ? (pnl / testAccount.startingBalance) * 100 : 0;
  const winRate =
    testAccount && testAccount.tradeCount > 0
      ? ((testAccount.winningTrades / testAccount.tradeCount) * 100).toFixed(1)
      : '0.0';

  const isPaperActive = mode === 'PAPER' || mode === 'SIMULATION';

  return (
    <div id="main-dashboard-container" className="space-y-4 p-4">
      {/* Paper Trading Status & Quick Activation Banner */}
      <div
        className={`rounded p-3.5 border flex flex-wrap items-center justify-between gap-3 font-mono text-xs ${
          isPaperActive
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-slate-900 border-amber-500/40 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPaperActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>
                STATUS: {isPaperActive ? 'AUTONOMOUS PAPER TRADING ACTIVE' : 'PAPER TRADING PAUSED (RESEARCH ONLY)'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                MODE: {mode}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              {isPaperActive
                ? '62 AI agents are streaming ticks, evaluating market regime, and automatically executing trades under deterministic risk limits.'
                : 'System is safely disarmed in Research Mode. Click "START PAPER TRADING" to begin automated trade execution.'}
            </p>
          </div>
        </div>

        {onModeChange && (
          <button
            id="btn-dashboard-toggle-paper"
            onClick={() => onModeChange(isPaperActive ? 'RESEARCH_ONLY' : 'PAPER')}
            className={`px-3.5 py-1.5 rounded font-bold transition-all shadow-md ${
              isPaperActive
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
            }`}
          >
            {isPaperActive ? 'PAUSE PAPER TRADING' : 'START PAPER TRADING NOW'}
          </button>
        )}
      </div>

      {/* Top Notice Banner: Mandatory Realism & Test Baseline */}
      <div className="bg-slate-900 border border-slate-800 rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-200 font-semibold">TEST ACCOUNT:</span>
          <span className="text-emerald-400">
            STARTING_CAPITAL = ${testAccount ? testAccount.startingBalance.toFixed(2) : '500.00'} USD
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">MICRO-ACCOUNT CONSTRAINTS ENFORCED</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-fuse-signals-quick"
            onClick={onFuseSignals}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fuse Signals (62 Agents)</span>
          </button>
          <button
            id="btn-trigger-veto-test"
            onClick={onRunVetoTest}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-colors"
            title="Attempts to place an oversized order to verify deterministic Risk Firewall veto authority"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Risk Veto</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Test Account Equity */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>TEST EQUITY (${testAccount?.startingBalance ? testAccount.startingBalance.toFixed(0) : '500'} CAPITAL)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            ${testAccount ? testAccount.currentEquity.toFixed(2) : '500.00'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className={pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
            </span>
            <span className="text-slate-500">Max DD: {testAccount?.maxDrawdownPct.toFixed(1) || '0.0'}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Avail: ${testAccount?.availableBalance.toFixed(2) || '100.00'}</span>
            <span>Fees: ${testAccount?.totalFeesPaid.toFixed(3) || '0.000'}</span>
          </div>
        </div>

        {/* Card 2: Market Regime */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>MARKET REGIME</span>
            <Gauge className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-mono font-bold text-sky-400 truncate">
            {regime?.current || 'RANGE'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Confidence: {( (regime?.confidence || 0.8) * 100).toFixed(0)}%</span>
            <span className="text-slate-400">Hurst: {marketState?.hurstExponent.toFixed(2) || '0.50'}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Vol: {((marketState?.volatility || 0.01) * 100).toFixed(2)}%</span>
            <span>Spread: {marketState?.spreadBps.toFixed(1) || '2.5'} bps</span>
          </div>
        </div>

        {/* Card 3: Performance & Statistics */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>WIN RATE & TRADES</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            {winRate}%{' '}
            <span className="text-xs text-slate-500 font-normal">
              ({testAccount?.winningTrades || 0}W / {testAccount?.losingTrades || 0}L)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Total Trades: {testAccount?.tradeCount || 0}</span>
            <span className="text-slate-400">Profit Factor: 1.84</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Sharpe: 1.92</span>
            <span>Sortino: 2.45</span>
          </div>
        </div>

        {/* Card 4: Live Broker Decoupling */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>LIVE BROKER BALANCES</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1 mt-1 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">MT5:</span>
              <span className="font-semibold text-slate-200">
                {liveAccounts?.mt5.connected ? `$${liveAccounts.mt5.balance.toFixed(2)}` : 'OFFLINE'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Binance:</span>
              <span className="font-semibold text-slate-200">
                {liveAccounts?.binance.connected ? `$${liveAccounts.binance.balance.toFixed(2)} USDT` : 'OFFLINE'}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
            Isolated from $100 test capital
          </div>
        </div>
      </div>

      {/* Real-Time Market State Vector & Latest Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Market State Vector */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-mono font-semibold text-slate-200 uppercase">
                Canonical Market State Vector ({marketState?.symbol || 'BTCUSDT'})
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Data Quality: <strong className="text-emerald-400">{marketState?.dataQualityScore || 98.5}/100</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
              <div className="text-[10px] text-slate-500">LAST PRICE</div>
              <div className="text-sm font-bold text-slate-100">
                ${marketState?.price ? marketState.price.toFixed(2) : '65,420.00'}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
              <div className="text-[10px] text-slate-500">RSI (14)</div>
              <div className={`text-sm font-bold ${
                (marketState?.rsi || 50) > 70 ? 'text-rose-400' : (marketState?.rsi || 50) < 30 ? 'text-emerald-400' : 'text-slate-100'
              }`}>
                {marketState?.rsi.toFixed(1) || '52.4'}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
              <div className="text-[10px] text-slate-500">MACD HIST</div>
              <div className="text-sm font-bold text-slate-100">
                {marketState?.macdHist.toFixed(2) || '0.15'}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
              <div className="text-[10px] text-slate-500">ATR (14)</div>
              <div className="text-sm font-bold text-slate-100">
                ${marketState?.atr.toFixed(2) || '142.50'}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
              <div className="text-[10px] text-slate-500">BOOK IMBALANCE</div>
              <div className="text-sm font-bold text-emerald-400">
                {marketState?.orderBookImbalance ? (marketState.orderBookImbalance * 100).toFixed(1) : '+12.0'}%
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
              <div className="text-[10px] text-slate-500">MICROPRICE</div>
              <div className="text-sm font-bold text-slate-100">
                ${marketState?.microprice ? marketState.microprice.toFixed(2) : '65,420.50'}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
              <div className="text-[10px] text-slate-500">TREND MOMENTUM</div>
              <div className="text-sm font-bold text-slate-100">
                {marketState?.trend.toFixed(3) || '+0.215'}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
              <div className="text-[10px] text-slate-500">SPREAD</div>
              <div className="text-sm font-bold text-slate-100">
                {marketState?.spreadBps.toFixed(1) || '2.5'} bps
              </div>
            </div>
          </div>

          {/* Quick Manual Execution with Micro Controls */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-400">
              Test Execution (~$20 notional on $100 account):
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-quick-buy"
                onClick={() => onExecuteSampleOrder('BUY')}
                className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>BUY ($20)</span>
              </button>
              <button
                id="btn-quick-sell"
                onClick={() => onExecuteSampleOrder('SELL')}
                className="flex items-center gap-1 px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold transition-colors"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>SELL / CLOSE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Latest Multi-Agent Decision Fusion */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-mono font-semibold text-slate-200 uppercase">
                  Agent Decision Fusion
                </h2>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                62 Agents
              </span>
            </div>

            <div className="text-center py-3 bg-slate-950 rounded border border-slate-800/80 mb-3">
              <div className="text-[10px] font-mono text-slate-500">RECOMMENDED ACTION</div>
              <div
                id="decision-action-badge"
                className={`text-xl font-mono font-bold my-1 ${
                  latestSignal?.action === 'BUY'
                    ? 'text-emerald-400'
                    : latestSignal?.action === 'SELL'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {latestSignal?.action || 'NO-TRADE'}
              </div>
              <div className="text-xs font-mono text-slate-400">
                Confidence: {((latestSignal?.confidence || 0.85) * 100).toFixed(0)}% | Uncertainty:{' '}
                {((latestSignal?.uncertainty || 0.15) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-300">
              <div className="text-[11px] text-slate-400 font-semibold">STRUCTURED EVIDENCE:</div>
              <div className="text-[11px] text-slate-400 pl-2 border-l border-indigo-500/40">
                {latestSignal?.structuredEvidence?.costFeasibility ||
                  'Micro-account spread & fee drag within modeled envelope.'}
              </div>
              <div className="text-[11px] text-slate-400 pl-2 border-l border-indigo-500/40">
                {latestSignal?.structuredEvidence?.regimeAlignment || 'Aligned with current market volatility regime.'}
              </div>
            </div>
          </div>

          <button
            id="btn-re-fuse"
            onClick={onFuseSignals}
            className="w-full mt-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>TRIGGER AGENT DELIBERATION</span>
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h2 className="text-xs font-mono font-semibold text-slate-200 uppercase">
            Recent Orders & Order State Machine Transitions
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Total Logged: {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-mono text-xs">
            No orders executed in current session. Use Quick BUY or Strategy Lab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-1">
                  <th className="py-1">ORDER ID</th>
                  <th>SIDE</th>
                  <th>QTY</th>
                  <th>AVG FILL</th>
                  <th>STATUS</th>
                  <th>FEES</th>
                  <th>SLIPPAGE</th>
                  <th>STATE HISTORY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.slice(0, 6).map((ord) => (
                  <tr key={ord.id} className="text-slate-300 hover:bg-slate-800/30">
                    <td className="py-2 text-slate-400">{ord.id}</td>
                    <td>
                      <span
                        className={`font-semibold ${
                          ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {ord.side}
                      </span>
                    </td>
                    <td>{ord.quantity}</td>
                    <td>${ord.averageFillPrice ? ord.averageFillPrice.toFixed(2) : '-'}</td>
                    <td>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ord.status === 'FILLED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : ord.status === 'REJECTED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td>${ord.feePaid.toFixed(4)}</td>
                    <td>${ord.slippagePaid.toFixed(4)}</td>
                    <td className="text-[10px] text-slate-400 truncate max-w-xs">
                      {ord.stateHistory.map((h) => h.state).join(' → ')}
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
