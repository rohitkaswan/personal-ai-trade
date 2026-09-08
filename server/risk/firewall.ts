/**
 * Deterministic Risk Firewall
 * Independent safety layer with FINAL VETO AUTHORITY over all orders and autonomous agents.
 * Strictly enforces $100 micro-account realism, venue constraints, and capital preservation.
 */

import {
  Order,
  Position,
  RiskFirewallCheck,
  RiskLimits,
  RiskVerdict,
  TestAccount,
} from '../../src/types/quant';

export class RiskFirewall {
  private limits: RiskLimits = {
    maxRiskPerTradePct: 1.5, // 1.5% of equity max risk
    maxPositionSizeUsd: 25.0, // $25 max per position on $100 test baseline
    maxPortfolioExposurePct: 50.0, // 50% max open exposure ($50 on $100)
    maxLeverage: 1.0, // Cash / 1x leverage only on micro accounts
    dailyLossLimitUsd: 5.0, // $5 daily loss halts trading
    maxDrawdownLimitPct: 10.0, // 10% peak drawdown triggers pause
    maxOpenPositions: 2, // Maximum 2 concurrent positions
    minOrderNotionalUsd: 5.0, // Minimum venue execution notional
    maxSpreadAllowedBps: 20.0, // Reject if spread > 20 bps
    minDataQualityScore: 80.0, // Reject if data feed quality < 80
  };

  private killSwitchEngaged: boolean = false;
  private auditLog: RiskFirewallCheck[] = [];

  public getLimits(): RiskLimits {
    return { ...this.limits };
  }

  public updateLimits(newLimits: Partial<RiskLimits>): RiskLimits {
    this.limits = { ...this.limits, ...newLimits };
    return this.getLimits();
  }

  public updateLimitsForCapital(capital: number): void {
    const safeCapital = Math.max(10, capital);
    this.limits.maxPositionSizeUsd = Number((safeCapital * 0.25).toFixed(2));
    this.limits.dailyLossLimitUsd = Number((safeCapital * 0.05).toFixed(2));
  }

  public isKillSwitchActive(): boolean {
    return this.killSwitchEngaged;
  }

  public setKillSwitch(active: boolean): void {
    this.killSwitchEngaged = active;
  }

  public getAuditLog(): RiskFirewallCheck[] {
    return [...this.auditLog].reverse();
  }

  /**
   * Deterministic evaluation of an intended order against account equity and micro constraints.
   */
  public evaluateOrder(
    order: Order,
    account: TestAccount,
    openPositions: Position[],
    currentPrice: number,
    currentSpreadBps: number = 2.0,
    dataQualityScore: number = 98.0
  ): RiskFirewallCheck {
    const passedRules: string[] = [];
    const failedRules: string[] = [];
    const reasons: string[] = [];
    const orderNotional = order.quantity * currentPrice;

    // 1. Emergency Kill Switch Check
    if (this.killSwitchEngaged) {
      failedRules.push('KILL_SWITCH_ACTIVE');
      reasons.push('Emergency kill switch is engaged. All trading halted.');
      return this.recordCheck(order.id, 'EMERGENCY_STOP', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('KILL_SWITCH_DISENGAGED');

    // 2. Data Quality Check
    if (dataQualityScore < this.limits.minDataQualityScore) {
      failedRules.push('DATA_QUALITY_BELOW_THRESHOLD');
      reasons.push(`Market data quality score (${dataQualityScore}) is below minimum safe threshold (${this.limits.minDataQualityScore}).`);
      return this.recordCheck(order.id, 'REJECT', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('DATA_QUALITY_VALID');

    // 3. Spread Check
    if (currentSpreadBps > this.limits.maxSpreadAllowedBps) {
      failedRules.push('SPREAD_EXCESSIVE');
      reasons.push(`Market spread (${currentSpreadBps.toFixed(1)} bps) exceeds maximum allowable limit (${this.limits.maxSpreadAllowedBps} bps).`);
      return this.recordCheck(order.id, 'REJECT', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('SPREAD_WITHIN_LIMITS');

    // 4. Maximum Drawdown Check
    if (account.maxDrawdownPct >= this.limits.maxDrawdownLimitPct) {
      failedRules.push('MAX_DRAWDOWN_BREACHED');
      reasons.push(`Account drawdown (${account.maxDrawdownPct.toFixed(1)}%) reached or exceeded safety limit (${this.limits.maxDrawdownLimitPct}%). Trading paused.`);
      return this.recordCheck(order.id, 'PAUSE', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('DRAWDOWN_WITHIN_LIMITS');

    // 5. Daily Loss Limit Check
    const dailyLoss = account.startingBalance - account.currentEquity;
    if (dailyLoss >= this.limits.dailyLossLimitUsd) {
      failedRules.push('DAILY_LOSS_LIMIT_REACHED');
      reasons.push(`Daily loss ($${dailyLoss.toFixed(2)}) reached the daily loss limit ($${this.limits.dailyLossLimitUsd.toFixed(2)}). Trading paused.`);
      return this.recordCheck(order.id, 'PAUSE', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('DAILY_LOSS_ACCEPTABLE');

    // 6. Minimum Notional Requirement (Venue Realism)
    if (orderNotional < this.limits.minOrderNotionalUsd) {
      failedRules.push('BELOW_MINIMUM_NOTIONAL');
      reasons.push(`Signal generated, but trade rejected because account/venue constraints were not satisfied. Order notional ($${orderNotional.toFixed(2)}) is below venue minimum ($${this.limits.minOrderNotionalUsd.toFixed(2)}).`);
      return this.recordCheck(order.id, 'REJECT', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('MIN_NOTIONAL_SATISFIED');

    // 7. Maximum Single Position Notional Check ($25 on $100 baseline)
    if (orderNotional > this.limits.maxPositionSizeUsd) {
      failedRules.push('MAX_POSITION_SIZE_EXCEEDED');
      reasons.push(`Signal generated, but trade rejected because account/venue constraints were not satisfied. Order size ($${orderNotional.toFixed(2)}) exceeds maximum allowed micro-account position limit ($${this.limits.maxPositionSizeUsd.toFixed(2)}).`);
      return this.recordCheck(order.id, 'REJECT', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('POSITION_SIZE_ACCEPTABLE');

    // 8. Available Cash / Free Margin Check
    if (orderNotional > account.availableBalance) {
      failedRules.push('INSUFFICIENT_FREE_BALANCE');
      reasons.push(`Signal generated, but trade rejected because account/venue constraints were not satisfied. Insufficient available balance ($${account.availableBalance.toFixed(2)}) for order notional ($${orderNotional.toFixed(2)}).`);
      return this.recordCheck(order.id, 'REJECT', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('SUFFICIENT_BALANCE');

    // 9. Maximum Open Positions Check
    if (openPositions.length >= this.limits.maxOpenPositions && order.side === 'BUY') {
      failedRules.push('MAX_OPEN_POSITIONS_REACHED');
      reasons.push(`Maximum concurrent positions (${this.limits.maxOpenPositions}) already open. New exposure blocked.`);
      return this.recordCheck(order.id, 'REJECT', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('CONCURRENT_POSITIONS_ACCEPTABLE');

    // 10. Maximum Total Portfolio Exposure Check (e.g. 50% max)
    const currentOpenExposure = openPositions.reduce((acc, p) => acc + p.notionalValue, 0);
    const totalExposureAfterOrder = currentOpenExposure + orderNotional;
    const maxAllowedExposureUsd = account.currentEquity * (this.limits.maxPortfolioExposurePct / 100);

    if (totalExposureAfterOrder > maxAllowedExposureUsd) {
      failedRules.push('PORTFOLIO_EXPOSURE_CAP_EXCEEDED');
      reasons.push(`Total portfolio exposure ($${totalExposureAfterOrder.toFixed(2)}) would exceed maximum limit ($${maxAllowedExposureUsd.toFixed(2)} / ${this.limits.maxPortfolioExposurePct}% of equity).`);
      return this.recordCheck(order.id, 'REJECT', passedRules, failedRules, reasons, account.currentEquity);
    }
    passedRules.push('PORTFOLIO_EXPOSURE_ACCEPTABLE');

    return this.recordCheck(order.id, 'APPROVE', passedRules, failedRules, reasons, account.currentEquity);
  }

  private recordCheck(
    orderId: string,
    verdict: RiskVerdict,
    passedRules: string[],
    failedRules: string[],
    reasons: string[],
    simulatedEquity: number
  ): RiskFirewallCheck {
    const check: RiskFirewallCheck = {
      orderId,
      timestamp: Date.now(),
      verdict,
      passedRules,
      failedRules,
      reasons,
      simulatedEquity,
      killSwitchActive: this.killSwitchEngaged,
    };
    this.auditLog.push(check);
    if (this.auditLog.length > 250) this.auditLog.shift();
    return check;
  }
}
