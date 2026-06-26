/**
 * AI Website Inspector — Main Content Script
 * Runs in isolated world. Orchestrates runtime inspection, pipeline execution, and Shadow DOM DevTools overlay.
 */

import { MSG_START_ANALYSIS, MSG_PROGRESS_UPDATE, MSG_ANALYSIS_COMPLETE, MSG_ANALYSIS_ERROR, MSG_TOGGLE_OVERLAY, MSG_HIGHLIGHT_SELECTOR, MSG_CAPTURE_TAB } from '../shared/constants';
import { ExtensionMessage } from '../shared/messaging';
import { pipelineOrchestrator } from '../analysis/PipelineOrchestrator';
import { storageRepository } from '../storage/StorageRepository';
import { mountOverlay, unmountOverlay, highlightOverlaySelector } from '../overlay/OverlayHost';
import { CompleteInspectionResult } from '../shared/types';

let runtimeSignals: Record<string, unknown> = {};
let latestInspection: CompleteInspectionResult | null = null;
let isOverlayMounted = false;

// 1. Inject pageInspector into host window runtime
function injectPageInspector() {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('pageInspector.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  } catch (err) {
    console.warn('Failed to inject pageInspector:', err);
  }
}

window.addEventListener('__AI_INSPECTOR_RUNTIME_DATA__', (event: Event) => {
  const customEv = event as CustomEvent;
  if (customEv.detail) {
    runtimeSignals = customEv.detail;
  }
});

injectPageInspector();

// 2. Listen for Chrome extension messages from popup or background
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  const { action, payload } = message;

  if (action === MSG_START_ANALYSIS) {
    handleStartAnalysis().then(sendResponse);
    return true; // asynchronous response
  }

  if (action === MSG_TOGGLE_OVERLAY) {
    const enable = Boolean(payload);
    if (enable && !isOverlayMounted && latestInspection) {
      mountOverlay(latestInspection);
      isOverlayMounted = true;
    } else if (!enable && isOverlayMounted) {
      unmountOverlay();
      isOverlayMounted = false;
    }
    sendResponse({ success: true, isOverlayMounted });
    return false;
  }

  if (action === MSG_HIGHLIGHT_SELECTOR && typeof payload === 'string') {
    highlightOverlaySelector(payload);
    sendResponse({ success: true });
    return false;
  }
});

async function handleStartAnalysis(): Promise<{ success: boolean; report?: CompleteInspectionResult; error?: string }> {
  try {
    // Request background service worker to capture tab screenshot
    let screenshotUrl: string | undefined;
    try {
      const resp = await chrome.runtime.sendMessage({ action: MSG_CAPTURE_TAB });
      screenshotUrl = resp?.dataUrl;
    } catch {
      // background capture permission issue or non-extension test
    }

    const result = await pipelineOrchestrator.runPipeline(
      document,
      window,
      window.location.href,
      screenshotUrl,
      runtimeSignals,
      (progress) => {
        // Broadcast stage updates to live popup
        chrome.runtime.sendMessage({ action: MSG_PROGRESS_UPDATE, payload: progress }).catch(() => {});
      }
    );

    latestInspection = result;
    await storageRepository.saveInspection(result);

    // Auto-mount overlay if enabled
    if (!isOverlayMounted) {
      mountOverlay(result);
      isOverlayMounted = true;
    }

    chrome.runtime.sendMessage({ action: MSG_ANALYSIS_COMPLETE, payload: result }).catch(() => {});
    return { success: true, report: result };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    chrome.runtime.sendMessage({ action: MSG_ANALYSIS_ERROR, payload: errMsg }).catch(() => {});
    return { success: false, error: errMsg };
  }
}
