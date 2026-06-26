/**
 * AI Website Inspector — Host Page Runtime Script Inspector
 * Injected into the webpage context to safely inspect JavaScript framework global hooks.
 */

(function inspectHostRuntime() {
  const win = window as unknown as Record<string, unknown>;
  const signals: Record<string, boolean> = {};

  try {
    if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__ || win._reactRootContainer) signals.React = true;
    if (win.__NEXT_DATA__ || win.__NEXT_LOADED_PAGES__) signals['Next.js'] = true;
    if (win.__VUE__ || win.__VUE_DEVTOOLS_GLOBAL_HOOK__) signals.Vue = true;
    if (win.__NUXT__ || win.$nuxt) signals.Nuxt = true;
    if (win.ng || win.getAllAngularRootElements) signals.Angular = true;
    if (win.__svelte) signals.Svelte = true;
    if (win._$HY) signals.Solid = true;
    if (win.THREE || win.__THREE__) signals['Three.js'] = true;
    if (win.gsap || win.TweenMax) signals.GSAP = true;
  } catch {
    // ignore access exceptions
  }

  // Dispatch custom event to communicate with isolated content script
  window.dispatchEvent(
    new CustomEvent('__AI_INSPECTOR_RUNTIME_DATA__', {
      detail: signals,
    })
  );
})();
