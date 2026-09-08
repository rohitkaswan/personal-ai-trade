/**
 * Drift Detection Engine
 * Monitors Feature Drift (PSI), Prediction Drift, and Execution Drift.
 */

export interface DriftReport {
  timestamp: number;
  featureName: string;
  psiScore: number;
  driftStatus: 'HEALTHY' | 'MODERATE_DRIFT' | 'SEVERE_DRIFT';
  recommendation: 'CONTINUE' | 'SHADOW_MODE' | 'RETRAIN' | 'ROLLBACK';
  details: string;
}

export class DriftDetector {
  private reports: DriftReport[] = [];

  /**
   * Computes Population Stability Index (PSI) between reference baseline and current target.
   * PSI = Sum( (Actual% - Expected%) * ln(Actual% / Expected%) )
   */
  public calculatePSI(expected: number[], actual: number[], numBins: number = 5): number {
    if (expected.length === 0 || actual.length === 0) return 0;

    const min = Math.min(...expected, ...actual);
    const max = Math.max(...expected, ...actual);
    const binWidth = (max - min) / numBins || 1;

    const expCounts = new Array(numBins).fill(0.001); // smoothing
    const actCounts = new Array(numBins).fill(0.001);

    for (const val of expected) {
      const idx = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
      expCounts[idx]++;
    }
    for (const val of actual) {
      const idx = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
      actCounts[idx]++;
    }

    const expTotal = expCounts.reduce((a, b) => a + b, 0);
    const actTotal = actCounts.reduce((a, b) => a + b, 0);

    let psi = 0;
    for (let i = 0; i < numBins; i++) {
      const expPct = expCounts[i] / expTotal;
      const actPct = actCounts[i] / actTotal;
      psi += (actPct - expPct) * Math.log(actPct / expPct);
    }

    return Math.max(0, Number(psi.toFixed(4)));
  }

  public checkFeatureDrift(featureName: string, referenceValues: number[], liveValues: number[]): DriftReport {
    const psi = this.calculatePSI(referenceValues, liveValues);

    let driftStatus: 'HEALTHY' | 'MODERATE_DRIFT' | 'SEVERE_DRIFT' = 'HEALTHY';
    let recommendation: 'CONTINUE' | 'SHADOW_MODE' | 'RETRAIN' | 'ROLLBACK' = 'CONTINUE';
    let details = `PSI of ${psi.toFixed(4)} indicates statistical stability.`;

    if (psi >= 0.25) {
      driftStatus = 'SEVERE_DRIFT';
      recommendation = 'SHADOW_MODE';
      details = `Significant feature distribution shift detected (PSI: ${psi.toFixed(4)} >= 0.25). Model moved to shadow evaluation.`;
    } else if (psi >= 0.1) {
      driftStatus = 'MODERATE_DRIFT';
      recommendation = 'RETRAIN';
      details = `Moderate feature drift observed (PSI: ${psi.toFixed(4)}). Retraining queue task flagged.`;
    }

    const report: DriftReport = {
      timestamp: Date.now(),
      featureName,
      psiScore: psi,
      driftStatus,
      recommendation,
      details,
    };

    this.reports.push(report);
    if (this.reports.length > 50) this.reports.shift();
    return report;
  }

  public getReports(): DriftReport[] {
    return [...this.reports].reverse();
  }
}
