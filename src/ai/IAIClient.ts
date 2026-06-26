/**
 * AI Website Inspector — AI Client Strategy Interface
 */

import { AIReportSummary } from '../shared/types';

export interface IAIClient {
  readonly providerName: string;
  generateInspectionReport(prompt: string, structuredData: Record<string, unknown>): Promise<AIReportSummary>;
}
