/**
 * AI Website Inspector — Shared Constants & Messaging Action Identifiers
 */

import { UserSettings, AnalysisStageId } from './types';

export const MSG_START_ANALYSIS = 'INSPECTOR_START_ANALYSIS';
export const MSG_PROGRESS_UPDATE = 'INSPECTOR_PROGRESS_UPDATE';
export const MSG_ANALYSIS_COMPLETE = 'INSPECTOR_ANALYSIS_COMPLETE';
export const MSG_ANALYSIS_ERROR = 'INSPECTOR_ANALYSIS_ERROR';
export const MSG_TOGGLE_OVERLAY = 'INSPECTOR_TOGGLE_OVERLAY';
export const MSG_HIGHLIGHT_SELECTOR = 'INSPECTOR_HIGHLIGHT_SELECTOR';
export const MSG_CAPTURE_TAB = 'INSPECTOR_CAPTURE_TAB';
export const MSG_GET_CACHED_REPORT = 'INSPECTOR_GET_CACHED_REPORT';
export const MSG_GENERATE_AI_REPORT = 'INSPECTOR_GENERATE_AI_REPORT';

export const DEFAULT_SETTINGS: UserSettings = {
  aiProvider: 'heuristic', // Defaults to deterministic heuristic report so zero setup is needed
  apiKey: '',
  selectedModel: 'gemini-3.1-pro',
  autoAnalyzeOnPopup: false,
  enableOverlay: true,
  darkMode: true,
};

export const STAGE_LABELS: Record<AnalysisStageId, string> = {
  COLLECT_RAW: '1/10 Collecting raw DOM & browser signals',
  NORMALIZE_DATA: '2/10 Normalizing layout & DOM structures',
  DETECT_COMPONENTS: '3/10 Detecting reusable UI components',
  EXTRACT_TOKENS: '4/10 Extracting design tokens system',
  CAPTURE_SCREENSHOT: '5/10 Capturing viewport visual aesthetic',
  ANALYZE_RUNTIME: '6/10 Profiling runtime animations & listeners',
  BUILD_JSON: '7/10 Compiling structured architectural payload',
  GENERATE_PROMPT: '8/10 Synthesizing AI Staff UX Consultant prompt',
  GENERATE_REPORT: '9/10 Generating deep AI architectural inspection',
  RENDER_REPORT: '10/10 Formatting scorecard & executive dashboard',
};

export const FRAMEWORK_MARKERS = {
  React: ['__REACT_DEVTOOLS_GLOBAL_HOOK__', '_reactRootContainer', 'data-reactroot'],
  Next: ['__NEXT_DATA__', '__NEXT_LOADED_PAGES__'],
  Vue: ['__VUE__', '__VUE_DEVTOOLS_GLOBAL_HOOK__'],
  Nuxt: ['__NUXT__', '$nuxt'],
  Angular: ['ng-version', 'getAllAngularRootElements'],
  Svelte: ['__svelte'],
  Solid: ['_$HY'],
  Astro: ['astro-island'],
  Tailwind: ['space-x-', 'flex-col', 'max-w-7xl', 'bg-slate-'],
  ThreeJS: ['THREE', '__THREE__'],
  GSAP: ['gsap', 'TweenMax'],
};
