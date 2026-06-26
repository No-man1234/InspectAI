/**
 * AI Website Inspector — Layout & Spacing Rhythm Analyzer
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { LayoutAnalysisResult } from '../../shared/types';

export class LayoutAnalyzer implements IAnalyzer<LayoutAnalysisResult> {
  readonly name = 'LayoutAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc, window }: AnalyzerContext): LayoutAnalysisResult {
    const all = doc.querySelectorAll('*');
    let flexCount = 0;
    let gridCount = 0;
    let maxContainerWidth = 0;

    const sample = Math.min(all.length, 500);
    for (let i = 0; i < sample; i++) {
      const el = all[i];
      const style = window.getComputedStyle(el);
      if (style.display === 'flex' || style.display === 'inline-flex') flexCount++;
      if (style.display === 'grid' || style.display === 'inline-grid') gridCount++;

      const w = el.clientWidth;
      if (w > maxContainerWidth && w <= window.innerWidth) {
        maxContainerWidth = w;
      }
    }

    // Heuristics for alignment & spacing consistency
    const alignmentScore = Math.min(100, Math.max(50, 100 - Math.round(Math.abs(flexCount - gridCount) / 10)));
    const rhythmScore = flexCount > 5 || gridCount > 5 ? 88 : 65;

    // Reading flow inference
    const hasHero = doc.querySelector('.hero, header, h1');
    const hasSidebar = doc.querySelector('aside, .sidebar');
    let flow: LayoutAnalysisResult['dominantFlowPattern'] = 'F-pattern';
    if (hasHero && !hasSidebar) flow = 'Z-pattern';
    if (gridCount > 15) flow = 'Complex / Modular';

    // Visual density inference
    const bodyHeight = doc.body?.scrollHeight || 1000;
    const densityRatio = all.length / bodyHeight;
    let visualDensity: LayoutAnalysisResult['visualDensity'] = 'Balanced';
    if (densityRatio > 0.8) visualDensity = 'Dense / Data-heavy';
    if (densityRatio < 0.25) visualDensity = 'Spacious / Airy';

    // Responsive breakpoints scanning in stylesheets
    const breakpoints = new Set<string>();
    try {
      Array.from(doc.styleSheets).forEach((sheet) => {
        try {
          Array.from(sheet.cssRules || []).forEach((rule) => {
            if (rule instanceof CSSMediaRule && rule.conditionText.includes('width')) {
              breakpoints.add(rule.conditionText);
            }
          });
        } catch {
          // CORS restricted external stylesheet
        }
      });
    } catch {
      // ignore style sheet access issues
    }

    const defaultBreakpoints = ['(min-width: 640px)', '(min-width: 768px)', '(min-width: 1024px)', '(min-width: 1280px)'];
    const resolvedBreakpoints = breakpoints.size > 0 ? Array.from(breakpoints).slice(0, 6) : defaultBreakpoints;

    return {
      flexboxUsageCount: flexCount,
      gridUsageCount: gridCount,
      maxContainerWidthPx: maxContainerWidth || 1280,
      alignmentConsistencyScore: alignmentScore,
      spacingRhythmScore: rhythmScore,
      dominantFlowPattern: flow,
      visualDensity,
      responsiveBreakpointsDetected: resolvedBreakpoints,
    };
  }
}
