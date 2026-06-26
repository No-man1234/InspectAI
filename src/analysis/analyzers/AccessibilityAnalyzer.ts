/**
 * AI Website Inspector — Accessibility (a11y) & ARIA Auditor
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { AccessibilityAuditResult } from '../../shared/types';

export class AccessibilityAnalyzer implements IAnalyzer<AccessibilityAuditResult> {
  readonly name = 'AccessibilityAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc }: AnalyzerContext): AccessibilityAuditResult {
    const violations: string[] = [];
    const recs: string[] = [];
    let score = 100;

    // Check images missing alt text
    const images = doc.getElementsByTagName('img');
    let missingAlt = 0;
    for (let i = 0; i < images.length; i++) {
      const alt = images[i].getAttribute('alt');
      if (alt === null || alt.trim() === '') {
        missingAlt++;
      }
    }
    if (missingAlt > 0) {
      score -= Math.min(25, missingAlt * 3);
      violations.push(`${missingAlt} images lack descriptive 'alt' text attributes.`);
      recs.push('Ensure all content images contain meaningful alt attributes for screen reader compatibility.');
    }

    // Check form inputs missing labels or aria-label
    const inputs = doc.querySelectorAll('input:not([type="hidden"]), select, textarea');
    let missingLabels = 0;
    inputs.forEach((inp) => {
      const id = inp.getAttribute('id');
      const hasLabelTag = id && doc.querySelector(`label[for="${id}"]`);
      const hasAria = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
      if (!hasLabelTag && !hasAria && !inp.closest('label')) {
        missingLabels++;
      }
    });
    if (missingLabels > 0) {
      score -= Math.min(20, missingLabels * 4);
      violations.push(`${missingLabels} interactive form inputs lack associated <label> tags or ARIA labels.`);
      recs.push('Associate explicit <label> elements or aria-label attributes with all form controls.');
    }

    // Check ARIA landmarks
    const landmarks = doc.querySelectorAll('header, nav, main, footer, [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]').length;
    if (landmarks < 2) {
      score -= 15;
      violations.push('Insufficient ARIA landmark elements detected.');
      recs.push('Structure page layout using HTML5 semantic elements (<nav>, <main>, <footer>) to assist assistive tech navigation.');
    }

    // Check heading skips
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let skippedHeadings = false;
    let prevLevel = 1;
    headings.forEach((h) => {
      const lvl = parseInt(h.tagName.substring(1), 10);
      if (lvl - prevLevel > 1 && prevLevel !== 0) {
        skippedHeadings = true;
      }
      prevLevel = lvl;
    });
    if (skippedHeadings) {
      score -= 10;
      violations.push('Heading hierarchy skips levels (e.g., jumping from H1 directly to H3).');
      recs.push('Maintain sequential heading increments to preserve document outline clarity.');
    }

    // Keyboard focus indicators heuristic
    const hasFocusStyles = doc.documentElement.innerHTML.includes(':focus');
    if (!hasFocusStyles) {
      score -= 10;
      recs.push('Ensure visible focus rings (:focus-visible) are maintained on all interactive elements.');
    }

    return {
      overallScore: Math.max(0, score),
      ariaLandmarksCount: landmarks,
      missingAltImagesCount: missingAlt,
      missingFormLabelsCount: missingLabels,
      keyboardNavigable: Boolean(hasFocusStyles),
      violationsSummary: violations.length ? violations : ['Zero major ARIA or semantic HTML violations detected.'],
      recommendations: recs.length ? recs : ['Maintain current exemplary accessibility engineering standards.'],
    };
  }
}
