/**
 * AI Website Inspector — Domain Type Definitions
 * Strict TypeScript models for all analysis stages, AI reporting, and UI state.
 */

export type AnalysisStageId =
  | 'COLLECT_RAW'
  | 'NORMALIZE_DATA'
  | 'DETECT_COMPONENTS'
  | 'EXTRACT_TOKENS'
  | 'CAPTURE_SCREENSHOT'
  | 'ANALYZE_RUNTIME'
  | 'BUILD_JSON'
  | 'GENERATE_PROMPT'
  | 'GENERATE_REPORT'
  | 'RENDER_REPORT';

export interface PipelineStageProgress {
  stageId: AnalysisStageId;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progressPercentage: number;
  message?: string;
}

export interface DomMetrics {
  totalNodes: number;
  maxDepth: number;
  complexityScore: number; // 0 - 100
  headingHierarchy: Array<{ level: number; text: string; selector: string }>;
  semanticTagCounts: Record<string, number>;
  interactiveCounts: {
    buttons: number;
    links: number;
    inputs: number;
    forms: number;
    modals: number;
    dropdowns: number;
  };
  mediaCounts: {
    images: number;
    videos: number;
    svgs: number;
    canvases: number;
  };
  shadowDomRootsCount: number;
  webComponentsCount: number;
  iframesCount: number;
  hasInfiniteScroll: boolean;
  hasStickyElements: boolean;
  hasFixedElements: boolean;
}

export type DetectedComponentCategory =
  | 'Navigation'
  | 'Hero'
  | 'Feature'
  | 'Pricing'
  | 'FAQ'
  | 'Footer'
  | 'Sidebar'
  | 'CTA'
  | 'Media'
  | 'Data'
  | 'Form'
  | 'Feedback'
  | 'Utility';

export interface DetectedComponentInstance {
  id: string;
  name: string;
  category: DetectedComponentCategory;
  selector: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  estimatedInstances: number;
  dimensionsText: string;
  primaryColors: string[];
  typographySummary: string;
  aiExplanation?: string;
}

export interface LayoutAnalysisResult {
  flexboxUsageCount: number;
  gridUsageCount: number;
  maxContainerWidthPx: number;
  alignmentConsistencyScore: number; // 0 - 100
  spacingRhythmScore: number; // 0 - 100
  dominantFlowPattern: 'F-pattern' | 'Z-pattern' | 'Linear' | 'Complex / Modular';
  visualDensity: 'Spacious / Airy' | 'Balanced' | 'Dense / Data-heavy';
  responsiveBreakpointsDetected: string[];
}

export interface TypographyAnalysisResult {
  fontFamiliesDetected: string[];
  importedFontsUrls: string[];
  headingScaleRatio: number;
  baseFontSizePx: number;
  lineHeightConsistency: number; // 0 - 100
  readabilityScore: number; // 0 - 100
  typographySystemExplanation: string;
}

export interface ContrastAudit {
  foregroundColor: string;
  backgroundColor: string;
  contrastRatio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
}

export interface ColorAnalysisResult {
  primaryPalette: string[];
  secondaryPalette: string[];
  accentColors: string[];
  neutralPalette: string[];
  backgroundColors: string[];
  textColors: string[];
  cssVariablesDetected: Record<string, string>;
  contrastAudits: ContrastAudit[];
  colorPsychologySummary: string;
}

export interface DesignTokens {
  typographyScale: Record<string, string>;
  spacingScale: Record<string, string>;
  radiusScale: Record<string, string>;
  shadowScale: Record<string, string>;
  colorPalette: Record<string, string>;
  transitionDurations: string[];
  containerWidths: string[];
}

export interface CssAnalysisResult {
  detectedMethodology: string; // e.g., 'Tailwind CSS', 'CSS Modules', 'Styled Components', 'Vanilla CSS'
  hasAnimations: boolean;
  keyframesCount: number;
  usesBackdropFilter: boolean;
  usesBlendModes: boolean;
  maxSpecificityDetected: string;
}

export interface FrameworkConfidence {
  name: string;
  category: 'JS Framework' | 'UI Library' | 'Animation' | 'Visualization' | 'CSS Architecture';
  confidenceScore: number; // 0 - 100
  detectionMarkers: string[];
}

export interface AnimationAnalysisResult {
  hoverTransitionsCount: number;
  scrollAnimationsDetected: boolean;
  keyframeAnimationsDetected: string[];
  naturalLanguageExplanation: string;
}

export interface ScreenshotAnalysisResult {
  screenshotDataUrl?: string;
  inferredAesthetic: string; // e.g., 'Minimalism', 'Glassmorphism', 'Corporate Startup', 'Brutalism'
  targetAudienceInference: string;
  brandPersonality: string[];
}

export interface AccessibilityAuditResult {
  overallScore: number; // 0 - 100
  ariaLandmarksCount: number;
  missingAltImagesCount: number;
  missingFormLabelsCount: number;
  keyboardNavigable: boolean;
  violationsSummary: string[];
  recommendations: string[];
}

export interface SeoAuditResult {
  title: string;
  description: string;
  canonicalUrl?: string;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasStructuredData: boolean;
  h1Count: number;
  seoHealthScore: number; // 0 - 100
}

export interface PerformanceEstimates {
  estimatedDomBloatScore: number; // 0 - 100 (100 = leanest)
  heavyMediaDetectedCount: number;
  lazyLoadEnabled: boolean;
  potentialBottlenecks: string[];
}

export interface ComponentTreeNode {
  id: string;
  name: string;
  category: string;
  selector: string;
  children?: ComponentTreeNode[];
  instanceCount: number;
}

export interface Scorecard {
  professionalismScore: number; // 0 - 100
  accessibilityScore: number;
  performanceScore: number;
  modernUiScore: number;
  maintainabilityScore: number;
  overallScore: number;
}

export interface AIReportSummary {
  executiveSummary: string;
  websiteOverview: string;
  designPhilosophy: string;
  targetAudience: string;
  brandPersonalitySummary: string;
  visualHierarchyAnalysis: string;
  informationArchitectureSummary: string;
  layoutExplanation: string;
  typographyExplanation: string;
  colorExplanation: string;
  responsiveDesignNotes: string;
  componentHighlights: Array<{ componentName: string; explanation: string }>;
  animationExplanation: string;
  techStackSummary: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  scorecard: Scorecard;
}

export interface CompleteInspectionResult {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  domMetrics: DomMetrics;
  detectedComponents: DetectedComponentInstance[];
  layoutAnalysis: LayoutAnalysisResult;
  typographyAnalysis: TypographyAnalysisResult;
  colorAnalysis: ColorAnalysisResult;
  designTokens: DesignTokens;
  cssAnalysis: CssAnalysisResult;
  frameworksDetected: FrameworkConfidence[];
  animationAnalysis: AnimationAnalysisResult;
  screenshotAnalysis: ScreenshotAnalysisResult;
  accessibilityAudit: AccessibilityAuditResult;
  seoAudit: SeoAuditResult;
  performanceEstimates: PerformanceEstimates;
  componentTree: ComponentTreeNode[];
  aiReport: AIReportSummary;
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'heuristic';

export interface UserSettings {
  aiProvider: AIProvider;
  apiKey: string;
  selectedModel: string;
  customPersonaPrompt?: string;
  autoAnalyzeOnPopup: boolean;
  enableOverlay: boolean;
  darkMode: boolean;
}
