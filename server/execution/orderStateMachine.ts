/**
 * Order State Machine & Lifecycle Coordinator
 * Formally transitions orders through strict operational states.
 */

import { Order, OrderSide, OrderState, OrderType } from '../../src/types/quant';

export class OrderStateMachine {
  private orders: Map<string, Order> = new Map();

  public createOrder(params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity: number;
    limitPrice?: number;
    stopPrice?: number;
    strategyId: string;
    agentId: string;
    targetVenue: 'SIMULATION' | 'MT5' | 'BINANCE';
  }): Order {
    const id = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = Date.now();
    const order: Order = {
      id,
      clientOrderId: `CL-${id}`,
      symbol: params.symbol,
      side: params.side,
      type: params.type,
      quantity: params.quantity,
      limitPrice: params.limitPrice,
      stopPrice: params.stopPrice,
      status: 'CREATED',
      stateHistory: [{ state: 'CREATED', timestamp: now, details: 'Order created' }],
      strategyId: params.strategyId,
      agentId: params.agentId,
      targetVenue: params.targetVenue,
      filledQuantity: 0,
      averageFillPrice: 0,
      feePaid: 0,
      slippagePaid: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(id, order);
    return order;
  }

  public getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  public getAllOrders(): Order[] {
    return Array.from(this.orders.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public transition(orderId: string, nextState: OrderState, details?: string): Order {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found in state machine.`);
    }

    const validTransitions: Record<OrderState, OrderState[]> = {
      CREATED: ['VALIDATING', 'CANCELLED', 'ERROR'],
      VALIDATING: ['RISK_CHECK', 'REJECTED', 'ERROR'],
      RISK_CHECK: ['APPROVED', 'REJECTED', 'ERROR'],
      APPROVED: ['SUBMITTED', 'CANCELLED', 'ERROR'],
      SUBMITTED: ['ACKNOWLEDGED', 'REJECTED', 'ERROR', 'FILLED'],
      ACKNOWLEDGED: ['PARTIALLY_FILLED', 'FILLED', 'CANCEL_PENDING', 'CANCELLED', 'REJECTED', 'EXPIRED'],
      PARTIALLY_FILLED: ['PARTIALLY_FILLED', 'FILLED', 'CANCEL_PENDING', 'CANCELLED', 'ERROR'],
      FILLED: [], // terminal
      CANCEL_PENDING: ['CANCELLED', 'ERROR', 'FILLED'],
      CANCELLED: [], // terminal
      REJECTED: [], // terminal
      EXPIRED: [], // terminal
      ERROR: [], // terminal
    };

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(nextState)) {
      throw new Error(
        `Illegal state transition for order ${orderId}: ${order.status} -> ${nextState}. Allowed: [${allowed?.join(', ')}]`
      );
    }

    order.status = nextState;
    order.updatedAt = Date.now();
    order.stateHistory.push({
      state: nextState,
      timestamp: order.updatedAt,
      details,
    });

    if (nextState === 'REJECTED' && details) {
      order.rejectionReason = details;
    }

    return order;
  }

  public markFilled(
    orderId: string,
    fillPrice: number,
    filledQty: number,
    fees: number,
    slippage: number
  ): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order ${orderId} not found.`);

    order.averageFillPrice = fillPrice;
    order.filledQuantity = filledQty;
    order.feePaid = fees;
    order.slippagePaid = slippage;
    return this.transition(orderId, 'FILLED', `Filled ${filledQty} units @ $${fillPrice.toFixed(4)}`);
  }
}
