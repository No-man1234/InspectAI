/**
 * AI Website Inspector — Analyzer Interface
 * Clean architecture contract for decoupled website inspection modules.
 */

export interface AnalyzerContext {
  doc: Document;
  window: Window;
  url: string;
  normalizedDom?: Element;
  runtimeSignals?: Record<string, unknown>;
  computedStylesCache?: Map<Element, CSSStyleDeclaration>;
}

export interface IAnalyzer<TResult> {
  readonly name: string;
  readonly version: string;
  analyze(context: AnalyzerContext): Promise<TResult> | TResult;
}
