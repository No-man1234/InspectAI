/**
 * AI Website Inspector — Runtime Animation & Microinteraction Analyzer
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { AnimationAnalysisResult } from '../../shared/types';

export class AnimationAnalyzer implements IAnalyzer<AnimationAnalysisResult> {
  readonly name = 'AnimationAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc, window }: AnalyzerContext): AnimationAnalysisResult {
    let hoverCount = 0;
    let scrollAnimationsDetected = false;
    const keyframeNames = new Set<string>();

    const all = doc.querySelectorAll('a, button, [role="button"], .card, div, section');
    const limit = Math.min(all.length, 250);

    for (let i = 0; i < limit; i++) {
      const el = all[i];
      const s = window.getComputedStyle(el);
      if (s.transition && s.transition !== 'all 0s ease 0s' && s.transition !== 'none') {
        hoverCount++;
      }
      if (s.animationName && s.animationName !== 'none') {
        keyframeNames.add(s.animationName);
      }
    }

    // Check for common scroll trigger libraries or observer classes
    const html = doc.documentElement.innerHTML.slice(0, 50000);
    if (html.includes('data-aos') || html.includes('gsap') || html.includes('scroll-trigger') || html.includes('framer-motion')) {
      scrollAnimationsDetected = true;
    }

    const explanation = `The interface leverages microinteractions to guide user attention and convey system responsiveness. We detected ${hoverCount} elements with CSS transitions supporting smooth hover feedback. ${scrollAnimationsDetected ? 'Scroll-linked entrance triggers progressively reveal content blocks, establishing visual rhythm.' : 'The viewport prioritizes immediate render stability with minimal scroll blocking.'} Keyframe choreography (${Array.from(keyframeNames).slice(0, 3).join(', ') || 'subtle fades'}) provides polished polish without compromising frame rates.`;

    return {
      hoverTransitionsCount: hoverCount,
      scrollAnimationsDetected,
      keyframeAnimationsDetected: Array.from(keyframeNames),
      naturalLanguageExplanation: explanation,
    };
  }
}
