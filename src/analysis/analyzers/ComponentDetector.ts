/**
 * AI Website Inspector — UI Component Pattern Detector
 * Identifies 30+ SaaS UI patterns and calculates instance metrics.
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { DetectedComponentInstance, DetectedComponentCategory } from '../../shared/types';

interface PatternDefinition {
  name: string;
  category: DetectedComponentCategory;
  selectors: string[];
  explanation: string;
}

const UI_PATTERNS: PatternDefinition[] = [
  {
    name: 'Navbar',
    category: 'Navigation',
    selectors: ['header nav', 'nav', '[role="navigation"]', '.navbar', '#navbar'],
    explanation: 'Primary site navigation establishing global wayfinding and brand orientation.',
  },
  {
    name: 'Hero Section',
    category: 'Hero',
    selectors: ['section.hero', '.hero', 'main > section:first-of-type', '[class*="hero"]'],
    explanation: 'Above-the-fold value proposition designed to capture immediate user attention and drive primary CTA conversion.',
  },
  {
    name: 'Feature Card',
    category: 'Feature',
    selectors: ['.feature-card', '[class*="feature"]', 'section [class*="card"]'],
    explanation: 'Modular content block highlighting key product capabilities with structured typography and icons.',
  },
  {
    name: 'Pricing Card',
    category: 'Pricing',
    selectors: ['.pricing-card', '[class*="pricing"] > div', '[class*="plan"]'],
    explanation: 'Tiered subscription comparison layout optimized for decision-making and conversion.',
  },
  {
    name: 'FAQ Accordion',
    category: 'FAQ',
    selectors: ['details', '[class*="faq"]', '[role="region"][aria-labelledby*="accordion"]', '.accordion'],
    explanation: 'Progressive disclosure widget reducing visual clutter while addressing buyer objections.',
  },
  {
    name: 'Footer',
    category: 'Footer',
    selectors: ['footer', '#footer', '.footer'],
    explanation: 'Secondary site directory containing legal links, secondary sitemap, and copyright notices.',
  },
  {
    name: 'Sidebar',
    category: 'Sidebar',
    selectors: ['aside', '[role="complementary"]', '.sidebar', '#sidebar'],
    explanation: 'Lateral container for contextual navigation, filtering, or supplementary actions.',
  },
  {
    name: 'Call to Action (CTA)',
    category: 'CTA',
    selectors: ['.cta', '[class*="cta-section"]', 'section[class*="banner"]'],
    explanation: 'High-contrast conversion container encouraging newsletter signup or trial initiation.',
  },
  {
    name: 'Testimonial',
    category: 'Feedback',
    selectors: ['blockquote', '[class*="testimonial"]', '[class*="review"]'],
    explanation: 'Social proof artifact establishing trust and validating product efficacy through customer quotes.',
  },
  {
    name: 'Product Card',
    category: 'Data',
    selectors: ['[class*="product-card"]', '[itemtype*="Product"]'],
    explanation: 'E-commerce item summary displaying pricing, imagery, and quick purchase actions.',
  },
  {
    name: 'Blog Card',
    category: 'Media',
    selectors: ['article', '[class*="post-card"]', '[class*="blog-card"]'],
    explanation: 'Editorial preview card organizing publication title, excerpt, and author metadata.',
  },
  {
    name: 'Modal Dialog',
    category: 'Feedback',
    selectors: ['dialog', '[role="dialog"]', '.modal'],
    explanation: 'Focus-trapping overlay interrupting workflow for critical decisions or focused inputs.',
  },
  {
    name: 'Toast Notification',
    category: 'Feedback',
    selectors: ['[role="status"]', '[role="alert"]', '.toast', '[class*="toast"]'],
    explanation: 'Transient feedback popup alerting users of background system events or state mutations.',
  },
  {
    name: 'Search Bar',
    category: 'Form',
    selectors: ['input[type="search"]', '[role="search"]', '.search-bar'],
    explanation: 'Direct information retrieval input enabling rapid content filtering.',
  },
  {
    name: 'Authentication Form',
    category: 'Form',
    selectors: ['form[action*="login"]', 'form[action*="signin"]', 'form[action*="signup"]', '[class*="auth-form"]'],
    explanation: 'Security gateway capturing user credentials for identity verification or onboarding.',
  },
  {
    name: 'Data Table',
    category: 'Data',
    selectors: ['table', '[role="table"]', '.data-table'],
    explanation: 'Multi-column grid structuring dense records for analytical scanning and sorting.',
  },
  {
    name: 'Chart / Graph',
    category: 'Data',
    selectors: ['canvas', 'svg[class*="chart"]', '.recharts-wrapper', '.apexcharts-canvas'],
    explanation: 'Quantitative data visualization synthesizing complex metrics into scannable visual patterns.',
  },
  {
    name: 'Pagination',
    category: 'Navigation',
    selectors: ['[role="navigation"][aria-label*="pagination"]', '.pagination', '[class*="pager"]'],
    explanation: 'Record set splitter allowing manageable chunking of large content archives.',
  },
  {
    name: 'Breadcrumbs',
    category: 'Navigation',
    selectors: ['[aria-label="Breadcrumb"]', '.breadcrumb', 'ol[itemtype*="BreadcrumbList"]'],
    explanation: 'Hierarchical trail showing exact location depth within the site architecture.',
  },
  {
    name: 'Tabs',
    category: 'Navigation',
    selectors: ['[role="tablist"]', '.tabs', '[class*="tab-list"]'],
    explanation: 'Context-switching interface allowing parallel views within the same viewport real estate.',
  },
  {
    name: 'Carousel / Slider',
    category: 'Media',
    selectors: ['.swiper', '.slick-slider', '[class*="carousel"]', '[role="region"][aria-roledescription="carousel"]'],
    explanation: 'Horizontal scrolling showcase maximizing content display in constrained vertical space.',
  },
  {
    name: 'Statistics Card',
    category: 'Data',
    selectors: ['[class*="stat"]', '[class*="metric"]', '[class*="kpi"]'],
    explanation: 'Dashboard metric indicator highlighting key performance indicators with large typography.',
  },
  {
    name: 'Badge / Chip',
    category: 'Utility',
    selectors: ['.badge', '.chip', '[class*="badge"]', '[class*="tag"]'],
    explanation: 'Compact status descriptor or categorical filter token.',
  },
];

export class ComponentDetector implements IAnalyzer<DetectedComponentInstance[]> {
  readonly name = 'ComponentDetector';
  readonly version = '1.0.0';

  public analyze({ doc }: AnalyzerContext): DetectedComponentInstance[] {
    const detected: DetectedComponentInstance[] = [];
    const seenElements = new Set<Element>();

    UI_PATTERNS.forEach((pattern) => {
      for (const selector of pattern.selectors) {
        try {
          const elements = doc.querySelectorAll(selector);
          if (elements.length > 0) {
            const first = elements[0];
            if (seenElements.has(first)) continue;
            seenElements.add(first);

            const rect = first.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;

            // Estimate instances count
            const instanceCount = elements.length;

            // Extract typography summary
            const computed = window.getComputedStyle(first);
            const font = `${computed.fontFamily.split(',')[0]} (${computed.fontSize} / ${computed.fontWeight})`;

            detected.push({
              id: `comp-${detected.length + 1}`,
              name: pattern.name,
              category: pattern.category,
              selector: this.getCleanSelector(first),
              boundingBox: {
                x: Math.round(rect.left + window.scrollX),
                y: Math.round(rect.top + window.scrollY),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              },
              estimatedInstances: instanceCount,
              dimensionsText: `${Math.round(rect.width)} × ${Math.round(rect.height)} px`,
              primaryColors: [computed.backgroundColor, computed.color].filter((c) => c !== 'rgba(0, 0, 0, 0)'),
              typographySummary: font,
              aiExplanation: pattern.explanation,
            });
            break; // found this pattern category
          }
        } catch {
          // invalid selector syntax in certain browsers
        }
      }
    });

    return detected;
  }

  private getCleanSelector(el: Element): string {
    if (el.id) return `#${el.id}`;
    const tag = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const cls = el.className.split(/\s+/).filter((c) => c && !c.includes(':'))[0];
      if (cls) return `${tag}.${cls}`;
    }
    return tag;
  }
}
