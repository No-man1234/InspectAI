/**
 * AI Website Inspector — Google Gemini REST API Client
 */

import { IAIClient } from './IAIClient';
import { AIReportSummary } from '../shared/types';
import { HeuristicReportGenerator } from './HeuristicReportGenerator';

export class GeminiClient implements IAIClient {
  readonly providerName = 'Google Gemini AI';
  private apiKey: string;
  private model: string;
  private fallback = new HeuristicReportGenerator();

  constructor(apiKey: string, model: string = 'gemini-2.5-pro') {
    this.apiKey = apiKey;
    this.model = model;
  }

  public async generateInspectionReport(prompt: string, payload: Record<string, unknown>): Promise<AIReportSummary> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('Gemini API key unconfigured. Falling back to built-in Heuristic Engine.');
      return this.fallback.generateInspectionReport(prompt, payload);
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty text candidate returned from Gemini.');
      }

      const parsed: AIReportSummary = JSON.parse(rawText);
      return parsed;
    } catch (err) {
      console.error('Gemini API execution error:', err);
      // Graceful fallback to guarantee user still gets an executive report
      return this.fallback.generateInspectionReport(prompt, payload);
    }
  }
}
