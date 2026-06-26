/**
 * AI Website Inspector — Typography System Analyzer
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { TypographyAnalysisResult } from '../../shared/types';

export class TypographyAnalyzer implements IAnalyzer<TypographyAnalysisResult> {
  readonly name = 'TypographyAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc, window }: AnalyzerContext): TypographyAnalysisResult {
    const fonts = new Set<string>();
    const importedUrls = new Set<string>();

    // Scan links for Google Fonts or Adobe Fonts
    doc.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="use.typekit.net"]').forEach((link) => {
      importedUrls.add(link.getAttribute('href')!);
    });

    const bodyStyle = window.getComputedStyle(doc.body || doc.documentElement);
    const bodyFont = bodyStyle.fontFamily;
    bodyFont.split(',').forEach((f) => fonts.add(f.trim().replace(/['"]/g, '')));

    // Heading scale ratio calculation
    const h1 = doc.querySelector('h1');
    const p = doc.querySelector('p') || doc.body;
    let h1Size = 32;
    let baseSize = 16;
    if (h1) h1Size = parseFloat(window.getComputedStyle(h1).fontSize) || 32;
    if (p) baseSize = parseFloat(window.getComputedStyle(p).fontSize) || 16;

    const scaleRatio = Number((h1Size / baseSize).toFixed(2));

    // Line height evaluation
    const lineHeightVal = parseFloat(bodyStyle.lineHeight);
    const lhRatio = isNaN(lineHeightVal) ? 1.5 : lineHeightVal / baseSize;
    const consistencyScore = lhRatio >= 1.4 && lhRatio <= 1.8 ? 92 : 74;

    const readabilityScore = Math.min(100, Math.round((consistencyScore * 0.6) + (fonts.size <= 3 ? 40 : 20)));

    const dominantFont = Array.from(fonts)[0] || 'System UI';
    const explanation = `The typography architecture relies on a structured hierarchy anchored by '${dominantFont}'. The heading scale ratio of ${scaleRatio}x provides clear typographic contrast, while the base font size of ${baseSize}px combined with a comfortable line height supports sustained scannability and reading rhythm.`;

    return {
      fontFamiliesDetected: Array.from(fonts),
      importedFontsUrls: Array.from(importedUrls),
      headingScaleRatio: scaleRatio,
      baseFontSizePx: baseSize,
      lineHeightConsistency: consistencyScore,
      readabilityScore,
      typographySystemExplanation: explanation,
    };
  }
}
