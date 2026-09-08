/**
 * AI Command Center Component
 * 62 Specialized Quantitative Agents across 6 Operational Divisions.
 * Displays agent catalog, reputation leaderboard, and consensus voting matrix.
 */

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Shield,
  TrendingUp,
  Brain,
  Sliders,
  CheckCircle,
  Filter,
  Search,
  Award,
  Flame,
} from 'lucide-react';
import { AgentDefinition, AgentDivision, DecisionFusionOutcome } from '../types/quant';

interface AICommandCenterProps {
  agents: AgentDefinition[];
  latestSignal: DecisionFusionOutcome | null;
  onFuseSignals: () => void;
}

export const AICommandCenter: React.FC<AICommandCenterProps> = ({
  agents,
  latestSignal,
  onFuseSignals,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getDivision = (a: AgentDefinition): string => {
    return a.division || (a.category === 'EXECUTIVE' ? 'EXECUTIVE_RISK' : a.category) || 'OPERATIONS';
  };

  const divisions: Array<{ id: string; label: string; count: number }> = [
    { id: 'ALL', label: 'All Divisions', count: agents.length },
    { id: 'EXECUTIVE_RISK', label: 'Executive & Risk', count: agents.filter((a) => getDivision(a) === 'EXECUTIVE_RISK').length },
    { id: 'MARKET_INTELLIGENCE', label: 'Market Intelligence', count: agents.filter((a) => getDivision(a) === 'MARKET_INTELLIGENCE').length },
    { id: 'STRATEGY_LAB', label: 'Strategy Lab', count: agents.filter((a) => getDivision(a) === 'STRATEGY_LAB').length },
    { id: 'AI_LAB', label: 'AI & ML Lab', count: agents.filter((a) => getDivision(a) === 'AI_LAB').length },
    { id: 'RL_LAB', label: 'RL Lab', count: agents.filter((a) => getDivision(a) === 'RL_LAB').length },
    { id: 'OPERATIONS', label: 'Operations & SRE', count: agents.filter((a) => getDivision(a) === 'OPERATIONS').length },
  ];

  const filteredAgents = agents.filter((a) => {
    const div = getDivision(a);
    const matchesDiv = selectedDivision === 'ALL' || div === selectedDivision;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiv && matchesSearch;
  });

  const sortedLeaderboard = [...agents].sort((a, b) => b.reputationScore - a.reputationScore).slice(0, 8);

  return (
    <div id="ai-command-center-container" className="space-y-6 p-4">
      {/* Top Banner & Trigger Action */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-200 uppercase">
              Hierarchical 62-Agent Autonomous Ecosystem
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
              Structured into 6 specialized divisions. Each agent maintains an independent Bayesian reputation score,
              domain-specific voting privileges, and rigorous post-trade accountability.
            </p>
          </div>
        </div>

        <button
          id="btn-trigger-deliberation"
          onClick={onFuseSignals}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-colors shadow-lg shadow-indigo-950"
        >
          <Sparkles className="w-4 h-4" />
          <span>TRIGGER DELIBERATION & CONSENSUS</span>
        </button>
      </div>

      {/* Consensus Matrix Summary */}
      {latestSignal && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded p-4 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="text-indigo-400 font-bold uppercase">
              Active Consensus: {latestSignal.action} (Confidence: {((latestSignal.confidence || 0.8) * 100).toFixed(0)}%)
            </div>
            <div className="text-slate-400 text-[11px]">
              Weights: Bayesian Reputation Weighted Voting
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">COST FEASIBILITY</span>
              <span className="text-slate-300 font-bold">{latestSignal.structuredEvidence?.costFeasibility || 'Passed'}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">REGIME ALIGNMENT</span>
              <span className="text-slate-300 font-bold">{latestSignal.structuredEvidence?.regimeAlignment || 'Neutral'}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">EXPECTED EDGE</span>
              <span className="text-emerald-400 font-bold">+{latestSignal.expectedReturnBps || 12.5} bps</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">HOLDING PERIOD</span>
              <span className="text-slate-300 font-bold">{latestSignal.suggestedHoldingBars || 30} bars</span>
            </div>
          </div>
        </div>
      )}

      {/* Top 8 Reputation Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
              Agent Reputation Leaderboard (Top 8)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Bayesian Elo Metric</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {sortedLeaderboard.map((agent, idx) => (
            <div
              key={agent.id}
              className="bg-slate-950 p-2.5 rounded border border-slate-800/80 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-amber-400 font-bold">#{idx + 1}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {(agent.division || agent.category || 'OP').split('_')[0]}
                </span>
              </div>
              <div className="font-bold text-slate-200 my-1 truncate text-xs" title={agent.name}>
                {agent.name}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-1">
                <span>Score: <strong className="text-emerald-400">{agent.reputationScore}</strong></span>
                <span>Win: {agent.winRatePct ?? agent.winRateContribution ?? 50}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {/* Division Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {divisions.map((div) => (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedDivision === div.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {div.label} ({div.count})
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-slate-900 border border-slate-800 rounded p-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-indigo-400 font-bold">{agent.id}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    agent.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">{agent.name}</h4>
              <p className="text-slate-400 text-xs mt-1 line-clamp-2 font-sans">{agent.role}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Model Engine:</span>
                <span className="text-slate-200 font-semibold">{agent.modelEngine || 'LightGBM-v3'}</span>
              </div>
              <div className="flex justify-between">
                <span>Reputation Score:</span>
                <span className="text-emerald-400 font-bold">{agent.reputationScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Target Regime:</span>
                <span className="text-sky-400 font-semibold">{agent.targetRegime || 'ALL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Historical Win Rate:</span>
                <span className="text-slate-300">
                  {agent.winRatePct ?? agent.winRateContribution ?? 50}% ({agent.totalVotesCast ?? 120} votes)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
