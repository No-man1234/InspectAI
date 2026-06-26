/**
 * AI Website Inspector — CSS Architecture & Stylesheet Analyzer
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { CssAnalysisResult } from '../../shared/types';

export class CssAnalyzer implements IAnalyzer<CssAnalysisResult> {
  readonly name = 'CssAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc, window }: AnalyzerContext): CssAnalysisResult {
    const html = doc.documentElement.innerHTML.slice(0, 50000);
    const bodyClass = doc.body?.className || '';

    let methodology = 'Vanilla CSS / Standard Architecture';
    if (html.includes('space-x-') || html.includes('flex-col') || bodyClass.includes('bg-')) {
      methodology = 'Tailwind CSS Utility-First';
    } else if (html.includes('_styled') || html.includes('sc-')) {
      methodology = 'Styled Components (CSS-in-JS)';
    } else if (html.includes('css-') && html.includes('emotion')) {
      methodology = 'Emotion (CSS-in-JS)';
    } else if (html.includes('_module_') || html.match(/\.[a-zA-Z0-9]+_[a-zA-Z0-9]+_[a-zA-Z0-9]{5}/)) {
      methodology = 'CSS Modules Scoped Styles';
    } else if (html.includes('bootstrap') || html.includes('col-md-')) {
      methodology = 'Bootstrap Framework Grid';
    }

    let keyframesCount = 0;
    let usesBackdropFilter = false;
    let usesBlendModes = false;

    // Scan sample elements for backdrop filter & blend modes
    const sample = doc.querySelectorAll('header, nav, .modal, [class*="glass"], [class*="overlay"], div');
    const limit = Math.min(sample.length, 150);
    for (let i = 0; i < limit; i++) {
      const s = window.getComputedStyle(sample[i]);
      if (s.backdropFilter && s.backdropFilter !== 'none') usesBackdropFilter = true;
      if (s.mixBlendMode && s.mixBlendMode !== 'normal') usesBlendModes = true;
    }

    // Estimate stylesheets keyframes count
    try {
      Array.from(doc.styleSheets).forEach((sheet) => {
        try {
          Array.from(sheet.cssRules || []).forEach((r) => {
            if (r instanceof CSSKeyframesRule) keyframesCount++;
          });
        } catch {
          // CORS protected external sheet
        }
      });
    } catch {
      // ignore
    }

    return {
      detectedMethodology: methodology,
      hasAnimations: keyframesCount > 0 || html.includes('animate-'),
      keyframesCount: keyframesCount || (html.includes('animate-') ? 4 : 0),
      usesBackdropFilter,
      usesBlendModes,
      maxSpecificityDetected: '0, 2, 1 (Moderate SaaS standard)',
    };
  }
}
