/**
 * AI Website Inspector — DOM Structure & Hierarchy Analyzer
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { DomMetrics } from '../../shared/types';

export class DomAnalyzer implements IAnalyzer<DomMetrics> {
  readonly name = 'DomAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc }: AnalyzerContext): DomMetrics {
    const allElements = doc.getElementsByTagName('*');
    const totalNodes = allElements.length;

    // Calculate maximum DOM depth
    let maxDepth = 0;
    const computeDepth = (node: Element, depth: number) => {
      if (depth > maxDepth) maxDepth = depth;
      const children = node.children;
      for (let i = 0; i < children.length; i++) {
        computeDepth(children[i], depth + 1);
      }
    };
    if (doc.body) {
      computeDepth(doc.body, 1);
    }

    // Complexity score heuristic (based on total nodes & depth)
    const complexityScore = Math.min(100, Math.round((totalNodes / 20) + (maxDepth * 2)));

    // Extract Heading Hierarchy
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingHierarchy = Array.from(headings).map((h) => ({
      level: parseInt(h.tagName.substring(1), 10),
      text: h.textContent?.trim().slice(0, 80) || '[Empty Heading]',
      selector: this.getUniqueSelector(h),
    }));

    // Semantic tag counts
    const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'form', 'table', 'ul', 'ol', 'dialog'];
    const semanticTagCounts: Record<string, number> = {};
    semanticTags.forEach((tag) => {
      semanticTagCounts[tag] = doc.getElementsByTagName(tag).length;
    });

    // Interactive Element Counts
    const buttons = doc.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]').length;
    const links = doc.querySelectorAll('a[href]').length;
    const inputs = doc.querySelectorAll('input:not([type="hidden"]), textarea, select').length;
    const forms = doc.getElementsByTagName('form').length;
    const modals = doc.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog, .modal, [class*="modal"]').length;
    const dropdowns = doc.querySelectorAll('[role="menu"], select, [aria-haspopup="true"], [class*="dropdown"]').length;

    // Media counts
    const images = doc.getElementsByTagName('img').length;
    const videos = doc.getElementsByTagName('video').length;
    const svgs = doc.getElementsByTagName('svg').length;
    const canvases = doc.getElementsByTagName('canvas').length;
    const iframesCount = doc.getElementsByTagName('iframe').length;

    // Shadow DOM roots count estimation
    let shadowDomRootsCount = 0;
    let webComponentsCount = 0;
    for (let i = 0; i < Math.min(allElements.length, 1000); i++) {
      const el = allElements[i];
      if (el.shadowRoot) shadowDomRootsCount++;
      if (el.tagName.includes('-')) webComponentsCount++;
    }

    // Sticky / Fixed / Infinite Scroll checks
    let hasStickyElements = false;
    let hasFixedElements = false;
    const sampleSize = Math.min(allElements.length, 250);
    for (let i = 0; i < sampleSize; i++) {
      const el = allElements[i];
      const style = window.getComputedStyle(el);
      if (style.position === 'sticky') hasStickyElements = true;
      if (style.position === 'fixed') hasFixedElements = true;
    }

    // Infinite scroll detection heuristic
    const hasInfiniteScroll =
      doc.body &&
      (doc.body.scrollHeight > window.innerHeight * 4) &&
      Array.from(doc.querySelectorAll('*')).some((el) =>
        el.className && typeof el.className === 'string' && el.className.toLowerCase().includes('infinite')
      );

    return {
      totalNodes,
      maxDepth,
      complexityScore,
      headingHierarchy,
      semanticTagCounts,
      interactiveCounts: { buttons, links, inputs, forms, modals, dropdowns },
      mediaCounts: { images, videos, svgs, canvases },
      shadowDomRootsCount,
      webComponentsCount,
      iframesCount,
      hasInfiniteScroll: Boolean(hasInfiniteScroll),
      hasStickyElements,
      hasFixedElements,
    };
  }

  private getUniqueSelector(el: Element): string {
    if (el.id) return `#${el.id}`;
    let path = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const firstClass = el.className.split(/\s+/).filter(Boolean)[0];
      if (firstClass) path += `.${firstClass}`;
    }
    return path;
  }
}
