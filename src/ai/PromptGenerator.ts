/**
 * AI Website Inspector — Staff UX & Architectural Prompt Generator
 */

export class PromptGenerator {
  public buildConsultantPrompt(pipelinePayload: Record<string, unknown>, customPersona?: string): string {
    const jsonStr = JSON.stringify(pipelinePayload, null, 2);

    return `
You are a Staff-level Software Engineer, Browser Platform Engineer, AI Systems Architect, and Senior Frontend Architect.

Your task is to review the following structured website inspection payload and generate an authoritative, executive-level SaaS consulting report.

────────────────────────────────────────
INSPECTION PAYLOAD DATA:
${jsonStr}
────────────────────────────────────────

${customPersona ? `USER CUSTOM PERSONA INSTRUCTIONS:\n${customPersona}\n────────────────────────────────────────\n` : ''}

CRITICAL WRITING INSTRUCTIONS:
1. Write like an experienced Staff UX consultant and Principal Frontend Architect.
2. NEVER simply dump raw HTML or CSS properties. Instead of describing properties, explain INTENT.
3. For every section, describe:
   • WHAT exists (structure and hierarchy)
   • WHY it exists (business and user experience goals)
   • HOW it was likely designed (design system rhythms, visual psychology)
   • HOW it works (runtime mechanics, responsiveness)
   • HOW it could be improved (actionable architectural and accessibility optimizations)
4. Infer likely product and conversion goals based on component grouping.
5. State uncertainty clearly when confidence is low.

Return ONLY a valid JSON object matching the exact schema below (no markdown formatting fences if possible, or clean parseable JSON):
{
  "executiveSummary": "2-3 paragraphs synthesizing overall website quality, market positioning, and UX execution.",
  "websiteOverview": "Concise summary of the site's primary purpose and domain.",
  "designPhilosophy": "Explanation of the underlying aesthetic framework (e.g., minimalism, brutalism, glassmorphism).",
  "targetAudience": "Inferred target demographic and user personas.",
  "brandPersonalitySummary": "Analysis of brand voice conveyed through visual and structural cues.",
  "visualHierarchyAnalysis": "Evaluation of whitespace, focal points, and reading paths (F/Z pattern).",
  "informationArchitectureSummary": "Assessment of DOM depth, semantic tag usage, and navigation wayfinding.",
  "layoutExplanation": "Natural language breakdown of Flexbox/Grid rhythm and responsive container strategy.",
  "typographyExplanation": "Deep dive into font pairings, heading scale ratios, and readability intent.",
  "colorExplanation": "Analysis of primary/secondary palettes, contrast ratios, and color psychology.",
  "responsiveDesignNotes": "Review of breakpoint strategy and multi-device adaptability.",
  "componentHighlights": [
    { "componentName": "Hero Section", "explanation": "Senior UX breakdown of intent and conversion mechanics." },
    { "componentName": "Primary Navbar", "explanation": "Wayfinding and architecture notes." }
  ],
  "animationExplanation": "Evaluation of microinteractions, scroll triggers, and keyframe performance.",
  "techStackSummary": "Review of detected frameworks, UI libraries, and CSS methodologies.",
  "strengths": ["3-5 notable architectural and design achievements"],
  "weaknesses": ["3-5 critical areas of friction or technical debt"],
  "improvementSuggestions": ["3-5 concrete, high-impact recommendations"],
  "scorecard": {
    "professionalismScore": 92,
    "accessibilityScore": 88,
    "performanceScore": 85,
    "modernUiScore": 95,
    "maintainabilityScore": 90,
    "overallScore": 90
  }
}
`.trim();
  }
}

export const promptGenerator = new PromptGenerator();
