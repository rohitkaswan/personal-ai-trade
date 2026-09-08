/**
 * Autonomous AI Quantitative Trading Platform
 * Institutional-Grade Local-First Desktop/Web Application
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { MainDashboard } from './components/MainDashboard';
import { AccountConnections } from './components/AccountConnections';
import { TradingCenter } from './components/TradingCenter';
import { PortfolioBrainView } from './components/PortfolioBrainView';
import { RiskCenter } from './components/RiskCenter';
import { StrategyLab } from './components/StrategyLab';
import { ModelLab } from './components/ModelLab';
import { AICommandCenter } from './components/AICommandCenter';
import { ResearchCenter } from './components/ResearchCenter';
import { LearningCenter } from './components/LearningCenter';
import { DigitalTwinView } from './components/DigitalTwinView';
import { SystemHealthView } from './components/SystemHealthView';
import { SettingsView } from './components/SettingsView';

import {
  AgentDefinition,
  Candle,
  DecisionFusionOutcome,
  LiveBrokerAccount,
  MarketRegime,
  MarketStateVector,
  ModelMetadata,
  Order,
  PlatformProfile,
  Position,
  ReconciliationReport,
  RiskFirewallAuditEntry,
  RiskLimits,
  SystemHealth,
  TestAccount,
  TradingMode,
} from './types/quant';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Core State
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [testAccount, setTestAccount] = useState<TestAccount | null>(null);
  const [liveAccounts, setLiveAccounts] = useState<{
    mt5: LiveBrokerAccount;
    binance: LiveBrokerAccount;
  } | null>(null);
  const [marketState, setMarketState] = useState<MarketStateVector | null>(null);
  const [regime, setRegime] = useState<MarketRegime | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [latestSignal, setLatestSignal] = useState<DecisionFusionOutcome | null>(null);
  const [riskLimits, setRiskLimits] = useState<RiskLimits | null>(null);
  const [auditLog, setAuditLog] = useState<RiskFirewallAuditEntry[]>([]);
  const [learningRecords, setLearningRecords] = useState<any[]>([]);
  const [driftReports, setDriftReports] = useState<any[]>([]);
  const [events, setEvents] = useState<Array<{ type: string; timestamp: number; data: any }>>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationReport | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Initial Data Fetching
  const fetchAllData = useCallback(async () => {
    try {
      const [
        healthRes,
        testAcctRes,
        liveAcctRes,
        marketRes,
        candlesRes,
        agentsRes,
        ordersRes,
        positionsRes,
        modelsRes,
        expRes,
        riskRes,
        learningRes,
        incidentsRes,
      ] = await Promise.all([
        fetch('/api/v1/system').then((r) => r.json()),
        fetch('/api/v1/accounts/test').then((r) => r.json()),
        fetch('/api/v1/accounts/live').then((r) => r.json()),
        fetch('/api/v1/market/state').then((r) => r.json()),
        fetch('/api/v1/market/candles').then((r) => r.json()),
        fetch('/api/v1/agents').then((r) => r.json()),
        fetch('/api/v1/orders').then((r) => r.json()),
        fetch('/api/v1/positions').then((r) => r.json()),
        fetch('/api/v1/models').then((r) => r.json()),
        fetch('/api/v1/experiments').then((r) => r.json()),
        fetch('/api/v1/risk').then((r) => r.json()),
        fetch('/api/v1/learning/records').then((r) => r.json()),
        fetch('/api/v1/incidents').then((r) => r.json()),
      ]);

      if (healthRes.success) setHealth(healthRes.health);
      if (testAcctRes.success) setTestAccount(testAcctRes.account);
      if (liveAcctRes.success) setLiveAccounts(liveAcctRes.accounts);
      if (marketRes.success) {
        setMarketState(marketRes.data.state);
        setRegime(marketRes.data.regime);
      }
      if (candlesRes.success) setCandles(candlesRes.candles);
      if (agentsRes.success) setAgents(agentsRes.agents);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (positionsRes.success) setPositions(positionsRes.simulationPositions);
      if (modelsRes.success) setModels(modelsRes.models);
      if (expRes.success) setExperiments(expRes.experiments);
      if (riskRes.success) {
        setRiskLimits(riskRes.limits);
        setAuditLog(riskRes.auditLog);
      }
      if (learningRes.success) {
        setLearningRecords(learningRes.records);
        setDriftReports(learningRes.driftReports);
      }
      if (incidentsRes.success) {
        setEvents(incidentsRes.events);
        setReconciliation(incidentsRes.reconciliation);
      }
    } catch (err) {
      console.error('Failed to fetch initial state:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    // WebSocket Telemetry Connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'TELEMETRY_UPDATE' || message.type === 'INIT_SNAPSHOT') {
            if (message.data.market) {
              setMarketState(message.data.market.state);
              setRegime(message.data.market.regime);
            }
            if (message.data.testAccount) {
              setTestAccount(message.data.testAccount);
            }
            if (message.data.health) {
              setHealth(message.data.health);
            }
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        console.warn('WS disconnected, relying on periodic poll');
      };
    } catch (e) {
      console.warn('WebSocket setup failed, fallback to polling');
    }

    const interval = setInterval(fetchAllData, 3000);
    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchAllData]);

  // Actions
  const handleToggleKillSwitch = async () => {
    const nextState = !health?.killSwitchEngaged;
    await fetch('/api/v1/system/kill-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: nextState }),
    });
    fetchAllData();
  };

  const handleResetTestAccount = async (amount: number = 500) => {
    await fetch('/api/v1/accounts/test/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    fetchAllData();
  };

  const handleSetTestBalance = async (balance: number) => {
    await fetch('/api/v1/accounts/test/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance }),
    });
    fetchAllData();
  };

  const handleModeChange = async (mode: TradingMode) => {
    await fetch('/api/v1/system/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    fetchAllData();
  };

  const handleProfileChange = async (profile: PlatformProfile) => {
    await fetch('/api/v1/system/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });
    fetchAllData();
  };

  const handleFuseSignals = async () => {
    const res = await fetch('/api/v1/signals/fuse', { method: 'POST' }).then((r) => r.json());
    if (res.success) {
      setLatestSignal(res.outcome);
    }
  };

  const handleExecuteOrder = async (params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    targetVenue: 'SIMULATION' | 'MT5' | 'BINANCE';
    type: 'MARKET' | 'LIMIT';
  }) => {
    const res = await fetch('/api/v1/orders/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then((r) => r.json());
    fetchAllData();
    return res;
  };

  const handleRunVetoTest = async () => {
    const res = await fetch('/api/v1/risk/test-veto', { method: 'POST' }).then((r) => r.json());
    fetchAllData();
    return res;
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Institutional Global Topbar */}
      <Header
        health={health}
        testAccount={testAccount}
        onToggleKillSwitch={handleToggleKillSwitch}
        onResetTestAccount={handleResetTestAccount}
        onModeChange={handleModeChange}
        onProfileChange={handleProfileChange}
      />

      {/* 13-Tab Center Navigation */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Center View Switcher */}
      <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <MainDashboard
            testAccount={testAccount}
            marketState={marketState}
            regime={regime}
            liveAccounts={liveAccounts}
            latestSignal={latestSignal}
            orders={orders}
            mode={health?.mode || 'RESEARCH_ONLY'}
            onModeChange={handleModeChange}
            onFuseSignals={handleFuseSignals}
            onExecuteSampleOrder={(side) =>
              handleExecuteOrder({
                symbol: 'BTCUSDT',
                side,
                quantity: 0.0003,
                targetVenue: 'SIMULATION',
                type: 'MARKET',
              })
            }
            onResetTestAccount={handleResetTestAccount}
            onRunVetoTest={handleRunVetoTest}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountConnections
            testAccount={testAccount}
            liveAccounts={liveAccounts}
            onConnectMT5={(cfg) =>
              fetch('/api/v1/accounts/mt5/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cfg),
              }).then((r) => r.json())
            }
            onDisconnectMT5={() =>
              fetch('/api/v1/accounts/mt5/disconnect', { method: 'POST' }).then((r) => r.json())
            }
            onConnectBinance={(cfg) =>
              fetch('/api/v1/accounts/binance/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cfg),
              }).then((r) => r.json())
            }
            onDisconnectBinance={() =>
              fetch('/api/v1/accounts/binance/disconnect', { method: 'POST' }).then((r) => r.json())
            }
            onRefreshAccounts={fetchAllData}
          />
        )}

        {activeTab === 'trading' && (
          <TradingCenter
            candles={candles}
            orders={orders}
            positions={positions}
            testAccount={testAccount}
            currentPrice={marketState?.price || 65420.0}
            onExecuteOrder={handleExecuteOrder}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioBrainView
            testAccount={testAccount}
            onCalculateSize={(p) =>
              fetch('/api/v1/portfolio/size', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
              }).then((r) => r.json())
            }
          />
        )}

        {activeTab === 'risk' && (
          <RiskCenter
            limits={riskLimits}
            auditLog={auditLog}
            killSwitchActive={health?.killSwitchEngaged ?? false}
            onToggleKillSwitch={handleToggleKillSwitch}
            onUpdateLimits={(l) =>
              fetch('/api/v1/risk/limits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(l),
              }).then((r) => r.json())
            }
            onRunVetoTest={handleRunVetoTest}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyLab
            onRunBacktest={(p) =>
              fetch('/api/v1/strategies/backtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
              }).then((r) => r.json())
            }
            onCriticizeStrategy={(strat, metrics) =>
              fetch('/api/v1/research/critic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy: strat, metrics }),
              }).then((r) => r.json())
            }
          />
        )}

        {activeTab === 'models' && (
          <ModelLab
            models={models}
            onPromoteChallenger={(id) =>
              fetch('/api/v1/models/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengerId: id }),
              }).then((r) => r.json())
            }
            onRollbackChampion={() =>
              fetch('/api/v1/models/rollback', { method: 'POST' }).then((r) => r.json())
            }
            onRefreshModels={fetchAllData}
          />
        )}

        {activeTab === 'agents' && (
          <AICommandCenter
            agents={agents}
            latestSignal={latestSignal}
            onFuseSignals={handleFuseSignals}
          />
        )}

        {activeTab === 'research' && (
          <ResearchCenter
            experiments={experiments}
            currentRegime={regime?.current || 'RANGE'}
            onGenerateHypothesis={(p) =>
              fetch('/api/v1/research/hypothesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
              }).then((r) => r.json())
            }
          />
        )}

        {activeTab === 'learning' && (
          <LearningCenter
            records={learningRecords}
            driftReports={driftReports}
            onQueryExperience={(p) =>
              fetch('/api/v1/learning/query-experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
              }).then((r) => r.json())
            }
          />
        )}

        {activeTab === 'market' && (
          <DigitalTwinView currentRegime={regime?.current || 'RANGE'} />
        )}

        {activeTab === 'health' && (
          <SystemHealthView
            health={health}
            reconciliation={reconciliation}
            events={events}
            onTriggerReconciliation={fetchAllData}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentProfile={health?.profile || 'LOCAL_RESEARCH'}
            currentMode={health?.mode || 'RESEARCH_ONLY'}
            testAccount={testAccount}
            onProfileChange={handleProfileChange}
            onModeChange={handleModeChange}
            onResetTestAccount={handleResetTestAccount}
            onSetTestBalance={handleSetTestBalance}
          />
        )}
      </main>
    </div>
  );
}
