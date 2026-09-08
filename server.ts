/**
 * Autonomous AI Quantitative Trading Platform
 * Main HTTP & WebSocket Server (Express + Vite)
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { MasterOrchestrator } from './server/orchestrator';

const app = express();
const PORT = 3000;
const server = http.createServer(app);

// JSON parser with size limits
app.use(express.json({ limit: '2mb' }));

// Master Orchestrator Instance
const orchestrator = new MasterOrchestrator();

// WebSocket Server for Real-Time Streaming Telemetry
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  // Send initial snapshot
  ws.send(
    JSON.stringify({
      type: 'INIT_SNAPSHOT',
      data: {
        health: orchestrator.getSystemHealth(),
        market: orchestrator.getMarketState(),
        testAccount: orchestrator.getTestAccount(),
      },
    })
  );
});

// Broadcast periodic telemetry (ticks, state updates) every 2 seconds
setInterval(() => {
  // Step autonomous trading cycle (price tick, TP/SL, and autonomous paper execution if enabled)
  orchestrator.stepAutonomousTrading();

  const market = orchestrator.getMarketState();
  const testAccount = orchestrator.getTestAccount();
  const health = orchestrator.getSystemHealth();
  const payload = JSON.stringify({
    type: 'TELEMETRY_UPDATE',
    data: {
      market,
      testAccount,
      health,
      timestamp: Date.now(),
    },
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}, 2000);

// ============================================================
// REST API ROUTES (VERSIONED /api/v1/*)
// ============================================================

// 1. System Health & Operational Mode
app.get('/api/v1/system', (req, res) => {
  res.json({
    success: true,
    health: orchestrator.getSystemHealth(),
  });
});

app.post('/api/v1/system/mode', (req, res) => {
  const { mode } = req.body;
  if (!mode) return res.status(400).json({ success: false, error: 'Mode required' });
  const result = orchestrator.setTradingMode(mode);
  res.json(result);
});

app.post('/api/v1/system/profile', (req, res) => {
  const { profile } = req.body;
  if (!profile) return res.status(400).json({ success: false, error: 'Profile required' });
  const result = orchestrator.setPlatformProfile(profile);
  res.json(result);
});

app.post('/api/v1/system/kill-switch', (req, res) => {
  const { active } = req.body;
  orchestrator.riskFirewall.setKillSwitch(Boolean(active));
  orchestrator.emitEvent('KillSwitchToggled', { active: Boolean(active) });
  res.json({
    success: true,
    killSwitchActive: orchestrator.riskFirewall.isKillSwitchActive(),
  });
});

// 2. Accounts (Virtual $100 & Live Broker Connectors)
app.get('/api/v1/accounts/test', (req, res) => {
  res.json({
    success: true,
    account: orchestrator.getTestAccount(),
    openPositions: orchestrator.simBroker.getOpenPositions(),
  });
});

app.post('/api/v1/accounts/test/reset', (req, res) => {
  const { amount = 500.0 } = req.body || {};
  const targetAmount = typeof amount === 'number' && amount > 0 ? amount : 500.0;
  const account = orchestrator.resetTestAccount(targetAmount);
  res.json({
    success: true,
    message: `Test account reset to $${targetAmount.toFixed(2)} baseline.`,
    account,
  });
});

app.post('/api/v1/accounts/test/balance', (req, res) => {
  const { balance = 500.0 } = req.body || {};
  const targetBalance = typeof balance === 'number' && balance > 0 ? balance : 500.0;
  const account = orchestrator.setTestAccountBalance(targetBalance);
  res.json({
    success: true,
    message: `Test account balance updated to $${targetBalance.toFixed(2)}.`,
    account,
  });
});

app.get('/api/v1/accounts/live', async (req, res) => {
  const accounts = await orchestrator.getLiveBrokerAccounts();
  res.json({ success: true, accounts });
});

app.post('/api/v1/accounts/mt5/connect', async (req, res) => {
  const { login, password, server, terminalPath } = req.body;
  const result = await orchestrator.mt5Broker.connect({ login, password, server, terminalPath });
  orchestrator.reconcile();
  res.json(result);
});

app.post('/api/v1/accounts/mt5/disconnect', async (req, res) => {
  const result = await orchestrator.mt5Broker.disconnect();
  orchestrator.reconcile();
  res.json({ success: result });
});

app.post('/api/v1/accounts/binance/connect', async (req, res) => {
  const { apiKey, apiSecret, environment } = req.body;
  const result = await orchestrator.binanceBroker.connect({ apiKey, apiSecret, environment });
  orchestrator.reconcile();
  res.json(result);
});

app.post('/api/v1/accounts/binance/disconnect', async (req, res) => {
  const result = await orchestrator.binanceBroker.disconnect();
  orchestrator.reconcile();
  res.json({ success: result });
});

// 3. Market Data & State Vector
app.get('/api/v1/market/state', (req, res) => {
  res.json({
    success: true,
    data: orchestrator.getMarketState(),
  });
});

app.get('/api/v1/market/candles', (req, res) => {
  res.json({
    success: true,
    candles: orchestrator.getCandles(),
  });
});

// 4. Feature Space
app.get('/api/v1/features', (req, res) => {
  const state = orchestrator.buildMarketState();
  res.json({
    success: true,
    features: {
      rsi: state.rsi,
      macdHist: state.macdHist,
      trend: state.trend,
      volatility: state.volatility,
      orderBookImbalance: state.orderBookImbalance,
      microprice: state.microprice,
      hurstExponent: state.hurstExponent,
      spreadBps: state.spreadBps,
      liquidityScore: state.liquidityScore,
    },
  });
});

// 5. Signals & Decision Fusion
app.post('/api/v1/signals/fuse', (req, res) => {
  const outcome = orchestrator.runDecisionFusion();
  res.json({ success: true, outcome });
});

// 6. Strategies & Backtests
app.get('/api/v1/strategies', (req, res) => {
  res.json({
    success: true,
    strategies: [
      {
        id: 'STRAT-CANONICAL-01',
        name: 'EMA-RSI Regime Adaptive',
        version: '1.0.0',
        generation: 1,
        timeframe: '1m',
        indicators: ['EMA_9', 'EMA_21', 'RSI_14', 'ATR_14'],
        status: 'VALIDATED',
        backtestSharpe: 1.84,
        backtestWinRate: 58.2,
        backtestMaxDrawdownPct: 5.4,
      },
      {
        id: 'STRAT-STATARB-02',
        name: 'Mean Reverting Micro-Spread',
        version: '1.2.0',
        generation: 2,
        timeframe: '1m',
        indicators: ['BOLLINGER_20', 'ZSCORE', 'MICROPRICE'],
        status: 'PAPER',
        backtestSharpe: 2.12,
        backtestWinRate: 63.4,
        backtestMaxDrawdownPct: 4.8,
      },
    ],
  });
});

app.post('/api/v1/strategies/backtest', (req, res) => {
  const { startingCapital = 100.0, strategyId = 'STRAT-CANONICAL-01' } = req.body;
  const strategy = {
    id: strategyId,
    name: 'EMA-RSI Regime Adaptive',
    version: '1.0.0',
    generation: 1,
    parentIds: [],
    timeframe: '1m',
    indicators: ['EMA_9', 'EMA_21', 'RSI_14', 'ATR_14'],
    entryCondition: 'EMA_9 > EMA_21 and RSI between 40 and 65',
    exitCondition: 'EMA_9 < EMA_21 or RSI > 70',
    stopLossAtrMult: 1.5,
    takeProfitAtrMult: 2.5,
    maxHoldingPeriods: 60,
    targetRegimes: ['TREND_UP', 'MOMENTUM'] as any,
    backtestSharpe: 1.84,
    backtestWinRate: 58.2,
    backtestMaxDrawdownPct: 5.4,
    status: 'VALIDATED' as any,
  };

  const experiment = orchestrator.experimentEngine.runExperiment({
    name: `Backtest-${strategyId}-${Date.now()}`,
    hypothesis: 'Validating chronological alpha without look-ahead bias.',
    strategy,
    startingCapital,
  });

  res.json({ success: true, experiment });
});

// 7. Models & Model Governance
app.get('/api/v1/models', (req, res) => {
  res.json({
    success: true,
    models: orchestrator.modelGovernance.getModels(),
    champion: orchestrator.modelGovernance.getChampion(),
  });
});

app.post('/api/v1/models/promote', (req, res) => {
  const { challengerId } = req.body;
  const result = orchestrator.modelGovernance.promoteChallenger(challengerId);
  res.json(result);
});

app.post('/api/v1/models/rollback', (req, res) => {
  const result = orchestrator.modelGovernance.rollbackChampion();
  res.json(result);
});

// 8. Experiments & $100 Benchmark
app.get('/api/v1/experiments', (req, res) => {
  res.json({
    success: true,
    experiments: orchestrator.experimentEngine.getAllExperiments(),
  });
});

// 9. Multi-Agent Ecosystem (62 Agents)
app.get('/api/v1/agents', (req, res) => {
  res.json({
    success: true,
    count: orchestrator.agents.length,
    agents: orchestrator.agents,
  });
});

// 10. Portfolio Brain & Allocation
app.get('/api/v1/portfolio', (req, res) => {
  const testAccount = orchestrator.getTestAccount();
  const openPositions = orchestrator.simBroker.getOpenPositions();
  const cvar = orchestrator.portfolioBrain.calculateCVaR([-0.012, 0.008, -0.024, 0.015, -0.005]);
  const riskParity = orchestrator.portfolioBrain.computeRiskParityWeights([0.018, 0.024, 0.012]);

  res.json({
    success: true,
    cvar,
    riskParityWeights: riskParity,
    accountEquity: testAccount.currentEquity,
    openPositionsCount: openPositions.length,
    totalExposureUsd: openPositions.reduce((a, b) => a + b.notionalValue, 0),
  });
});

app.post('/api/v1/portfolio/size', (req, res) => {
  const { entryPrice, stopLossPrice, confidence = 0.8 } = req.body;
  const account = orchestrator.getTestAccount();
  const limits = orchestrator.riskFirewall.getLimits();

  const sizing = orchestrator.portfolioBrain.calculatePositionSize({
    accountEquity: account.currentEquity,
    entryPrice: entryPrice || 65420.0,
    stopLossPrice,
    volatility: 0.015,
    confidence,
    limits,
  });

  res.json({ success: true, sizing });
});

// 11. Deterministic Risk Firewall & Audit Logs
app.get('/api/v1/risk', (req, res) => {
  res.json({
    success: true,
    limits: orchestrator.riskFirewall.getLimits(),
    killSwitchActive: orchestrator.riskFirewall.isKillSwitchActive(),
    auditLog: orchestrator.riskFirewall.getAuditLog(),
  });
});

app.post('/api/v1/risk/limits', (req, res) => {
  const updated = orchestrator.riskFirewall.updateLimits(req.body);
  res.json({ success: true, limits: updated });
});

// Trigger Adversarial Veto Test to prove order rejection by risk controls
app.post('/api/v1/risk/test-veto', (req, res) => {
  // Submit an intentionally excessive order ($80 on $100 account)
  const result = orchestrator.executeOrderPipeline({
    side: 'BUY',
    quantity: 0.0015, // ~$98 notional on $100 account!
    targetVenue: 'SIMULATION',
  });
  res.json({
    success: true,
    message: 'Adversarial oversized order submitted to verify Risk Firewall veto authority.',
    result,
  });
});

// 12. Execution & Order State Machine
app.get('/api/v1/orders', (req, res) => {
  res.json({
    success: true,
    orders: orchestrator.orderStateMachine.getAllOrders(),
  });
});

app.post('/api/v1/orders/execute', (req, res) => {
  const { side, quantity, targetVenue = 'SIMULATION', type = 'MARKET' } = req.body;
  const result = orchestrator.executeOrderPipeline({
    side: side || 'BUY',
    quantity,
    targetVenue,
    type,
  });
  res.json({ success: true, result });
});

// 13. Positions
app.get('/api/v1/positions', (req, res) => {
  res.json({
    success: true,
    simulationPositions: orchestrator.simBroker.getOpenPositions(),
  });
});

// 14. Research & AI Reasoning (Gemini 3.8 Flash)
app.post('/api/v1/research/hypothesis', async (req, res) => {
  const { regime, weakness } = req.body;
  const currentRegime = regime || orchestrator.buildMarketState().regime;
  const observedWeakness = weakness || 'Elevated false breakouts under wide spread conditions.';
  const hypothesis = await orchestrator.aiReasoning.generateHypothesis(currentRegime, observedWeakness);
  res.json({ success: true, hypothesis });
});

app.post('/api/v1/research/critic', async (req, res) => {
  const { strategy, metrics } = req.body;
  const defaultStrat = {
    id: 'STRAT-01',
    name: 'EMA-RSI Regime Adaptive',
    version: '1.0.0',
    generation: 1,
    parentIds: [],
    timeframe: '1m',
    indicators: ['EMA', 'RSI'],
    entryCondition: 'EMA cross',
    exitCondition: 'RSI cross',
    stopLossAtrMult: 1.5,
    takeProfitAtrMult: 2.5,
    maxHoldingPeriods: 60,
    targetRegimes: ['TREND_UP'] as any,
    backtestSharpe: 1.84,
    backtestWinRate: 58.2,
    backtestMaxDrawdownPct: 5.4,
    status: 'VALIDATED' as any,
  };
  const defaultMetrics = {
    winRatePct: 58.2,
    profitFactor: 1.85,
    sharpeRatio: 1.84,
    maxDrawdownPct: 5.4,
    tradeCount: 28,
    totalFees: 4.2,
    netPnL: 11.84,
  };

  const critique = await orchestrator.aiReasoning.criticizeStrategy(
    strategy || defaultStrat,
    metrics || defaultMetrics
  );
  res.json({ success: true, critique });
});

// 15. Learning Center & Memory
app.get('/api/v1/learning/records', (req, res) => {
  res.json({
    success: true,
    records: orchestrator.institutionalMemory.getRecords(),
    driftReports: orchestrator.driftDetector.getReports(),
  });
});

app.post('/api/v1/learning/query-experience', (req, res) => {
  const { regime = 'TREND_UP', volatility = 0.015, trend = 0.4 } = req.body;
  const result = orchestrator.institutionalMemory.querySimilarHistoricalStates(regime, volatility, trend);
  res.json({ success: true, result });
});

// 16. Incidents, Event Bus & Disaster Recovery
app.get('/api/v1/incidents', (req, res) => {
  res.json({
    success: true,
    events: orchestrator.getEventLog(),
    reconciliation: orchestrator.reconciliationEngine.getLastReport(),
  });
});

// ============================================================
// VITE INTEGRATION & STATIC ASSETS
// ============================================================
async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Autonomous AI Quantitative Trading Platform running on port ${PORT}`);
  });
}

startApp();
