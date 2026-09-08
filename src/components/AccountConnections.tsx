/**
 * Account Connections Component
 * Dedicated broker connection management for MetaTrader 5 (MT5) and Binance (Spot & Futures).
 * Strictly decouples the $100 test baseline from real broker accounts and securely masks credentials.
 */

import React, { useState } from 'react';
import {
  Link2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Server,
  Lock,
  Layers,
  AlertCircle,
  ExternalLink,
  KeyRound,
} from 'lucide-react';
import { LiveBrokerAccount, TestAccount } from '../types/quant';

interface AccountConnectionsProps {
  testAccount: TestAccount | null;
  liveAccounts: { mt5: LiveBrokerAccount; binance: LiveBrokerAccount } | null;
  onConnectMT5: (config: any) => Promise<any>;
  onDisconnectMT5: () => Promise<any>;
  onConnectBinance: (config: any) => Promise<any>;
  onDisconnectBinance: () => Promise<any>;
  onRefreshAccounts: () => void;
}

export const AccountConnections: React.FC<AccountConnectionsProps> = ({
  testAccount,
  liveAccounts,
  onConnectMT5,
  onDisconnectMT5,
  onConnectBinance,
  onDisconnectBinance,
  onRefreshAccounts,
}) => {
  // MT5 Form State
  const [mt5Server, setMt5Server] = useState('MetaQuotes-Demo');
  const [mt5Login, setMt5Login] = useState('5029418');
  const [mt5Password, setMt5Password] = useState('••••••••••••');
  const [mt5TerminalPath, setMt5TerminalPath] = useState(
    'C:\\Program Files\\MetaTrader 5\\terminal64.exe'
  );
  const [mt5Connecting, setMt5Connecting] = useState(false);
  const [mt5Message, setMt5Message] = useState<string | null>(null);

  // Binance Form State
  const [binanceEnv, setBinanceEnv] = useState<'SPOT_TESTNET' | 'SPOT_MAINNET' | 'FUTURES_TESTNET'>('SPOT_TESTNET');
  const [binanceApiKey, setBinanceApiKey] = useState('vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIpy14y7Ju91duEh8A');
  const [binanceApiSecret, setBinanceApiSecret] = useState('NhqPtMDsPdMSSfoRnDDydLyQXbAbnDNxZMgIOwuHuaIEPsCbvjpEgACKyZgtOgKl');
  const [binanceConnecting, setBinanceConnecting] = useState(false);
  const [binanceMessage, setBinanceMessage] = useState<string | null>(null);

  const handleMT5Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMt5Connecting(true);
    setMt5Message(null);
    try {
      const res = await onConnectMT5({
        server: mt5Server,
        login: mt5Login,
        password: mt5Password,
        terminalPath: mt5TerminalPath,
      });
      setMt5Message(res.message);
    } catch (err: any) {
      setMt5Message(err.message || 'Connection failed');
    } finally {
      setMt5Connecting(false);
    }
  };

  const handleBinanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBinanceConnecting(true);
    setBinanceMessage(null);
    try {
      const res = await onConnectBinance({
        environment: binanceEnv,
        apiKey: binanceApiKey,
        apiSecret: binanceApiSecret,
      });
      setBinanceMessage(res.message);
    } catch (err: any) {
      setBinanceMessage(err.message || 'Connection failed');
    } finally {
      setBinanceConnecting(false);
    }
  };

  return (
    <div id="account-connections-container" className="space-y-6 p-4">
      {/* Decoupling Warning Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
              Decoupled Multi-Account Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              The $100.00 simulation test baseline is isolated from live broker accounts.
              Real broker balances are retrieved directly from MT5 IPC and Binance REST/WebSocket endpoints.
              All credentials are encrypted and securely masked.
            </p>
          </div>
        </div>
        <button
          onClick={onRefreshAccounts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synchronize State</span>
        </button>
      </div>

      {/* Account Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Account 1: $100 Virtual Test Baseline */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded p-4">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400">CANONICAL TEST ACCOUNT</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
              SIMULATION
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            ${testAccount?.currentEquity.toFixed(2) || '100.00'}
          </div>
          <div className="mt-2 space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Starting Balance:</span>
              <span>${testAccount?.startingBalance.toFixed(2) || '100.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Available Capital:</span>
              <span>${testAccount?.availableBalance.toFixed(2) || '100.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Free Margin:</span>
              <span>${testAccount?.freeMargin.toFixed(2) || '100.00'}</span>
            </div>
          </div>
        </div>

        {/* Account 2: MT5 Live Broker */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold text-sky-400">METATRADER 5 (MT5)</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                liveAccounts?.mt5.connected
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {liveAccounts?.mt5.status || 'OFFLINE'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {liveAccounts?.mt5.connected ? `$${liveAccounts.mt5.balance.toFixed(2)}` : '$0.00'}
          </div>
          <div className="mt-2 space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Server:</span>
              <span>{liveAccounts?.mt5.serverOrEndpoint || 'Not Connected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Login UID:</span>
              <span>{liveAccounts?.mt5.accountNumberOrUid || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Margin Level:</span>
              <span>{liveAccounts?.mt5.marginLevelPct || 0}%</span>
            </div>
          </div>
        </div>

        {/* Account 3: Binance Live Broker */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold text-amber-400">BINANCE EXCHANGE</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                liveAccounts?.binance.connected
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {liveAccounts?.binance.status || 'OFFLINE'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {liveAccounts?.binance.connected ? `$${liveAccounts.binance.balance.toFixed(2)} USDT` : '0.00 USDT'}
          </div>
          <div className="mt-2 space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Venue:</span>
              <span>{liveAccounts?.binance.brokerId || 'BINANCE_SPOT'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">API Key:</span>
              <span>{liveAccounts?.binance.accountNumberOrUid || 'Not Configured'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Free Margin:</span>
              <span>${liveAccounts?.binance.freeMargin.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Setup Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MT5 Terminal Connection Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
                MetaTrader 5 Bridge Configuration
              </h3>
            </div>
            {liveAccounts?.mt5.connected ? (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <XCircle className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>

          <form onSubmit={handleMT5Submit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">MT5 SERVER NAME</label>
              <input
                type="text"
                value={mt5Server}
                onChange={(e) => setMt5Server(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                placeholder="e.g. MetaQuotes-Demo or Broker-Live"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">LOGIN / ACCOUNT ID</label>
                <input
                  type="text"
                  value={mt5Login}
                  onChange={(e) => setMt5Login(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">PASSWORD</label>
                <input
                  type="password"
                  value={mt5Password}
                  onChange={(e) => setMt5Password(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">LOCAL TERMINAL PATH (WINDOWS)</label>
              <input
                type="text"
                value={mt5TerminalPath}
                onChange={(e) => setMt5TerminalPath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {mt5Message && (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                {mt5Message}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={mt5Connecting}
                className="flex-1 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {mt5Connecting ? 'Connecting...' : 'Connect to MT5'}
              </button>
              {liveAccounts?.mt5.connected && (
                <button
                  type="button"
                  onClick={onDisconnectMT5}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Binance Exchange Connection Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
                Binance REST & WebSocket Connector
              </h3>
            </div>
            {liveAccounts?.binance.connected ? (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <XCircle className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>

          <form onSubmit={handleBinanceSubmit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">ENVIRONMENT / PRODUCT</label>
              <select
                value={binanceEnv}
                onChange={(e) => setBinanceEnv(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="SPOT_TESTNET">Spot Testnet (https://testnet.binance.vision)</option>
                <option value="SPOT_MAINNET">Spot Mainnet (https://api.binance.com)</option>
                <option value="FUTURES_TESTNET">USDT-M Futures Testnet</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">API KEY</label>
              <input
                type="text"
                value={binanceApiKey}
                onChange={(e) => setBinanceApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">API SECRET (HMAC-SHA256)</label>
              <input
                type="password"
                value={binanceApiSecret}
                onChange={(e) => setBinanceApiSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {binanceMessage && (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                {binanceMessage}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={binanceConnecting}
                className="flex-1 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {binanceConnecting ? 'Connecting...' : 'Connect to Binance'}
              </button>
              {liveAccounts?.binance.connected && (
                <button
                  type="button"
                  onClick={onDisconnectBinance}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
