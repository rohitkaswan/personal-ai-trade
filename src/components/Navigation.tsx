/**
 * Navigation Bar Component
 * Tabular navigation linking all 13 core operational centers.
 */

import React from 'react';
import {
  LayoutDashboard,
  Link2,
  TrendingUp,
  PieChart,
  ShieldCheck,
  FlaskConical,
  BrainCircuit,
  Bot,
  Microscope,
  BookOpen,
  Boxes,
  Activity,
  Sliders,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'accounts'
  | 'trading'
  | 'portfolio'
  | 'risk'
  | 'strategy'
  | 'models'
  | 'agents'
  | 'research'
  | 'learning'
  | 'market'
  | 'health'
  | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'accounts', label: 'Accounts', icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: 'trading', label: 'Trading', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <PieChart className="w-3.5 h-3.5" /> },
    { id: 'risk', label: 'Risk Center', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'strategy', label: 'Strategy Lab', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { id: 'models', label: 'Model Lab', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
    { id: 'agents', label: 'AI Command (62)', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'research', label: 'Research', icon: <Microscope className="w-3.5 h-3.5" /> },
    { id: 'learning', label: 'Learning Center', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'market', label: 'Digital Twin', icon: <Boxes className="w-3.5 h-3.5" /> },
    { id: 'health', label: 'System Health', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav id="platform-navigation" className="bg-[#0b1120] border-b border-slate-800 px-4 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono transition-colors border-b-2 ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
