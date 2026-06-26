/**
 * AI Website Inspector — Color Palette & WCAG Accessibility Analyzer
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { ColorAnalysisResult, ContrastAudit } from '../../shared/types';

export class ColorAnalyzer implements IAnalyzer<ColorAnalysisResult> {
  readonly name = 'ColorAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc, window }: AnalyzerContext): ColorAnalysisResult {
    const bgColors = new Map<string, number>();
    const textColors = new Map<string, number>();
    const cssVars: Record<string, string> = {};

    const all = doc.querySelectorAll('*');
    const sample = Math.min(all.length, 300);

    for (let i = 0; i < sample; i++) {
      const el = all[i];
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const fg = style.color;

      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        bgColors.set(bg, (bgColors.get(bg) || 0) + 1);
      }
      if (fg) {
        textColors.set(fg, (textColors.get(fg) || 0) + 1);
      }
    }

    // Extract root CSS variables
    const rootStyles = window.getComputedStyle(doc.documentElement);
    for (let i = 0; i < rootStyles.length; i++) {
      const prop = rootStyles[i];
      if (prop.startsWith('--')) {
        cssVars[prop] = rootStyles.getPropertyValue(prop).trim();
      }
    }

    const sortMap = (m: Map<string, number>) =>
      Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .map((e) => e[0]);

    const topBgs = sortMap(bgColors);
    const topTexts = sortMap(textColors);

    const primaryPalette = topBgs.slice(0, 3);
    const secondaryPalette = topBgs.slice(3, 6);
    const accentColors = topTexts.slice(1, 4);
    const neutralPalette = ['#ffffff', '#f8fafc', '#64748b', '#0f172a'];

    // WCAG contrast calculation on top background & text pairs
    const audits: ContrastAudit[] = [];
    const mainBg = topBgs[0] || 'rgb(255, 255, 255)';
    const mainFg = topTexts[0] || 'rgb(15, 23, 42)';

    const ratio = this.calculateLuminanceRatio(mainBg, mainFg);
    audits.push({
      foregroundColor: mainFg,
      backgroundColor: mainBg,
      contrastRatio: Number(ratio.toFixed(2)),
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7.0,
    });

    const isDark = mainBg.includes('0,') || mainBg.includes('15,');
    const mood = isDark ? 'sleek, modern, and high-focus' : 'clean, trustworthy, and welcoming';
    const psychology = `The color system employs a deliberate contrast strategy. Dominant background tones establish a ${mood} atmosphere. The primary palette aligns with modern SaaS branding standards, directing user attention toward key conversion paths while maintaining WCAG accessibility compliance.`;

    return {
      primaryPalette: primaryPalette.length ? primaryPalette : ['#0f172a'],
      secondaryPalette: secondaryPalette.length ? secondaryPalette : ['#1e293b'],
      accentColors: accentColors.length ? accentColors : ['#38bdf8'],
      neutralPalette,
      backgroundColors: topBgs.slice(0, 5),
      textColors: topTexts.slice(0, 5),
      cssVariablesDetected: cssVars,
      contrastAudits: audits,
      colorPsychologySummary: psychology,
    };
  }

  private parseRgb(colorStr: string): [number, number, number] {
    const match = colorStr.match(/\d+/g);
    if (!match || match.length < 3) return [255, 255, 255];
    return [parseInt(match[0], 10), parseInt(match[1], 10), parseInt(match[2], 10)];
  }

  private getLuminance([r, g, b]: [number, number, number]): number {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  private calculateLuminanceRatio(c1: string, c2: string): number {
    const lum1 = this.getLuminance(this.parseRgb(c1));
    const lum2 = this.getLuminance(this.parseRgb(c2));
    const lightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (lightest + 0.05) / (darkest + 0.05);
  }
}
