/**
 * Autonomous AI Quantitative Trading Platform
 * Core Domain Types and Institutional Data Contracts
 */

export type TradingMode =
  | 'RESEARCH_ONLY'
  | 'BACKTEST'
  | 'SIMULATION'
  | 'PAPER'
  | 'SHADOW'
  | 'CANARY'
  | 'LIVE';

export type PlatformProfile =
  | 'LOCAL_DEV'
  | 'LOCAL_RESEARCH'
  | 'SIMULATION'
  | 'PAPER'
  | 'SHADOW'
  | 'CANARY'
  | 'LIVE'
  | 'PRODUCTION';

// Market Data Contracts
export interface Candle {
  timestamp: number; // Unix epoch ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spread?: number;
  trades?: number;
}

export interface Tick {
  timestamp: number;
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  orderCount?: number;
}

export interface OrderBook {
  timestamp: number;
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export type MarketRegimeType =
  | 'TREND_UP'
  | 'TREND_DOWN'
  | 'RANGE'
  | 'HIGH_VOLATILITY'
  | 'LOW_VOLATILITY'
  | 'CRISIS'
  | 'RECOVERY'
  | 'LIQUIDITY_STRESS'
  | 'MOMENTUM'
  | 'MEAN_REVERSION'
  | 'TRANSITION'
  | 'UNKNOWN';

export interface MarketRegime {
  current: MarketRegimeType;
  probability: number;
  confidence: number;
  transitionProbability: Record<string, number>;
  regimeHistory: Array<{ timestamp: number; regime: MarketRegimeType; confidence: number }>;
  detectedAt: number;
}

export interface MarketStateVector {
  symbol: string;
  timestamp: number;
  price: number;
  trend: number; // -1 to 1
  volatility: number; // annualised/stdev
  liquidityScore: number; // 0 to 1
  volumeRatio: number; // vs 20d MA
  spreadBps: number;
  orderBookImbalance: number; // -1 (ask heavy) to +1 (bid heavy)
  microprice: number;
  regime: MarketRegimeType;
  rsi: number;
  macdHist: number;
  atr: number;
  hurstExponent: number;
  dataQualityScore: number; // 0 to 100
}

// Account & Balance Contracts
export interface TestAccount {
  accountId: string;
  profileName: 'MICRO_ACCOUNT';
  startingBalance: number; // Canonical $100.00
  currentBalance: number;
  currentEquity: number;
  availableBalance: number;
  marginUsed: number;
  freeMargin: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalFeesPaid: number;
  totalSlippagePaid: number;
  peakEquity: number;
  maxDrawdownPct: number;
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
  mode: 'SIMULATION' | 'PAPER';
  lastResetTimestamp: number;
}

export interface LiveBrokerAccount {
  brokerId: 'MT5' | 'BINANCE_SPOT' | 'BINANCE_FUTURES';
  connected: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'AUTHENTICATING' | 'ERROR';
  serverOrEndpoint: string;
  accountNumberOrUid: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevelPct: number;
  openPositionsCount: number;
  lastHeartbeat: number;
  errorMessage?: string;
}

// Risk Contracts
export type RiskVerdict =
  | 'APPROVE'
  | 'REJECT'
  | 'REDUCE'
  | 'PAUSE'
  | 'EMERGENCY_STOP';

export interface RiskLimits {
  maxRiskPerTradePct: number; // default 1.5% for micro account
  maxPositionSizeUsd: number; // default $25 on $100
  maxPortfolioExposurePct: number; // default 50%
  maxLeverage: number; // 1x or 2x for micro
  dailyLossLimitUsd: number; // default $5 on $100
  maxDrawdownLimitPct: number; // default 10%
  maxOpenPositions: number; // default 2
  minOrderNotionalUsd: number; // e.g. $10 Binance min
  maxSpreadAllowedBps: number;
  minDataQualityScore: number;
}

export interface RiskFirewallCheck {
  orderId: string;
  timestamp: number;
  verdict: RiskVerdict;
  passedRules: string[];
  failedRules: string[];
  reasons: string[];
  adjustedQuantity?: number;
  simulatedEquity: number;
  killSwitchActive: boolean;
}

// Order State Machine Contracts
export type OrderState =
  | 'CREATED'
  | 'VALIDATING'
  | 'RISK_CHECK'
  | 'APPROVED'
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCEL_PENDING'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'ERROR';

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'OCO' | 'TWAP' | 'VWAP';

export interface Order {
  id: string;
  clientOrderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  status: OrderState;
  stateHistory: Array<{ state: OrderState; timestamp: number; details?: string }>;
  strategyId: string;
  agentId: string;
  targetVenue: 'SIMULATION' | 'MT5' | 'BINANCE';
  filledQuantity: number;
  averageFillPrice: number;
  feePaid: number;
  slippagePaid: number;
  rejectionReason?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  notionalValue: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  openedAt: number;
  strategyId: string;
  broker: 'SIMULATION' | 'MT5' | 'BINANCE';
}

// Agent Organization Contracts
export type AgentCategory =
  | 'EXECUTIVE'
  | 'MARKET_INTELLIGENCE'
  | 'STRATEGY_LAB'
  | 'AI_LAB'
  | 'RL_LAB'
  | 'OPERATIONS';

export type AgentDivision =
  | 'EXECUTIVE_RISK'
  | 'MARKET_INTELLIGENCE'
  | 'STRATEGY_LAB'
  | 'AI_LAB'
  | 'RL_LAB'
  | 'OPERATIONS';

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  category?: AgentCategory;
  division?: AgentDivision;
  modelEngine?: string;
  reputationScore: number; // 0 to 100
  calibrationScore?: number; // 0 to 1
  winRatePct?: number;
  winRateContribution?: number;
  pnlContributionUsd?: number;
  status: 'ACTIVE' | 'DOWN_WEIGHTED' | 'SUSPENDED' | 'STANDBY';
  targetRegime?: string;
  totalVotesCast?: number;
  currentRegimeEffectiveness?: Record<string, number>;
  lastDeliberation?: string;
}

export type RiskFirewallAuditEntry = RiskFirewallCheck;

export interface ReconciliationReport {
  timestamp: number;
  status: 'MATCHED' | 'MISMATCH_DETECTED';
  brokerId: string;
  balanceDelta: number;
  positionCountDelta: number;
  discrepancies: string[];
  blockTradingTriggered: boolean;
}

export type DecisionFusionAction =
  | 'BUY'
  | 'SELL'
  | 'HOLD'
  | 'WAIT'
  | 'REDUCE'
  | 'EXIT'
  | 'NO-TRADE';

export interface DecisionFusionOutcome {
  decisionId: string;
  timestamp: number;
  symbol: string;
  action: DecisionFusionAction;
  confidence: number; // 0 to 1
  uncertainty: number; // 0 to 1
  expectedReturnBps: number;
  expectedVolatility: number;
  holdingPeriodMinutes: number;
  participatingAgents: number;
  structuredEvidence: {
    regimeAlignment: string;
    macroContext: string;
    microstructureHealth: string;
    riskMarginAdequate: boolean;
    costFeasibility: string;
  };
  riskFactors: string[];
  executionConditions: string[];
  vetoTriggered?: string;
}

// Strategy & Alpha Contracts
export interface StrategyGenome {
  id: string;
  name: string;
  version: string;
  generation: number;
  parentIds: string[];
  timeframe: string;
  indicators: string[];
  entryCondition: string;
  exitCondition: string;
  stopLossAtrMult: number;
  takeProfitAtrMult: number;
  maxHoldingPeriods: number;
  targetRegimes: MarketRegimeType[];
  backtestSharpe: number;
  backtestWinRate: number;
  backtestMaxDrawdownPct: number;
  status: 'RESEARCH' | 'VALIDATED' | 'PAPER' | 'SHADOW' | 'CANARY' | 'PRODUCTION' | 'RETIRED';
}

// Machine Learning & Model Governance Contracts
export type ModelRole = 'CHAMPION' | 'CHALLENGER' | 'SHADOW' | 'RETIRED';

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  architecture: 'LightGBM' | 'CatBoost' | 'Transformer' | 'LSTM' | 'Ensemble_MoE';
  role: ModelRole;
  targetRegime: MarketRegimeType | 'ALL';
  features: string[];
  trainingTimestamp: number;
  outOfSampleSharpe: number;
  outOfSampleAccuracy: number;
  brierUncertaintyScore: number;
  driftStatus: 'HEALTHY' | 'MODERATE_DRIFT' | 'SEVERE_DRIFT';
  psiScore: number; // Population Stability Index
  isPromoted: boolean;
  rollbackVersion?: string;
}

// Autonomous Learning & Experience Replay
export interface TradeLearningRecord {
  tradeId: string;
  symbol: string;
  strategyId: string;
  entryTimestamp: number;
  exitTimestamp: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  realizedPnL: number;
  returnPct: number;
  feesPaid: number;
  slippagePaid: number;
  maxAdverseExcursionBps: number; // MAE
  maxFavorableExcursionBps: number; // MFE
  regimeAtEntry: MarketRegimeType;
  modelConfidenceAtEntry: number;
  fusionAction: DecisionFusionAction;
  postTradeAnalysis: string;
  lessonsLearned: string[];
}

export interface ResearchHypothesis {
  id: string;
  title: string;
  hypothesisText: string;
  rationale: string;
  targetMetric: string;
  status: 'PROPOSED' | 'RUNNING' | 'VALIDATED' | 'REJECTED';
  experimentId?: string;
  createdAt: number;
  conclusions?: string;
}

// System Health & Telemetry
export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'EMERGENCY_HALT';
  mode: TradingMode;
  profile: PlatformProfile;
  uptimeSeconds: number;
  cpuUsagePct: number;
  memoryUsageMb: number;
  activeAgentsCount: number;
  dataFeedQuality: number;
  reconciliationStatus: 'MATCHED' | 'MISMATCH_DETECTED' | 'RECONCILING';
  killSwitchEngaged: boolean;
  lastReconciliationTime: number;
}
