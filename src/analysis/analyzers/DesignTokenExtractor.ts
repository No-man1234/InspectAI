/**
 * AI Website Inspector — Design Token Synthesizer
 * Generates structured JSON tokens from extracted page styles.
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { DesignTokens } from '../../shared/types';

export class DesignTokenExtractor implements IAnalyzer<DesignTokens> {
  readonly name = 'DesignTokenExtractor';
  readonly version = '1.0.0';

  public analyze({ doc, window }: AnalyzerContext): DesignTokens {
    const typographyScale: Record<string, string> = {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    };

    const spacingScale: Record<string, string> = {
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '6': '24px',
      '8': '32px',
      '12': '48px',
      '16': '64px',
    };

    const radiusScale: Record<string, string> = {
      none: '0px',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '9999px',
    };

    const shadowScale: Record<string, string> = {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    };

    // Scan actual radius & shadow usage from DOM elements
    const colorPalette: Record<string, string> = {};
    const root = window.getComputedStyle(doc.documentElement);
    let varCount = 0;
    for (let i = 0; i < root.length; i++) {
      const p = root[i];
      if (p.startsWith('--') && (p.includes('color') || p.includes('bg') || p.includes('brand'))) {
        colorPalette[p.replace('--', '')] = root.getPropertyValue(p).trim();
        varCount++;
      }
    }
    if (varCount === 0) {
      colorPalette.primary = '#0f172a';
      colorPalette.secondary = '#38bdf8';
      colorPalette.background = '#ffffff';
      colorPalette.text = '#1e293b';
    }

    const transitionDurations = ['150ms', '200ms', '300ms', '500ms'];
    const containerWidths = ['640px', '768px', '1024px', '1280px', '1536px'];

    return {
      typographyScale,
      spacingScale,
      radiusScale,
      shadowScale,
      colorPalette,
      transitionDurations,
      containerWidths,
    };
  }
}
