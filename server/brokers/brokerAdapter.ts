/**
 * Unified Broker Abstraction Layer
 * Common interface decoupling quant trading core from venue-specific protocols.
 */

import { Candle, LiveBrokerAccount, Order, Position, Tick } from '../../src/types/quant';

export interface BrokerConnectionResult {
  success: boolean;
  message: string;
  account?: LiveBrokerAccount;
}

export interface IBrokerAdapter {
  id: 'MT5' | 'BINANCE_SPOT' | 'BINANCE_FUTURES' | 'SIMULATION';
  name: string;
  connect(config: Record<string, any>): Promise<BrokerConnectionResult>;
  disconnect(): Promise<boolean>;
  healthCheck(): Promise<{ online: boolean; latencyMs: number; details: string }>;
  getAccount(): Promise<LiveBrokerAccount>;
  getPositions(): Promise<Position[]>;
  getOrders(): Promise<Order[]>;
  getMarketData(symbol: string): Promise<{ tick: Tick; candles: Candle[] }>;
  placeOrder(order: Order): Promise<{ success: boolean; venueOrderId?: string; error?: string }>;
  cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }>;
}
