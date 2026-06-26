/**
 * AI Website Inspector — Search Engine Optimization (SEO) & Meta Tag Auditor
 */

import { IAnalyzer, AnalyzerContext } from '../IAnalyzer';
import { SeoAuditResult } from '../../shared/types';

export class SeoAnalyzer implements IAnalyzer<SeoAuditResult> {
  readonly name = 'SeoAnalyzer';
  readonly version = '1.0.0';

  public analyze({ doc }: AnalyzerContext): SeoAuditResult {
    const title = doc.title || '';
    const descMeta = doc.querySelector('meta[name="description"]');
    const description = descMeta ? descMeta.getAttribute('content') || '' : '';
    const canonicalLink = doc.querySelector('link[rel="canonical"]');
    const canonicalUrl = canonicalLink ? canonicalLink.getAttribute('href') || undefined : undefined;

    const hasOg = doc.querySelectorAll('meta[property^="og:"]').length >= 2;
    const hasTwitter = doc.querySelectorAll('meta[name^="twitter:"]').length >= 2;
    const hasLdJson = doc.querySelectorAll('script[type="application/ld+json"]').length > 0;
    const h1Count = doc.getElementsByTagName('h1').length;

    let score = 100;
    if (!title || title.length < 10) score -= 20;
    if (!description || description.length < 30) score -= 25;
    if (h1Count === 0) score -= 15;
    if (h1Count > 1) score -= 10;
    if (!hasOg) score -= 15;
    if (!hasStructuredData(doc)) score -= 10;

    return {
      title: title.slice(0, 100) || '[Missing Title]',
      description: description.slice(0, 200) || '[Missing Description Meta]',
      canonicalUrl,
      hasOpenGraph: hasOg,
      hasTwitterCard: hasTwitter,
      hasStructuredData: hasLdJson || hasStructuredData(doc),
      h1Count,
      seoHealthScore: Math.max(0, score),
    };
  }
}

function hasStructuredData(doc: Document): boolean {
  return doc.querySelectorAll('[itemscope]').length > 0;
}
