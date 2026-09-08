/**
 * Model Governance & Champion / Challenger Lifecycle
 * Enforces disciplined out-of-sample promotion gates and instant rollback capabilities.
 */

import { ModelMetadata } from '../../src/types/quant';

export class ModelGovernanceManager {
  private models: Map<string, ModelMetadata> = new Map();

  constructor() {
    this.seedDefaultModels();
  }

  private seedDefaultModels(): void {
    const champion: ModelMetadata = {
      id: 'MDL-LGBM-V14',
      name: 'LightGBM Alpha Ensemble',
      version: '1.4.2',
      architecture: 'LightGBM',
      role: 'CHAMPION',
      targetRegime: 'ALL',
      features: ['EMA_SPREAD', 'RSI_14', 'ATR_RATIO', 'ORDER_BOOK_IMBALANCE', 'HURST'],
      trainingTimestamp: Date.now() - 86400000 * 5,
      outOfSampleSharpe: 2.15,
      outOfSampleAccuracy: 58.6,
      brierUncertaintyScore: 0.18,
      driftStatus: 'HEALTHY',
      psiScore: 0.042,
      isPromoted: true,
    };

    const challenger: ModelMetadata = {
      id: 'MDL-TFT-V20',
      name: 'Temporal Fusion Transformer',
      version: '2.0.1',
      architecture: 'Transformer',
      role: 'CHALLENGER',
      targetRegime: 'TREND_UP',
      features: ['RAW_RETURNS', 'VWAP_DISTANCE', 'VOLATILITY_SURFACE', 'MICROPRICE'],
      trainingTimestamp: Date.now() - 86400000,
      outOfSampleSharpe: 2.38,
      outOfSampleAccuracy: 61.2,
      brierUncertaintyScore: 0.16,
      driftStatus: 'HEALTHY',
      psiScore: 0.038,
      isPromoted: false,
    };

    const shadow: ModelMetadata = {
      id: 'MDL-LSTM-V09',
      name: 'Deep Bidirectional LSTM',
      version: '0.9.4',
      architecture: 'LSTM',
      role: 'SHADOW',
      targetRegime: 'RANGE',
      features: ['ORDER_BOOK_LEVELS', 'TRADE_INTENSITY', 'ZSCORE'],
      trainingTimestamp: Date.now() - 86400000 * 2,
      outOfSampleSharpe: 1.62,
      outOfSampleAccuracy: 54.1,
      brierUncertaintyScore: 0.24,
      driftStatus: 'MODERATE_DRIFT',
      psiScore: 0.112,
      isPromoted: false,
    };

    this.models.set(champion.id, champion);
    this.models.set(challenger.id, challenger);
    this.models.set(shadow.id, shadow);
  }

  public getModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }

  public getChampion(): ModelMetadata | undefined {
    return Array.from(this.models.values()).find((m) => m.role === 'CHAMPION');
  }

  public promoteChallenger(challengerId: string): { success: boolean; message: string } {
    const challenger = this.models.get(challengerId);
    if (!challenger) return { success: false, message: 'Model not found' };

    const currentChampion = this.getChampion();

    // Strict validation gate
    if (currentChampion && challenger.outOfSampleSharpe <= currentChampion.outOfSampleSharpe) {
      return {
        success: false,
        message: `Promotion rejected: Challenger Sharpe (${challenger.outOfSampleSharpe}) must exceed Champion Sharpe (${currentChampion.outOfSampleSharpe}).`,
      };
    }

    if (challenger.psiScore > 0.15) {
      return {
        success: false,
        message: `Promotion rejected: Challenger exhibits feature drift (PSI: ${challenger.psiScore} > 0.15).`,
      };
    }

    // Demote current champion
    if (currentChampion) {
      currentChampion.role = 'SHADOW';
      currentChampion.isPromoted = false;
      challenger.rollbackVersion = currentChampion.id;
    }

    challenger.role = 'CHAMPION';
    challenger.isPromoted = true;

    return {
      success: true,
      message: `Model ${challenger.name} v${challenger.version} successfully promoted to CHAMPION.`,
    };
  }

  public rollbackChampion(): { success: boolean; message: string } {
    const currentChampion = this.getChampion();
    if (!currentChampion || !currentChampion.rollbackVersion) {
      return { success: false, message: 'No rollback target available for current champion.' };
    }

    const previousChampion = this.models.get(currentChampion.rollbackVersion);
    if (!previousChampion) {
      return { success: false, message: 'Previous rollback model record missing.' };
    }

    currentChampion.role = 'RETIRED';
    currentChampion.isPromoted = false;
    previousChampion.role = 'CHAMPION';
    previousChampion.isPromoted = true;

    return {
      success: true,
      message: `Rolled back production champion to ${previousChampion.name} v${previousChampion.version}.`,
    };
  }
}
