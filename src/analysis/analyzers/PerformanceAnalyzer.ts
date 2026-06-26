/**
 * AI Website Inspector — Frontend Runtime Performance & DOM Bloat Estimator
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { PerformanceEstimates } from '../../shared/types';

export class PerformanceAnalyzer implements IAnalyzer<PerformanceEstimates> {
  readonly name = 'PerformanceAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc }: AnalyzerContext): PerformanceEstimates {
    const totalNodes = doc.getElementsByTagName('*').length;
    const bottlenecks: string[] = [];

    // DOM Bloat Score (100 = optimal < 1000 nodes; penalize heavy trees)
    let bloatScore = 100;
    if (totalNodes > 1500) bloatScore -= 20;
    if (totalNodes > 3000) bloatScore -= 35;
    if (totalNodes > 5000) bloatScore -= 50;

    // Check heavy un-lazy-loaded media
    const images = doc.getElementsByTagName('img');
    let heavyCount = 0;
    let lazyCount = 0;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.getAttribute('loading') === 'lazy') lazyCount++;
      const src = img.getAttribute('src') || '';
      if (src.endsWith('.png') || src.endsWith('.gif') || src.includes('unoptimized')) {
        heavyCount++;
      }
    }

    const lazyEnabled = images.length === 0 || (lazyCount / images.length) >= 0.3;

    if (totalNodes > 2500) {
      bottlenecks.push(`Excessive DOM size (${totalNodes} elements) increases style recalculation costs and memory pressure.`);
    }
    if (!lazyEnabled && images.length > 5) {
      bottlenecks.push('Below-the-fold images lack native lazy loading (loading="lazy"), impacting initial page load bandwidth.');
    }
    if (doc.getElementsByTagName('iframe').length > 3) {
      bottlenecks.push('Multiple embedded <iframe> elements detected, creating independent browser rendering contexts.');
    }

    return {
      estimatedDomBloatScore: Math.max(10, bloatScore),
      heavyMediaDetectedCount: heavyCount,
      lazyLoadEnabled: lazyEnabled,
      potentialBottlenecks: bottlenecks.length ? bottlenecks : ['Zero critical DOM rendering bottlenecks detected.'],
    };
  }
}
