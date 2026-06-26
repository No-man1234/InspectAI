import { describe, it, expect } from 'vitest';
import { FrameworkDetector } from '../src/analysis/analyzers/FrameworkDetector';
import { ColorAnalyzer } from '../src/analysis/analyzers/ColorAnalyzer';
import { DomAnalyzer } from '../src/analysis/analyzers/DomAnalyzer';

describe('FrameworkDetector', () => {
  it('detects React and Next.js correctly from DOM markers and runtime signals', () => {
    const detector = new FrameworkDetector();
    const mockDoc = {
      documentElement: {
        outerHTML: '<div id="__next"><div data-reactroot>Hello</div></div>',
      },
      querySelector: (sel: string) => sel === '#__next' || sel === '[data-reactroot]',
    } as unknown as Document;

    const results = detector.analyze({
      doc: mockDoc,
      window: {} as Window,
      url: 'https://example.com',
      runtimeSignals: { React: true, 'Next.js': true },
    });

    expect(results.length).toBeGreaterThanOrEqual(2);
    const reactRes = results.find((r) => r.name === 'React');
    expect(reactRes?.confidenceScore).toBeGreaterThanOrEqual(90);
  });
});

describe('ColorAnalyzer', () => {
  it('calculates WCAG contrast audits and extracts primary palettes', () => {
    const analyzer = new ColorAnalyzer();
    const mockElements = [
      { style: { backgroundColor: 'rgb(15, 23, 42)', color: 'rgb(255, 255, 255)' } },
      { style: { backgroundColor: 'rgb(15, 23, 42)', color: 'rgb(56, 189, 248)' } },
    ];

    const mockDoc = {
      querySelectorAll: () => mockElements,
      documentElement: {},
    } as unknown as Document;

    const mockWin = {
      getComputedStyle: (el: any) => el.style || { length: 0 },
    } as unknown as Window;

    const result = analyzer.analyze({
      doc: mockDoc,
      window: mockWin,
      url: 'https://example.com',
    });

    expect(result.primaryPalette.length).toBeGreaterThan(0);
    expect(result.contrastAudits[0].wcagAA).toBe(true);
  });
});

describe('DomAnalyzer', () => {
  it('extracts heading hierarchy and computes complexity score', () => {
    const analyzer = new DomAnalyzer();
    const mockHeadings = [
      { tagName: 'H1', textContent: 'Main Hero Title', id: 'hero' },
      { tagName: 'H2', textContent: 'Sub Feature', className: 'feat' },
    ];

    const mockDoc = {
      getElementsByTagName: (tag: string) => (tag === '*' ? new Array(120) : tag === 'button' ? [1, 2] : []),
      querySelectorAll: (sel: string) => (sel.includes('h1') ? mockHeadings : []),
      body: { children: [] },
    } as unknown as Document;

    const res = analyzer.analyze({ doc: mockDoc, window: {} as Window, url: 'https://test.com' });
    expect(res.totalNodes).toBe(120);
    expect(res.headingHierarchy[0].text).toBe('Main Hero Title');
  });
});
