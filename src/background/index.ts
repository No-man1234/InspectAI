/**
 * AI Website Inspector — Background Service Worker
 * Handles viewport screenshot capturing and cross-origin permissions proxying.
 */

import { MSG_CAPTURE_TAB, MSG_GENERATE_AI_REPORT } from '../shared/constants';
import { ExtensionMessage } from '../shared/messaging';
import { GeminiClient } from '../ai/GeminiClient';
import { OpenAIClient } from '../ai/OpenAIClient';
import { AnthropicClient } from '../ai/AnthropicClient';
import { HeuristicReportGenerator } from '../ai/HeuristicReportGenerator';

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Website Inspector Chrome Extension successfully installed.');
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  const { action } = message;

  if (action === MSG_CAPTURE_TAB) {
    handleCaptureTab().then(sendResponse);
    return true; // async
  }
  if (action === MSG_GENERATE_AI_REPORT) {
    handleGenerateAiReport(message.payload).then(sendResponse);
    return true; // async
  }
  return false;
});

async function handleCaptureTab(): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  try {
    if (!chrome.tabs?.captureVisibleTab) {
      throw new Error('captureVisibleTab API unavailable.');
    }
    const dataUrl = await chrome.tabs.captureVisibleTab(null as unknown as number, { format: 'jpeg', quality: 75 });
    return { success: true, dataUrl };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function handleGenerateAiReport(payload: any): Promise<{ success: boolean; report?: any; error?: string }> {
  try {
    let client;
    if (payload?.provider === 'gemini') {
      client = new GeminiClient(payload.apiKey, payload.model);
    } else if (payload?.provider === 'openai') {
      client = new OpenAIClient(payload.apiKey, payload.model);
    } else if (payload?.provider === 'anthropic') {
      client = new AnthropicClient(payload.apiKey, payload.model);
    } else {
      client = new HeuristicReportGenerator();
    }
    const report = await client.generateInspectionReport(payload.prompt, payload.data);
    return { success: true, report };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
