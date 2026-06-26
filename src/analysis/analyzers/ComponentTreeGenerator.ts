/**
 * AI Website Inspector — Visual Component Tree Generator
 * Constructs a hierarchical tree of UI elements for collapsible DevTools inspection.
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { ComponentTreeNode, DetectedComponentInstance } from '../../shared/types';

export class ComponentTreeGenerator implements IAnalyzer<ComponentTreeNode[]> {
  readonly name = 'ComponentTreeGenerator';
  readonly version = '1.0.0';

  public analyze({ doc }: AnalyzerContext, detectedComponents?: DetectedComponentInstance[]): ComponentTreeNode[] {
    // If we have detected components, build a clean structural outline
    if (detectedComponents && detectedComponents.length > 0) {
      return detectedComponents.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        selector: c.selector,
        instanceCount: c.estimatedInstances,
        children: this.findSubcomponents(doc, c.selector),
      }));
    }

    // Default heuristic tree if none passed
    const tree: ComponentTreeNode[] = [];
    const mainSections = doc.querySelectorAll('header, nav, main > section, article, aside, footer');

    mainSections.forEach((sec, idx) => {
      const tag = sec.tagName.toLowerCase();
      let name = tag.charAt(0).toUpperCase() + tag.slice(1);
      if (sec.id) name += ` (#${sec.id})`;
      else if (sec.className && typeof sec.className === 'string') {
        const cls = sec.className.split(/\s+/)[0];
        if (cls) name += ` (.${cls})`;
      }

      tree.push({
        id: `tree-node-${idx + 1}`,
        name,
        category: tag === 'header' || tag === 'nav' ? 'Navigation' : tag === 'footer' ? 'Footer' : 'Feature Area',
        selector: sec.id ? `#${sec.id}` : tag,
        instanceCount: 1,
        children: [],
      });
    });

    return tree;
  }

  private findSubcomponents(doc: Document, parentSelector: string): ComponentTreeNode[] {
    try {
      const parent = doc.querySelector(parentSelector);
      if (!parent) return [];
      const interactives = parent.querySelectorAll('button, a, input, [class*="card"]');
      const subs: ComponentTreeNode[] = [];
      const limit = Math.min(interactives.length, 5);
      for (let i = 0; i < limit; i++) {
        const sub = interactives[i];
        const tag = sub.tagName.toLowerCase();
        subs.push({
          id: `${parentSelector}-sub-${i}`,
          name: sub.textContent?.trim().slice(0, 20) || tag,
          category: tag === 'button' || tag === 'a' ? 'Action' : 'Input / Element',
          selector: tag,
          instanceCount: 1,
        });
      }
      return subs;
    } catch {
      return [];
    }
  }
}
