/**
 * AI Website Inspector — AI Client Factory
 * Resolves the active AI provider based on user settings.
 */

import { IAIClient } from './IAIClient';
import { HeuristicReportGenerator } from './HeuristicReportGenerator';
import { GeminiClient } from './GeminiClient';
import { OpenAIClient } from './OpenAIClient';
import { AnthropicClient } from './AnthropicClient';
import { settingsManager } from '../settings/SettingsManager';

export class AIClientFactory {
  public async getClient(): Promise<IAIClient> {
    const settings = await settingsManager.getSettings();

    switch (settings.aiProvider) {
      case 'gemini':
        return new GeminiClient(settings.apiKey, settings.selectedModel || 'gemini-2.5-pro');
      case 'openai':
        return new OpenAIClient(settings.apiKey, settings.selectedModel || 'gpt-4o');
      case 'anthropic':
        return new AnthropicClient(settings.apiKey, settings.selectedModel || 'claude-3-5-sonnet-20240620');
      case 'heuristic':
      default:
        return new HeuristicReportGenerator();
    }
  }
}

export const aiClientFactory = new AIClientFactory();
