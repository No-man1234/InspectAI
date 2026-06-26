/**
 * AI Website Inspector — JS Framework & Library Detection Engine
 * Computes heuristic confidence scores based on DOM markers and runtime symbols.
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { FrameworkConfidence } from '../../shared/types';

interface TechRule {
  name: string;
  category: FrameworkConfidence['category'];
  domMarkers: string[];
  scriptRegex?: RegExp;
}

const TECH_RULES: TechRule[] = [
  { name: 'React', category: 'JS Framework', domMarkers: ['[data-reactroot]', '#_reactRootContainer'] },
  { name: 'Next.js', category: 'JS Framework', domMarkers: ['#__next', '[data-nextjs-scroll-focus-boundary]'] },
  { name: 'Vue', category: 'JS Framework', domMarkers: ['[data-v-]', '#app[data-v-app]'] },
  { name: 'Nuxt', category: 'JS Framework', domMarkers: ['#__nuxt'] },
  { name: 'Angular', category: 'JS Framework', domMarkers: ['[ng-version]', '[_nghost-]'] },
  { name: 'Svelte', category: 'JS Framework', domMarkers: ['[class*="svelte-"]'] },
  { name: 'Solid', category: 'JS Framework', domMarkers: ['[data-hk]'] },
  { name: 'Astro', category: 'JS Framework', domMarkers: ['astro-island', 'astro-root'] },
  { name: 'Remix', category: 'JS Framework', domMarkers: ['window.__remixContext', 'script[src*="@remix-run"]'] },
  { name: 'Qwik', category: 'JS Framework', domMarkers: ['[q\\:id]', 'script[type="qwik/json"]'] },
  { name: 'Tailwind CSS', category: 'CSS Architecture', domMarkers: ['.flex.flex-col', '.space-x-4', '.max-w-7xl'] },
  { name: 'Bootstrap', category: 'CSS Architecture', domMarkers: ['.container .row .col-md-6', '.btn.btn-primary'] },
  { name: 'shadcn/ui', category: 'UI Library', domMarkers: ['[data-radix-collection-item]', '[class*="bg-background"][class*="text-foreground"]'] },
  { name: 'Material UI', category: 'UI Library', domMarkers: ['[class*="MuiButton-root"]', '[class*="MuiPaper-root"]'] },
  { name: 'Chakra UI', category: 'UI Library', domMarkers: ['[class*="chakra-button"]'] },
  { name: 'Ant Design', category: 'UI Library', domMarkers: ['.ant-btn', '.ant-layout'] },
  { name: 'GSAP', category: 'Animation', domMarkers: ['[style*="translate3d"]'] },
  { name: 'Framer Motion', category: 'Animation', domMarkers: ['[style*="transform"][style*="opacity"]'] },
  { name: 'Three.js', category: 'Visualization', domMarkers: ['canvas[data-engine="three.js"]', 'canvas'] },
  { name: 'Chart.js', category: 'Visualization', domMarkers: ['canvas.chartjs-render-monitor'] },
  { name: 'D3.js', category: 'Visualization', domMarkers: ['svg g.axis', 'svg path.domain'] },
];

export class FrameworkDetector implements IAnalyzer<FrameworkConfidence[]> {
  readonly name = 'FrameworkDetector';
  readonly version = '1.0.0';

  public analyze({ doc, runtimeSignals }: AnalyzerContext): FrameworkConfidence[] {
    const results: FrameworkConfidence[] = [];
    const html = doc.documentElement.outerHTML.slice(0, 100000);

    // Check injected runtime signals (gathered by pageInspector script)
    const runtimeObj = runtimeSignals || {};

    TECH_RULES.forEach((rule) => {
      let score = 0;
      const markersFound: string[] = [];

      // Check runtime signals from window
      if (runtimeObj[rule.name]) {
        score = 98;
        markersFound.push(`window.${rule.name} symbol verified`);
      }

      // Check DOM markers
      for (const m of rule.domMarkers) {
        if (m.startsWith('.') || m.startsWith('#') || m.startsWith('[')) {
          try {
            if (doc.querySelector(m)) {
              score = Math.max(score, 90);
              markersFound.push(`DOM selector '${m}' matched`);
            }
          } catch {
            // Ignore syntax errors from custom attribute namespaces / non-standard pseudo selectors
            if (html.includes(m)) {
              score = Math.max(score, 85);
              markersFound.push(`HTML string signature '${m}' detected via fallback`);
            }
          }
        } else if (html.includes(m)) {
          score = Math.max(score, 85);
          markersFound.push(`HTML string signature '${m}' detected`);
        }
      }

      if (score > 30) {
        results.push({
          name: rule.name,
          category: rule.category,
          confidenceScore: score,
          detectionMarkers: markersFound,
        });
      }
    });

    // Sort descending by confidence
    return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }
}
