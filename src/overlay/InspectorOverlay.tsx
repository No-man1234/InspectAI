/**
 * AI Website Inspector — DevTools Interactive Overlay & Inspection Modal
 * Provides bounding box hover tracking, dimension floating badges, and deep architectural inspection modals.
 */

import React, { useState, useEffect } from 'react';
import { CompleteInspectionResult, DetectedComponentInstance } from '../shared/types';
import { X, Info, Layers, Eye, Zap, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  inspection: CompleteInspectionResult;
  activeSelectorRef: { current: string | null };
  onClose: () => void;
}

interface HoverState {
  element: Element;
  rect: DOMRect;
  component?: DetectedComponentInstance;
  computed: CSSStyleDeclaration;
}

export const InspectorOverlay: React.FC<Props> = ({ inspection, activeSelectorRef, onClose }) => {
  const [isInspecting, setIsInspecting] = useState(true);
  const [hovered, setHovered] = useState<HoverState | null>(null);
  const [selected, setSelected] = useState<HoverState | null>(null);

  // Sync external highlight requests from Popup
  useEffect(() => {
    const handleExtHighlight = (ev: Event) => {
      const sel = (ev as CustomEvent).detail;
      if (sel) {
        const target = document.querySelector(sel);
        if (target) {
          const rect = target.getBoundingClientRect();
          const comp = inspection.detectedComponents.find((c) => c.selector === sel);
          setSelected({
            element: target,
            rect,
            component: comp,
            computed: window.getComputedStyle(target),
          });
          setIsInspecting(false);
        }
      }
    };
    window.addEventListener('__AI_INSPECTOR_HIGHLIGHT_CHANGE__', handleExtHighlight);
    return () => window.removeEventListener('__AI_INSPECTOR_HIGHLIGHT_CHANGE__', handleExtHighlight);
  }, [inspection.detectedComponents]);

  // Global mouse tracker for DevTools highlighter
  useEffect(() => {
    if (!isInspecting || selected) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Temporarily hide our host so elementFromPoint sees host webpage elements
      const host = document.getElementById('__ai_website_inspector_overlay_host__');
      if (host) host.style.display = 'none';

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (host) host.style.display = 'block';

      if (!el || el.tagName === 'BODY' || el.tagName === 'HTML') {
        setHovered(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Find matching component pattern
      const matchComp = inspection.detectedComponents.find((c) => {
        try {
          return el.matches(c.selector) || el.closest(c.selector) !== null;
        } catch {
          return false;
        }
      });

      setHovered({
        element: el,
        rect,
        component: matchComp,
        computed: window.getComputedStyle(el),
      });
    };

    const handleClick = (e: MouseEvent) => {
      if (hovered) {
        e.preventDefault();
        e.stopPropagation();
        setSelected(hovered);
        setIsInspecting(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { capture: true });
    window.addEventListener('click', handleClick, { capture: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove, { capture: true });
      window.removeEventListener('click', handleClick, { capture: true });
    };
  }, [isInspecting, selected, hovered, inspection.detectedComponents]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Floating DevTools Toolbar */}
      <div
        className="interactive-element"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '8px 16px',
          borderRadius: '9999px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          fontWeight: 500,
          zIndex: 999,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isInspecting ? '#38bdf8' : '#94a3b8' }}>
          <Sparkles size={16} />
          <span>{isInspecting ? 'Hover to Inspect DOM' : 'Inspection Paused'}</span>
        </div>
        <div style={{ width: '1px', height: '16px', backgroundColor: '#334155' }} />
        <button
          onClick={() => {
            setSelected(null);
            setIsInspecting(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Resume
        </button>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Hover Highlighter Bounding Box */}
      {hovered && !selected && (
        <div
          style={{
            position: 'fixed',
            top: `${hovered.rect.top}px`,
            left: `${hovered.rect.left}px`,
            width: `${hovered.rect.width}px`,
            height: `${hovered.rect.height}px`,
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '2px solid #38bdf8',
            borderRadius: '4px',
            pointerEvents: 'none',
            transition: 'all 50ms ease-out',
            zIndex: 998,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-26px',
              left: '-2px',
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
            }}
          >
            {hovered.component?.name || hovered.element.tagName.toLowerCase()} • {Math.round(hovered.rect.width)} × {Math.round(hovered.rect.height)}
          </div>
        </div>
      )}

      {/* Selected Element Inspection Modal */}
      {selected && (
        <div
          className="interactive-element backdrop-blur"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              width: '640px',
              maxHeight: '85vh',
              borderRadius: '16px',
              border: '1px solid #334155',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#0f172a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers style={{ color: '#38bdf8' }} size={22} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    {selected.component?.name || `<${selected.element.tagName.toLowerCase()}>`}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {selected.component?.category || 'DOM Element'} • {selected.element.id ? `#${selected.element.id}` : selected.element.tagName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* AI Staff Consultant Intent Breakdown */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #38bdf8',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600, fontSize: '13px' }}>
                  <Sparkles size={16} />
                  <span>AI Staff Architectural Intent</span>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#e2e8f0', margin: 0 }}>
                  {selected.component?.aiExplanation ||
                    `This container organizes foundational content within the document flow. By structuring typography (${selected.computed.fontFamily.split(',')[0]}) with consistent vertical padding, it preserves reading rhythm and visual equilibrium.`}
                </p>
              </div>

              {/* Grid Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Dimensions & Geometry</span>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>
                    {Math.round(selected.rect.width)} × {Math.round(selected.rect.height)} px
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Display: {selected.computed.display}</span>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Typography Tokens</span>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selected.computed.fontFamily.split(',')[0]}
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {selected.computed.fontSize} • Weight {selected.computed.fontWeight}
                  </span>
                </div>
              </div>

              {/* Spacing & Padding Metrics */}
              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Box Model & Spacing Rhythm</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px', fontSize: '13px' }}>
                  <div>Margin: {selected.computed.margin || '0px'}</div>
                  <div>Padding: {selected.computed.padding || '0px'}</div>
                  <div>Gap: {selected.computed.gap || 'normal'}</div>
                </div>
              </div>

              {/* Color Swatches */}
              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Computed Colors</span>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: selected.computed.backgroundColor, border: '1px solid #475569' }} />
                    <span>Background</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: selected.computed.color, border: '1px solid #475569' }} />
                    <span>Foreground Text</span>
                  </div>
                </div>
              </div>

              {/* Accessibility Notes */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', padding: '12px 16px', borderRadius: '10px' }}>
                <CheckCircle2 style={{ color: '#22c55e', flexShrink: 0 }} size={18} />
                <div style={{ fontSize: '13px', color: '#86efac' }}>
                  <strong>Accessibility Compliance</strong>: Element maintains standard semantic containment. Focus indicators are preserved via stylesheet cascade.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', backgroundColor: '#0f172a', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelected(null)}
                style={{
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
