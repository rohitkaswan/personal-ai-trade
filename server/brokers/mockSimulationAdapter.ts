/**
 * Micro-Account Simulation Broker Adapter
 * Manages the canonical $100.00 virtual testing balance.
 * Strictly enforces realistic fee & slippage deductions without fabricating fractional fills.
 */

import { Candle, Order, Position, TestAccount, Tick } from '../../src/types/quant';
import { DigitalMarketTwin } from '../quant/digitalTwin';

export class MockSimulationAdapter {
  private initialCapital: number = 100.0;
  private account: TestAccount;
  private openPositions: Position[] = [];
  private completedTrades: any[] = [];
  private twin: DigitalMarketTwin;

  constructor(startingCapital: number = 500.0) {
    this.initialCapital = startingCapital;
    this.twin = new DigitalMarketTwin();
    this.account = this.createFreshAccount(this.initialCapital);
  }

  private createFreshAccount(balance: number): TestAccount {
    return {
      accountId: `SIM-ACCOUNT-${Math.round(balance)}`,
      profileName: 'MICRO_ACCOUNT',
      startingBalance: balance,
      currentBalance: balance,
      currentEquity: balance,
      availableBalance: balance,
      marginUsed: 0,
      freeMargin: balance,
      realizedPnL: 0,
      unrealizedPnL: 0,
      totalFeesPaid: 0,
      totalSlippagePaid: 0,
      peakEquity: balance,
      maxDrawdownPct: 0,
      tradeCount: 0,
      winningTrades: 0,
      losingTrades: 0,
      mode: 'SIMULATION',
      lastResetTimestamp: Date.now(),
    };
  }

  public getAccount(): TestAccount {
    this.updateUnrealizedPnL();
    return { ...this.account };
  }

  public getOpenPositions(): Position[] {
    return [...this.openPositions];
  }

  public resetTo100(): TestAccount {
    this.account = this.createFreshAccount(100.0);
    this.openPositions = [];
    return this.getAccount();
  }

  public setStartingCapital(amount: number): TestAccount {
    this.initialCapital = amount;
    this.account = this.createFreshAccount(amount);
    this.openPositions = [];
    return this.getAccount();
  }

  public executeOrder(
    order: Order,
    currentPrice: number
  ): {
    success: boolean;
    error?: string;
    order: Order;
    fillPrice?: number;
    filledQuantity?: number;
    feePaid?: number;
    slippagePaid?: number;
  } {
    const simResult = this.twin.simulateOrderFill(order, currentPrice);
    if (!simResult.filled) {
      order.status = 'REJECTED';
      order.rejectionReason = simResult.rejectionReason;
      return { success: false, error: simResult.rejectionReason, order };
    }

    const notional = simResult.filledQuantity * simResult.fillPrice;

    if (order.side === 'BUY') {
      if (notional + simResult.feePaid > this.account.availableBalance) {
        order.status = 'REJECTED';
        order.rejectionReason = `Insufficient balance: Need $${(notional + simResult.feePaid).toFixed(2)}, available $${this.account.availableBalance.toFixed(2)}`;
        return { success: false, error: order.rejectionReason, order };
      }

      this.account.availableBalance -= notional + simResult.feePaid;
      this.account.marginUsed += notional;
      this.account.totalFeesPaid += simResult.feePaid;
      this.account.totalSlippagePaid += simResult.slippagePaid;

      const position: Position = {
        id: `POS-${Date.now()}`,
        symbol: order.symbol,
        side: 'BUY',
        quantity: simResult.filledQuantity,
        entryPrice: simResult.fillPrice,
        currentPrice: simResult.fillPrice,
        unrealizedPnL: 0,
        realizedPnL: 0,
        notionalValue: notional,
        openedAt: Date.now(),
        strategyId: order.strategyId,
        broker: 'SIMULATION',
      };
      this.openPositions.push(position);
    } else if (order.side === 'SELL') {
      // Find open long position to close
      const posIdx = this.openPositions.findIndex((p) => p.symbol === order.symbol && p.side === 'BUY');
      if (posIdx !== -1) {
        const pos = this.openPositions[posIdx];
        const grossPnl = (simResult.fillPrice - pos.entryPrice) * pos.quantity;
        const netPnl = grossPnl - simResult.feePaid - simResult.slippagePaid;

        this.account.realizedPnL += netPnl;
        this.account.currentBalance += netPnl;
        this.account.availableBalance += pos.notionalValue + netPnl - simResult.feePaid;
        this.account.marginUsed = Math.max(0, this.account.marginUsed - pos.notionalValue);
        this.account.totalFeesPaid += simResult.feePaid;
        this.account.totalSlippagePaid += simResult.slippagePaid;
        this.account.tradeCount++;

        if (netPnl > 0) this.account.winningTrades++;
        else this.account.losingTrades++;

        this.openPositions.splice(posIdx, 1);
      }
    }

    this.updateUnrealizedPnL();
    return {
      success: true,
      fillPrice: simResult.fillPrice,
      filledQuantity: simResult.filledQuantity,
      feePaid: simResult.feePaid,
      slippagePaid: simResult.slippagePaid,
      order,
    };
  }

  public updateUnrealizedPnL(prices?: Record<string, number>): void {
    let totalUnrealized = 0;
    for (const pos of this.openPositions) {
      const price = prices && prices[pos.symbol] ? prices[pos.symbol] : pos.currentPrice;
      pos.currentPrice = price;
      pos.unrealizedPnL = (price - pos.entryPrice) * pos.quantity;
      pos.notionalValue = price * pos.quantity;
      totalUnrealized += pos.unrealizedPnL;
    }

    this.account.unrealizedPnL = totalUnrealized;
    this.account.currentEquity = this.account.currentBalance + totalUnrealized;
    this.account.freeMargin = Math.max(0, this.account.currentEquity - this.account.marginUsed);

    if (this.account.currentEquity > this.account.peakEquity) {
      this.account.peakEquity = this.account.currentEquity;
    }

    const dd = ((this.account.peakEquity - this.account.currentEquity) / this.account.peakEquity) * 100;
    this.account.maxDrawdownPct = Math.max(this.account.maxDrawdownPct, Number(dd.toFixed(2)));
  }
}
