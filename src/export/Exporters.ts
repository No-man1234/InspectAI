/**
 * AI Website Inspector — Export Engines Suite
 * Generates downloadable blobs for Markdown, JSON, HTML reports, and Design Tokens.
 */

import { CompleteInspectionResult } from '../shared/types';

export class Exporters {
  public static downloadBlob(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public static exportJson(report: CompleteInspectionResult): void {
    const cleanName = report.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    this.downloadBlob(JSON.stringify(report, null, 2), `${cleanName}_inspection.json`, 'application/json');
  }

  public static exportTokensJson(report: CompleteInspectionResult): void {
    const cleanName = report.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    this.downloadBlob(JSON.stringify(report.designTokens, null, 2), `${cleanName}_design_tokens.json`, 'application/json');
  }

  public static exportComponentTreeJson(report: CompleteInspectionResult): void {
    const cleanName = report.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    this.downloadBlob(JSON.stringify(report.componentTree, null, 2), `${cleanName}_component_tree.json`, 'application/json');
  }

  public static generateMarkdown(report: CompleteInspectionResult): string {
    const { aiReport, domMetrics, layoutAnalysis, frameworksDetected } = report;
    const topTech = frameworksDetected.map((f) => `${f.name} (${f.confidenceScore}%)`).join(', ') || 'Standard DOM';

    return `
# AI Website Inspector — Executive Architectural Report

**Target URL**: [${report.url}](${report.url})  
**Title**: ${report.title}  
**Date**: ${new Date(report.timestamp).toLocaleString()}  
**Overall Quality Score**: ${aiReport.scorecard.overallScore}/100

---

## Executive Summary

${aiReport.executiveSummary}

## Website Overview & Intent

${aiReport.websiteOverview}

## Design Philosophy & Aesthetics

${aiReport.designPhilosophy}

## Target Audience & Brand Voice

- **Target Demographic**: ${aiReport.targetAudience}
- **Brand Personality**: ${aiReport.brandPersonalitySummary}

---

## Scorecard Audit

| Metric Area | Score (0-100) |
| :--- | :---: |
| **Professionalism** | ${aiReport.scorecard.professionalismScore} |
| **Accessibility (a11y)** | ${aiReport.scorecard.accessibilityScore} |
| **Runtime Performance** | ${aiReport.scorecard.performanceScore} |
| **Modern UI Polish** | ${aiReport.scorecard.modernUiScore} |
| **Code Maintainability** | ${aiReport.scorecard.maintainabilityScore} |
| **Overall Weighted Score** | **${aiReport.scorecard.overallScore}** |

---

## Architecture & Layout Analysis

- **Dominant Flow Pattern**: ${layoutAnalysis.dominantFlowPattern}
- **Visual Density**: ${layoutAnalysis.visualDensity}
- **Max Container Width**: ${layoutAnalysis.maxContainerWidthPx}px
- **DOM Footprint**: ${domMetrics.totalNodes} total nodes (Max Depth: ${domMetrics.maxDepth})
- **Detected Tech Stack**: ${topTech}

### Layout Breakdown
${aiReport.layoutExplanation}

### Typography Architecture
${aiReport.typographyExplanation}

### Color Psychology & Tokens
${aiReport.colorExplanation}

---

## Component Intent Highlights

${aiReport.componentHighlights.map((c) => `### ${c.componentName}\n${c.explanation}`).join('\n\n')}

---

## Key Strengths

${aiReport.strengths.map((s) => `- ✅ ${s}`).join('\n')}

## Friction Areas & Technical Debt

${aiReport.weaknesses.map((w) => `- ⚠️ ${w}`).join('\n')}

## High-Impact Improvement Suggestions

${aiReport.improvementSuggestions.map((rec, idx) => `${idx + 1}. 💡 ${rec}`).join('\n')}
`.trim();
  }

  public static exportMarkdown(report: CompleteInspectionResult): void {
    const cleanName = report.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    this.downloadBlob(this.generateMarkdown(report), `${cleanName}_report.md`, 'text/markdown');
  }

  public static exportHtmlReport(report: CompleteInspectionResult): void {
    const md = this.generateMarkdown(report);
    const cleanName = report.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${report.title} — AI Architectural Audit</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 850px; margin: 40px auto; padding: 20px; color: #1e293b; background: #f8fafc; }
    h1 { color: #0f172a; border-bottom: 2px solid #38bdf8; padding-bottom: 10px; }
    h2 { color: #0f172a; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th, td { padding: 12px 16px; border: 1px solid #cbd5e1; text-align: left; }
    th { background: #0f172a; color: white; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
    @media print { body { background: white; margin: 0; max-width: 100%; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:20px;">
    <button onclick="window.print()" style="background:#0f172a;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:600;">Print / Export PDF</button>
  </div>
  <div class="card">
    <pre style="white-space: pre-wrap; font-family: inherit;">${md}</pre>
  </div>
</body>
</html>
    `.trim();

    this.downloadBlob(html, `${cleanName}_audit_report.html`, 'text/html');
  }
}
