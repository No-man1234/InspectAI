/**
 * AI Website Inspector — Multi-Stage Analysis Pipeline Orchestrator
 * Executes all 10 inspection stages asynchronously with non-blocking UI callbacks.
 */

import { CompleteInspectionResult, PipelineStageProgress, AnalysisStageId } from '../shared/types';
import { STAGE_LABELS } from '../shared/constants';
import { DomAnalyzer } from './analyzers/DomAnalyzer';
import { ComponentDetector } from './analyzers/ComponentDetector';
import { LayoutAnalyzer } from './analyzers/LayoutAnalyzer';
import { TypographyAnalyzer } from './analyzers/TypographyAnalyzer';
import { ColorAnalyzer } from './analyzers/ColorAnalyzer';
import { DesignTokenExtractor } from './analyzers/DesignTokenExtractor';
import { CssAnalyzer } from './analyzers/CssAnalyzer';
import { FrameworkDetector } from './analyzers/FrameworkDetector';
import { AnimationAnalyzer } from './analyzers/AnimationAnalyzer';
import { AccessibilityAnalyzer } from './analyzers/AccessibilityAnalyzer';
import { SeoAnalyzer } from './analyzers/SeoAnalyzer';
import { PerformanceAnalyzer } from './analyzers/PerformanceAnalyzer';
import { ComponentTreeGenerator } from './analyzers/ComponentTreeGenerator';
import { aiClientFactory } from '../ai/AIClientFactory';
import { promptGenerator } from '../ai/PromptGenerator';

export type ProgressCallback = (progress: PipelineStageProgress) => void;

export class PipelineOrchestrator {
  private domAnalyzer = new DomAnalyzer();
  private compDetector = new ComponentDetector();
  private layoutAnalyzer = new LayoutAnalyzer();
  private typoAnalyzer = new TypographyAnalyzer();
  private colorAnalyzer = new ColorAnalyzer();
  private tokenExtractor = new DesignTokenExtractor();
  private cssAnalyzer = new CssAnalyzer();
  private frameworkDetector = new FrameworkDetector();
  private animAnalyzer = new AnimationAnalyzer();
  private a11yAnalyzer = new AccessibilityAnalyzer();
  private seoAnalyzer = new SeoAnalyzer();
  private perfAnalyzer = new PerformanceAnalyzer();
  private treeGenerator = new ComponentTreeGenerator();

  public async runPipeline(
    doc: Document,
    window: Window,
    url: string,
    screenshotDataUrl?: string,
    runtimeSignals?: Record<string, unknown>,
    onProgress?: ProgressCallback
  ): Promise<CompleteInspectionResult> {
    const reportProgress = (stageId: AnalysisStageId, pct: number, status: PipelineStageProgress['status'] = 'active', msg?: string) => {
      if (onProgress) {
        onProgress({
          stageId,
          label: STAGE_LABELS[stageId] || stageId,
          status,
          progressPercentage: pct,
          message: msg,
        });
      }
    };

    const yieldThread = () => new Promise<void>((resolve) => setTimeout(resolve, 10));

    // Stage 1: Collect Raw Data
    reportProgress('COLLECT_RAW', 10);
    const context = { doc, window, url, runtimeSignals };
    await yieldThread();

    // Stage 2: Normalize Data
    reportProgress('NORMALIZE_DATA', 20);
    const domMetrics = this.domAnalyzer.analyze(context);
    await yieldThread();

    // Stage 3: Detect Reusable Components
    reportProgress('DETECT_COMPONENTS', 30);
    const detectedComponents = this.compDetector.analyze(context);
    await yieldThread();

    // Stage 4: Extract Design System
    reportProgress('EXTRACT_TOKENS', 40);
    const layoutAnalysis = this.layoutAnalyzer.analyze(context);
    const typographyAnalysis = this.typoAnalyzer.analyze(context);
    const colorAnalysis = this.colorAnalyzer.analyze(context);
    const designTokens = this.tokenExtractor.analyze(context);
    const cssAnalysis = this.cssAnalyzer.analyze(context);
    await yieldThread();

    // Stage 5: Capture Screenshot Aesthetics
    reportProgress('CAPTURE_SCREENSHOT', 50);
    const screenshotAnalysis = {
      screenshotDataUrl,
      inferredAesthetic: colorAnalysis.primaryPalette[0]?.includes('0,') ? 'Sleek Dark Mode SaaS' : 'Clean Minimalist Corporate',
      targetAudienceInference: 'Founders, Developers, and Product Designers',
      brandPersonality: ['Innovative', 'Professional', 'Structured'],
    };
    await yieldThread();

    // Stage 6: Analyze Runtime Behavior
    reportProgress('ANALYZE_RUNTIME', 60);
    const frameworksDetected = this.frameworkDetector.analyze(context);
    const animationAnalysis = this.animAnalyzer.analyze(context);
    const accessibilityAudit = this.a11yAnalyzer.analyze(context);
    const seoAudit = this.seoAnalyzer.analyze(context);
    const performanceEstimates = this.perfAnalyzer.analyze(context);
    await yieldThread();

    // Stage 7: Build Structured JSON
    reportProgress('BUILD_JSON', 70);
    const componentTree = this.treeGenerator.analyze(context, detectedComponents);
    await yieldThread();

    // Stage 8: Generate AI Prompt
    reportProgress('GENERATE_PROMPT', 80);
    const payloadForAI = {
      url,
      title: doc.title,
      domMetrics,
      detectedComponentsCount: detectedComponents.length,
      layoutAnalysis,
      typographyAnalysis,
      colorAnalysis,
      frameworksDetected,
      accessibilityAuditScore: accessibilityAudit.overallScore,
      seoScore: seoAudit.seoHealthScore,
      performanceBloatScore: performanceEstimates.estimatedDomBloatScore,
    };
    const prompt = promptGenerator.buildConsultantPrompt(payloadForAI);
    await yieldThread();

    // Stage 9: Generate AI Report
    reportProgress('GENERATE_REPORT', 90);
    const aiClient = await aiClientFactory.getClient();
    const aiReport = await aiClient.generateInspectionReport(prompt, payloadForAI);
    await yieldThread();

    // Stage 10: Render Report Payload
    reportProgress('RENDER_REPORT', 100, 'completed', 'Inspection successfully generated.');

    return {
      id: `report-${Date.now()}`,
      url,
      title: doc.title || url,
      timestamp: Date.now(),
      domMetrics,
      detectedComponents,
      layoutAnalysis,
      typographyAnalysis,
      colorAnalysis,
      designTokens,
      cssAnalysis,
      frameworksDetected,
      animationAnalysis,
      screenshotAnalysis,
      accessibilityAudit,
      seoAudit,
      performanceEstimates,
      componentTree,
      aiReport,
    };
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
