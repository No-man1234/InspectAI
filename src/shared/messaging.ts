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

  // Pre-check for restricted browser system URLs
  if (activeTab.url) {
    const urlLower = activeTab.url.toLowerCase();
    if (
      urlLower.startsWith('chrome://') ||
      urlLower.startsWith('edge://') ||
      urlLower.startsWith('about:') ||
      urlLower.startsWith('view-source:') ||
      urlLower.startsWith('https://chrome.google.com/webstore') ||
      urlLower.startsWith('https://chromewebstore.google.com')
    ) {
      throw new Error('Cannot inspect restricted browser system pages. Please navigate to a standard website (e.g., https://example.com) and try again.');
    }
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(activeTab.id!, { action, payload }, (response) => {
      if (chrome.runtime.lastError) {
        const errText = chrome.runtime.lastError.message || '';
        if (errText.includes('Could not establish connection') || errText.includes('Receiving end does not exist')) {
          // Self-healing: auto-inject content.js into tabs opened prior to extension installation/reload
          if (chrome.scripting?.executeScript) {
            chrome.scripting.executeScript(
              { target: { tabId: activeTab.id! }, files: ['content.js'] },
              () => {
                if (chrome.runtime.lastError) {
                  reject(new Error('Please reload the webpage (F5 / Ctrl+R) to initialize AI Website Inspector on this tab.'));
                } else {
                  // Retry message after content script attaches
                  setTimeout(() => {
                    chrome.tabs.sendMessage(activeTab.id!, { action, payload }, (retryResp) => {
                      if (chrome.runtime.lastError) {
                        reject(new Error('Please refresh this webpage to enable AI inspection.'));
                      } else {
                        resolve(retryResp as TResp);
                      }
                    });
                  }, 150);
                }
              }
            );
            return;
          } else {
            reject(new Error('Please refresh this webpage (F5) to attach the AI Website Inspector runtime.'));
            return;
          }
        }
        reject(new Error(errText));
      } else {
        resolve(response as TResp);
      }
    });
  });
}
