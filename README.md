# NexusQuant: Autonomous AI Quantitative Trading & Research Platform
### Multi-Agent Hedge Fund Swarm with Real-Time MetaTrader 5 & Binance Execution

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_Bridge-green.svg)](https://fastapi.tiangolo.com/)
[![MetaTrader 5](https://img.shields.io/badge/MetaTrader_5-IPC_Bridge-red.svg)](https://www.metatrader5.com/)

An institutional-grade, multi-asset quantitative trading, research, and automated algorithmic execution platform. Features a coordinated **39-Agent Swarm** across 8 specialized divisions, a **Machine Learning Model Zoo**, **Reinforcement Learning Execution Policies**, an **Autonomous Strategy Discovery Engine**, and an **Institutional Risk Sentinel with a 5-Stage Governance Pipeline** with automated trade routing to **MetaTrader 5 (MT5)** and **Binance**.

---

## Table of Contents

1. [GitHub Repository Analysis (`rohitkaswan/personal-ai-trade`)](#1-github-repository-analysis-rohitkaswanpersonal-ai-trade)
2. [System Architecture & Swarm Workflow](#2-system-architecture--swarm-workflow)
3. [Step-by-Step Installation & Setup Guide](#3-step-by-step-installation--setup-guide)
   - [Prerequisites](#prerequisites)
   - [Step 1: Clone or Sync the Codebase](#step-1-clone-or-sync-the-codebase)
   - [Step 2: Install Node.js Dependencies](#step-2-install-nodejs-dependencies)
   - [Step 3: Setup Python MT5 Bridge (Important: `pip install -r`)](#step-3-setup-python-mt5-bridge)
   - [Step 4: Configure MetaTrader 5 Terminal](#step-4-configure-metatrader-5-terminal)
   - [Step 5: Configure Environment Variables (`.env`)](#step-5-configure-environment-variables-env)
   - [Step 6: Start the Services](#step-6-start-the-services)
4. [How Autonomous Auto-Trading Operates in MT5](#4-how-autonomous-auto-trading-operates-in-mt5)
5. [User Interface Guide & Controls](#5-user-interface-guide--controls)
6. [Troubleshooting & Common Pitfalls](#6-troubleshooting--common-pitfalls)
7. [Repository File Structure](#7-repository-file-structure)
8. [Risk Disclaimer](#8-risk-disclaimer)

---

## 1. GitHub Repository Analysis (`rohitkaswan/personal-ai-trade`)

The repository at [https://github.com/rohitkaswan/personal-ai-trade](https://github.com/rohitkaswan/personal-ai-trade) represents the core architecture of this autonomous quantitative trading platform.

### Key Architectural Findings:
- **Full-Stack Architecture**: Combines a high-frequency **Node.js/Express + TypeScript** server (`server.ts`) with a **Vite + React 19** frontend, and a native **FastAPI Python IPC Bridge** (`mt5_bridge.py`) for MetaTrader 5 terminal communication.
- **Why Previous Local Builds Hit Errors**:
  1. **`main.tsx` location**: `main.tsx` is located at `src/main.tsx` (called by `<script type="module" src="/src/main.tsx"></script>` in `index.html`).
  2. **View Imports (`src/components/views/`)**: Older commits lacked modular views (`StrategyView.tsx`, `PortfolioView.tsx`, `RiskView.tsx`), causing Vite `Failed to resolve import` errors. The current codebase contains all 11 modular views inside `src/components/views/`.
  3. **Pip Syntax**: Running `pip install requirements.txt` fails because Python expects the `-r` flag: `pip install -r requirements.txt`.
- **Integrated Broker Bridges**:
  - **MetaTrader 5 (MT5)**: Connects via Windows IPC pipe using `MetaTrader5` Python library and FastAPI on `http://127.0.0.1:8000`.
  - **Binance**: Connects via authenticated HMAC-SHA256 REST API and real-time WebSockets for Spot and USDⓈ-M Perpetual Futures.
  - **Autonomous Trading Loop**: The server evaluates alpha strategies every 12 seconds and dispatches orders directly into your live/demo MT5 terminal with automatic Stop Loss and Take Profit brackets.

---

## 2. System Architecture & Swarm Workflow

```
                                  [ EXECUTIVE COUNCIL ]
                  CIO • CRO • CAO • Multi-Agent Orchestrator • Compliance
                                            │
   ┌───────────────┬────────────────────────┼────────────────────────┬───────────────┐
   │               │                        │                        │               │
[MARKET DATA]  [RESEARCH]              [STRATEGY DISCOVERY]     [SIMULATION]    [ML & RL ZOO]
MT5 Gateway    Technical Signals       Symbolic Regression      Tick Replay     TFT / Attn
Binance Feed   Regime Detection (HMM)  Genetic AST Synthesis    Walk-Forward    PPO Exec (TWAP)
Order Book L2  Macro & Sentiment       Pareto Multi-Objective   Monte Carlo     SAC Sizing
Tick Engine    Statistical Arb         Bayesian Optimization    Paper Monitor   DQN / TD3
   │               │                        │                        │               │
   └───────────────┴────────────────────────┼────────────────────────┴───────────────┘
                                            │
                               [ RISK & GOVERNANCE DIVISION ]
                  VaR / CVaR Sentinel • 5-Stage Gatekeeper • Emergency Kill Switch
                                            │
                               [ ORDER MANAGEMENT SYSTEM (OMS) ]
                  Smart Order Routing • Slippage Guard • Broker Execution Bridge
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
       [ MetaTrader 5 IPC Bridge ]                      [ Binance WebSocket/REST ]
        http://127.0.0.1:8000/trade                      Spot & USDⓈ-M Futures
       Native MT5 Desktop Terminal
```

---

## 3. Step-by-Step Installation & Setup Guide

### Prerequisites

| Tool | Recommended Version | Download / Install |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` or `v22.x` (LTS) | [nodejs.org](https://nodejs.org/) |
| **Python** | `3.10` or `3.11` (64-bit) | [python.org](https://www.python.org/) *(Check "Add Python to PATH")* |
| **MetaTrader 5** | Build 4000+ (Windows) | [metatrader5.com](https://www.metatrader5.com/) or your broker (IC Markets, etc.) |
| **Git** | `2.x+` | [git-scm.com](https://git-scm.com/) |

---

### Step 1: Clone or Sync the Codebase

Open **PowerShell** (Windows) or **Terminal** (macOS/Linux):

```powershell
# Clone from GitHub
git clone https://github.com/rohitkaswan/personal-ai-trade.git
cd personal-ai-trade
```

*(If you downloaded a ZIP file, extract it to a folder like `C:\Users\rohit\Downloads\tradehub-connect` and open that folder in PowerShell/VS Code).*

---

### Step 2: Install Node.js Dependencies

Install all required frontend and backend packages:

```powershell
npm install
```

---

### Step 3: Setup Python MT5 Bridge

The MetaTrader 5 Python bridge translates HTTP trading requests into native Windows IPC calls that control your MT5 terminal.

1. **Verify Python is installed**:
   ```powershell
   python --version
   ```
   *(Ensure it is 64-bit Python 3.10 or 3.11).*

2. **Install Python packages using `-r` flag**:
   > ⚠️ **CRITICAL NOTE**: Do NOT run `pip install requirements.txt`. You must use the `-r` flag:
   ```powershell
   pip install -r requirements.txt
   ```

   *(Or install manually: `pip install MetaTrader5 fastapi uvicorn pydantic requests`)*

3. **Start the MT5 Python Bridge**:
   ```powershell
   python mt5_bridge.py
   ```
   You should see output similar to:
   ```
   INFO:     Started server process
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://127.0.0.1:8000
   ```
   *Keep this terminal open in the background.*

---

### Step 4: Configure MetaTrader 5 Terminal

Before the bridge can place trades, MetaTrader 5 requires automated trading permissions:

1. Launch your **MetaTrader 5** desktop application.
2. In the top menu, go to **Tools** → **Options** (or press `Ctrl + O`).
3. Click the **Expert Advisors** tab.
4. Check the following boxes:
   - ✅ **Allow algorithmic trading**
   - ✅ **Allow WebRequest for listed URL** (Add `http://127.0.0.1:8000` to the list)
5. Click **OK**.
6. On the main MT5 toolbar at the top, verify the **"Algo Trading"** button is active (green play icon).

---

### Step 5: Configure Environment Variables (`.env`)

Create your `.env` file by copying `.env.example`:

- **On Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **On macOS / Linux**:
  ```bash
  cp .env.example .env
  ```

Open `.env` and configure your settings:

```env
# Server Port
PORT=3000

# (Optional) Google Gemini API Key for CAO intelligence audits
# Get free key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=""

# (Optional) Binance Credentials
BINANCE_API_KEY=""
BINANCE_API_SECRET=""
BINANCE_USE_TESTNET="true"

# (Optional) MetaTrader 5 Credentials (Can also be connected directly in the Web UI)
MT5_ACCOUNT=""
MT5_PASSWORD=""
MT5_SERVER=""
```

---

### Step 6: Start the Services

Open a second terminal window (leaving the `python mt5_bridge.py` terminal running):

```powershell
npm run dev
```

The system will initialize and start on:
👉 **`http://localhost:3000`**

Open your web browser and navigate to `http://localhost:3000`.

---

## 4. How Autonomous Auto-Trading Operates in MT5

When you launch the system, automated trading is applied automatically:

1. **Swarm Alpha Discovery**:
   - The swarm agents (AlphaTrend, StatArb, Mean-Reversion) analyze live price feeds for Forex (`EUR/USD`, `GBP/USD`, `USD/JPY`) and Commodities (`XAU/USD Gold`).
2. **Pre-Execution Risk Gatekeeper**:
   - Every candidate signal is checked against portfolio risk constraints:
     - Margin allocation capped at 15% available cash.
     - Maximum 6 simultaneous open positions.
     - Emergency Kill-Switch check.
3. **Direct MT5 Deal Execution**:
   - If **MetaTrader 5** is the active broker, the server dispatches a POST request to `http://127.0.0.1:8000/trade`.
   - The Python bridge executes `mt5.order_send()` in your MT5 terminal:
     - Safe lot sizing (0.02 – 0.05 lots).
     - Automated Stop-Loss (30 pips) and Take-Profit (45 pips).
     - Order comment: `NexusQuant Swarm Auto`.
4. **Automated Take-Profit & Stop-Loss Closing**:
   - The background cycle monitors active positions. When a target profit (+1.5%) or stop loss (-1.2%) is reached, it automatically calls `http://127.0.0.1:8000/close`, closing the deal in MT5 without requiring manual user clicks.

---

## 5. User Interface Guide & Controls

### Top Header Bar
- **`[ AUTOTRADE: ACTIVE / PAUSED ]`**: Toggle automated trading on or off anytime with a single click.
- **`[ MODE: PAPER TRADING / LIVE (GUARDED) ]`**: Switch between simulation sandbox and guarded live order routing.
- **`[ KILL SWITCH ]`**: Instantly flattens all open positions and freezes all trading agents in an emergency.
- **`MT5 IPC` & `Binance WS` Pills**: Shows real-time connection status and millisecond latency.

### Primary Views (Navigation Bar)
1. **Overview / Live Trading Desk**: Real-time Level 2 order book, tick chart, active open positions, and quick manual execution blotter.
2. **Brokers Tab**:
   - Connect or simulate your MetaTrader 5 account.
   - Enter Account Number, Password, and Broker Server (e.g., `ICMarketsSC-Demo`).
   - Quick MT5 Order Dispatcher to send immediate test market orders (BUY/SELL).
   - Binance API Key and Secret manager.
3. **Agents (39 Swarm Entities)**: Live CPU, memory, and telemetry of the 8 divisions, plus AI Supervisor audit logs.
4. **Strategies**: Active alpha leaderboard with Sharpe, Sortino, Calmar ratios, and AST genetic program equations.
5. **Portfolio & Risk**: Real-time VaR, CVaR, asset class exposure breakdown, and margin utilization.
6. **Backtest & ML Lab**: Walk-forward simulations, Monte Carlo distributions, and Reinforcement Learning policies.

---

## 6. Troubleshooting & Common Pitfalls

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `pip install requirements.txt` errors with `Could not find a version...` | Missing `-r` flag in pip command. | Run **`pip install -r requirements.txt`**. |
| `Failed to resolve import "./components/views/..."` | Older zip or git branch missing view files. | Ensure all files in `src/components/views/` are present (such as `StrategyView.tsx`, `PortfolioView.tsx`, `RiskView.tsx`). |
| `where is main.tsx in your source` | Looking in root instead of `src/`. | The file is at **`src/main.tsx`**. It renders `<App />` into `#root`. |
| MT5 trade returns `Trade Disabled` (code 10017) | "Algo Trading" button is disabled in MT5. | Click the green **"Algo Trading"** button on the MT5 top toolbar. |
| MT5 bridge cannot connect on port 8000 | Another process is using port 8000. | Check using `netstat -ano \| findstr :8000` in Windows PowerShell, or change port in `mt5_bridge.py`. |
| Port 3000 in use | Another Node or dev process running. | Set `PORT=3001` in your `.env` file and restart `npm run dev`. |

---

## 7. Repository File Structure

```
personal-ai-trade/
├── package.json               # Node.js dependencies & scripts
├── server.ts                  # Express server, swarm agent coordinator & MT5 router
├── mt5_bridge.py              # FastAPI Python bridge communicating with MT5 terminal
├── requirements.txt           # Python dependencies (MetaTrader5, fastapi, uvicorn)
├── vite.config.ts             # Vite configuration with Tailwind CSS plugin
├── tsconfig.json              # TypeScript compiler options
├── .env.example               # Example environment variables
├── index.html                 # Browser entry point (links to /src/main.tsx)
└── src/
    ├── main.tsx               # React root initialization
    ├── App.tsx                # Master state container, polling & routing
    ├── index.css              # Global styles
    ├── types/
    │   └── trading.ts         # TypeScript interfaces for orders, agents & brokers
    └── components/
        ├── Header.tsx         # Top bar (AutoTrade toggle, Kill Switch, Mode)
        ├── Navigation.tsx     # Tab switcher
        ├── KillSwitchModal.tsx# Emergency liquidation dialog
        ├── Mt5BridgeGuideModal.tsx # Step-by-step MT5 connection dialog
        └── views/
            ├── OverviewView.tsx     # Live chart, order book & positions
            ├── BrokersView.tsx      # MT5 & Binance account manager & test order form
            ├── AgentsView.tsx       # 39 Swarm agents telemetry & AI audit
            ├── StrategyView.tsx     # Strategy discovery & alpha ranking
            ├── PortfolioView.tsx    # Asset allocation & fund balance
            ├── RiskView.tsx         # VaR/CVaR & 5-stage governance
            ├── ExecutionView.tsx    # Order blotter & latency metrics
            ├── AICenterView.tsx     # ML & RL Model Zoo
            ├── BacktestView.tsx     # Historical walk-forward backtesting
            ├── LearningView.tsx     # Vector memory & model self-improvement
            └── DeploymentView.tsx   # Production container configurations
```

---

## 8. Risk Disclaimer

> **IMPORTANT DISCLAIMER**: Financial trading in foreign exchange (Forex), contracts for difference (CFDs), commodities, and cryptocurrency derivatives involves a high degree of risk. Past simulated performance or backtest results do not guarantee future returns. Always trade on demo accounts first until you have thoroughly validated your risk parameters and governance thresholds.
