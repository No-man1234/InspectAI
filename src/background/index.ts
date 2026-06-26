/**
 * AI Website Inspector — Background Service Worker
 * Handles viewport screenshot capturing and cross-origin permissions proxying.
 */

import { MSG_CAPTURE_TAB } from '../shared/constants';
import { ExtensionMessage } from '../shared/messaging';

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Website Inspector Chrome Extension successfully installed.');
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  const { action } = message;

  if (action === MSG_CAPTURE_TAB) {
    handleCaptureTab().then(sendResponse);
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
