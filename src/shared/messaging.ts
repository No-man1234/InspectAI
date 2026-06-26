/**
 * AI Website Inspector — Typed Messaging Client
 * Wraps chrome.runtime and chrome.tabs communications safely.
 */

export interface ExtensionMessage<TData = unknown> {
  action: string;
  payload?: TData;
  sender?: string;
}

export async function sendRuntimeMessage<TResp = unknown, TPayload = unknown>(
  action: string,
  payload?: TPayload
): Promise<TResp> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
    throw new Error('Chrome runtime messaging is unavailable in this environment.');
  }
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response as TResp);
      }
    });
  });
}

export async function sendActiveTabMessage<TResp = unknown, TPayload = unknown>(
  action: string,
  payload?: TPayload
): Promise<TResp> {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query) {
    throw new Error('Chrome tabs API is unavailable.');
  }
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (!activeTab?.id) {
    throw new Error('No active tab found to send message.');
  }
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(activeTab.id!, { action, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response as TResp);
      }
    });
  });
}
