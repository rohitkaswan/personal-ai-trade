/**
 * Trading & Execution Center
 * Interactive Order Book, Candlestick Chart, Order Entry Ticket, and Active Positions Book.
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Candle, Order, Position, TestAccount } from '../types/quant';

interface TradingCenterProps {
  candles: Candle[];
  orders: Order[];
  positions: Position[];
  testAccount: TestAccount | null;
  currentPrice: number;
  onExecuteOrder: (params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    targetVenue: 'SIMULATION' | 'MT5' | 'BINANCE';
    type: 'MARKET' | 'LIMIT';
  }) => Promise<any>;
}

export const TradingCenter: React.FC<TradingCenterProps> = ({
  candles,
  orders,
  positions,
  testAccount,
  currentPrice,
  onExecuteOrder,
}) => {
  const [selectedSide, setSelectedSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [targetVenue, setTargetVenue] = useState<'SIMULATION' | 'MT5' | 'BINANCE'>('SIMULATION');
  const [quantity, setQuantity] = useState<number>(0.0003); // ~$20 notional on $100 account
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notional = quantity * currentPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await onExecuteOrder({
        symbol: 'BTCUSDT',
        side: selectedSide,
        quantity,
        targetVenue,
        type: orderType,
      });

      if (res.result?.riskCheck?.verdict === 'APPROVE') {
        setFeedback({
          type: 'success',
          message: `Order approved by Risk Firewall and filled at $${res.result.order.averageFillPrice.toFixed(2)}.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: `Order VETOED by Risk Firewall: ${res.result?.riskCheck?.reasons?.join('; ') || 'Limit breached'}`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Execution failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="trading-center-container" className="space-y-6 p-4">
      {/* Top Grid: Market Depth & Candlestick Visualization + Order Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candlestick & Indicator Chart Simulator */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  BTCUSDT (1M PERPETUAL)
                </span>
                <span className="text-xs font-mono text-slate-500">|</span>
                <span className="text-sm font-mono font-bold text-slate-100">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">EMA 9/21</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">RSI 14</span>
              </div>
            </div>

            {/* Visual Candlestick Stage */}
            <div className="h-64 bg-slate-950 rounded border border-slate-800/80 p-3 flex items-end justify-between gap-1 overflow-hidden relative">
              {/* Background Price Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20">
                <div className="border-b border-slate-700 w-full" />
                <div className="border-b border-slate-700 w-full" />
                <div className="border-b border-slate-700 w-full" />
              </div>

              {/* Candles */}
              {candles.slice(-36).map((c, idx) => {
                const isGreen = c.close >= c.open;
                const minPrice = Math.min(...candles.slice(-36).map((k) => k.low));
                const maxPrice = Math.max(...candles.slice(-36).map((k) => k.high));
                const range = maxPrice - minPrice || 1;

                const bottomPct = ((c.low - minPrice) / range) * 100;
                const heightPct = Math.max(4, ((c.high - c.low) / range) * 100);
                const bodyBottomPct = ((Math.min(c.open, c.close) - minPrice) / range) * 100;
                const bodyHeightPct = Math.max(3, (Math.abs(c.close - c.open) / range) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full relative group">
                    {/* Wick */}
                    <div
                      className={`absolute w-0.5 ${isGreen ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{
                        bottom: `${bottomPct}%`,
                        height: `${heightPct}%`,
                      }}
                    />
                    {/* Body */}
                    <div
                      className={`absolute w-full max-w-[8px] rounded-xs ${
                        isGreen ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{
                        bottom: `${bodyBottomPct}%`,
                        height: `${bodyHeightPct}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Microstructure Status Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
            <div>
              Spread: <span className="text-slate-200">2.5 bps ($1.63)</span>
            </div>
            <div>
              Order Book Imbalance: <span className="text-emerald-400">+12.4% Bid Heavy</span>
            </div>
            <div>
              Execution Venue: <span className="text-indigo-400">{targetVenue}</span>
            </div>
          </div>
        </div>

        {/* Order Entry Ticket */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
              Institutional Order Ticket
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Risk Controlled
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {/* Side Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedSide('BUY')}
                className={`py-2 rounded font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                  selectedSide === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setSelectedSide('SELL')}
                className={`py-2 rounded font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                  selectedSide === 'SELL'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" /> SELL / SHORT
              </button>
            </div>

            {/* Target Venue */}
            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">TARGET VENUE</label>
              <select
                value={targetVenue}
                onChange={(e) => setTargetVenue(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="SIMULATION">SIMULATION ($100 Micro Baseline)</option>
                <option value="MT5">METATRADER 5 (Live IPC)</option>
                <option value="BINANCE">BINANCE (REST / WebSocket)</option>
              </select>
            </div>

            {/* Order Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">ORDER TYPE</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="MARKET">MARKET</option>
                  <option value="LIMIT">LIMIT</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">QUANTITY (BTC)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Micro-Account Constraints Indicator */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Notional Order Value:</span>
                <span className="text-slate-200 font-bold">${notional.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Equity:</span>
                <span className="text-emerald-400 font-bold">
                  ${testAccount?.currentEquity.toFixed(2) || '100.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Firewall Max Position:</span>
                <span className="text-slate-400">$25.00 USD</span>
              </div>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-2.5 rounded text-xs border flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded font-bold text-xs text-white transition-all disabled:opacity-50 ${
                selectedSide === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {isSubmitting
                ? 'Routing through Risk Firewall...'
                : `SUBMIT ${selectedSide} ORDER ($${notional.toFixed(2)})`}
            </button>
          </form>
        </div>
      </div>

      {/* Active Positions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
            Active Positions Book ({positions.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Total Exposure: $
            {positions.reduce((acc, p) => acc + p.notionalValue, 0).toFixed(2)}
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-mono text-xs">
            No open positions in active account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-1">
                  <th className="py-1">POSITION ID</th>
                  <th>SYMBOL</th>
                  <th>SIDE</th>
                  <th>QTY</th>
                  <th>ENTRY PRICE</th>
                  <th>MARK PRICE</th>
                  <th>NOTIONAL</th>
                  <th>UNREALIZED P&L</th>
                  <th>BROKER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((pos) => (
                  <tr key={pos.id} className="text-slate-300">
                    <td className="py-2 text-slate-400">{pos.id}</td>
                    <td>{pos.symbol}</td>
                    <td className={pos.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                      {pos.side}
                    </td>
                    <td>{pos.quantity}</td>
                    <td>${pos.entryPrice.toFixed(2)}</td>
                    <td>${pos.currentPrice.toFixed(2)}</td>
                    <td>${pos.notionalValue.toFixed(2)}</td>
                    <td className={pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                    </td>
                    <td>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                        {pos.broker}
                      </span>
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
