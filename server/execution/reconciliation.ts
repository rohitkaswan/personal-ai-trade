/**
 * Position & Account Reconciliation Engine
 * Periodically verifies internal state against external broker telemetry.
 * Automatically halts new order generation if critical discrepancy is detected.
 */

import { LiveBrokerAccount, Order, Position, TestAccount } from '../../src/types/quant';

export interface ReconciliationReport {
  timestamp: number;
  status: 'MATCHED' | 'MISMATCH_DETECTED';
  brokerId: string;
  balanceDelta: number;
  positionCountDelta: number;
  discrepancies: string[];
  blockTradingTriggered: boolean;
}

export class ReconciliationEngine {
  private lastReport: ReconciliationReport | null = null;
  private mismatchCount: number = 0;

  public reconcileState(
    localAccount: TestAccount | LiveBrokerAccount,
    localPositions: Position[],
    brokerAccount?: LiveBrokerAccount,
    brokerPositions?: Position[]
  ): ReconciliationReport {
    const discrepancies: string[] = [];
    let balanceDelta = 0;
    let positionCountDelta = 0;

    if (brokerAccount && brokerAccount.connected) {
      // Compare live broker equity vs local record
      balanceDelta = Math.abs(brokerAccount.equity - ('currentEquity' in localAccount ? localAccount.currentEquity : localAccount.equity));
      if (balanceDelta > 0.05) {
        discrepancies.push(
          `Equity mismatch: Local $${('currentEquity' in localAccount ? localAccount.currentEquity : localAccount.equity).toFixed(2)} vs Broker $${brokerAccount.equity.toFixed(2)} (Delta: $${balanceDelta.toFixed(2)})`
        );
      }

      if (brokerPositions) {
        positionCountDelta = Math.abs(brokerPositions.length - localPositions.length);
        if (positionCountDelta > 0) {
          discrepancies.push(
            `Position count mismatch: Local has ${localPositions.length} positions, broker reports ${brokerPositions.length}`
          );
        }

        // Compare individual symbols
        for (const lp of localPositions) {
          const bp = brokerPositions.find((p) => p.symbol === lp.symbol && p.side === lp.side);
          if (!bp) {
            discrepancies.push(`Position for ${lp.symbol} (${lp.side}) found locally but missing on broker!`);
          } else if (Math.abs(lp.quantity - bp.quantity) > 0.0001) {
            discrepancies.push(
              `Position size mismatch for ${lp.symbol}: Local ${lp.quantity} vs Broker ${bp.quantity}`
            );
          }
        }
      }
    }

    const hasMismatches = discrepancies.length > 0;
    if (hasMismatches) {
      this.mismatchCount++;
    } else {
      this.mismatchCount = 0;
    }

    const report: ReconciliationReport = {
      timestamp: Date.now(),
      status: hasMismatches ? 'MISMATCH_DETECTED' : 'MATCHED',
      brokerId: brokerAccount ? brokerAccount.brokerId : 'SIMULATION',
      balanceDelta: Number(balanceDelta.toFixed(4)),
      positionCountDelta,
      discrepancies,
      blockTradingTriggered: this.mismatchCount >= 2,
    };

    this.lastReport = report;
    return report;
  }

  public getLastReport(): ReconciliationReport {
    return (
      this.lastReport || {
        timestamp: Date.now(),
        status: 'MATCHED',
        brokerId: 'SIMULATION',
        balanceDelta: 0,
        positionCountDelta: 0,
        discrepancies: [],
        blockTradingTriggered: false,
      }
    );
  }
}
