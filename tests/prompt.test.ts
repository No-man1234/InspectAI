import { describe, it, expect } from 'vitest';
import { PromptGenerator } from '../src/ai/PromptGenerator';
import { HeuristicReportGenerator } from '../src/ai/HeuristicReportGenerator';

describe('PromptGenerator', () => {
  it('synthesizes structured consultant prompt containing payload data', () => {
    const gen = new PromptGenerator();
    const mockPayload = { url: 'https://stripe.com', domScore: 95 };
    const prompt = gen.buildConsultantPrompt(mockPayload, 'Focus on accessibility');

    expect(prompt).toContain('Staff-level Software Engineer');
    expect(prompt).toContain('https://stripe.com');
    expect(prompt).toContain('Focus on accessibility');
  });
});

describe('HeuristicReportGenerator', () => {
  it('generates complete executive report with scorecard even without API keys', async () => {
    const generator = new HeuristicReportGenerator();
    const report = await generator.generateInspectionReport('test prompt', {
      url: 'https://vercel.com',
      title: 'Vercel Platform',
      accessibilityAuditScore: 94,
      seoScore: 92,
    });

    expect(report.executiveSummary).toContain('Vercel Platform');
    expect(report.scorecard.accessibilityScore).toBe(94);
    expect(report.strengths.length).toBeGreaterThanOrEqual(3);
  });
});
