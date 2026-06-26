/**
 * AI Website Inspector — Shadow DOM Overlay Host
 * Mounts the DevTools inspection UI inside an isolated Shadow DOM root to prevent CSS bleeding.
 */

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { InspectorOverlay } from './InspectorOverlay';
import { CompleteInspectionResult } from '../shared/types';

const HOST_ID = '__ai_website_inspector_overlay_host__';
let activeRoot: Root | null = null;
let hostElement: HTMLElement | null = null;
let activeSelectorRef: { current: string | null } = { current: null };

export function mountOverlay(inspection: CompleteInspectionResult): void {
  unmountOverlay();

  hostElement = document.createElement('div');
  hostElement.id = HOST_ID;
  hostElement.style.position = 'fixed';
  hostElement.style.top = '0';
  hostElement.style.left = '0';
  hostElement.style.width = '100vw';
  hostElement.style.height = '100vh';
  hostElement.style.pointerEvents = 'none'; // let clicks pass through unless on our modal/tooltip
  hostElement.style.zIndex = '2147483647'; // max CSS z-index

  document.documentElement.appendChild(hostElement);
  const shadow = hostElement.attachShadow({ mode: 'open' });

  // Inject embedded Tailwind styles for Shadow DOM isolation
  const style = document.createElement('style');
  style.textContent = `
    *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; }
    .overlay-container { pointer-events: none; width: 100%; height: 100%; position: relative; font-family: Inter, system-ui, sans-serif; }
    .interactive-element { pointer-events: auto; }
    .backdrop-blur { backdrop-filter: blur(8px); }
  `;
  shadow.appendChild(style);

  const mountPoint = document.createElement('div');
  mountPoint.className = 'overlay-container';
  shadow.appendChild(mountPoint);

  activeRoot = createRoot(mountPoint);
  activeRoot.render(
    <React.StrictMode>
      <InspectorOverlay
        inspection={inspection}
        activeSelectorRef={activeSelectorRef}
        onClose={() => unmountOverlay()}
      />
    </React.StrictMode>
  );
}

export function unmountOverlay(): void {
  if (activeRoot) {
    activeRoot.unmount();
    activeRoot = null;
  }
  if (hostElement && hostElement.parentNode) {
    hostElement.parentNode.removeChild(hostElement);
  }
  hostElement = null;
}

export function highlightOverlaySelector(selector: string): void {
  activeSelectorRef.current = selector;
  window.dispatchEvent(new CustomEvent('__AI_INSPECTOR_HIGHLIGHT_CHANGE__', { detail: selector }));
}
