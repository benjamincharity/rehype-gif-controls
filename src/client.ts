/**
 * Client-side GIF controls functionality using gif-player web component
 * Import this in your application's main JS/TS file for proper dependency management
 */

// @ts-expect-error - Local JS module without full TypeScript definitions
import gifPlayerInit from './gif-player/index.js';

let isInitialized = false;

/**
 * Initialize GIF controls for all GIFs on the page using gif-player
 */
export function initGifControls(): void {
  if (typeof window === 'undefined') return;

  if (!isInitialized) {
    // Initialize gif-player web component
    gifPlayerInit();
    isInitialized = true;
  }

  const gifElements = document.querySelectorAll(
    '[data-gif-controls="true"]:not([data-initialized])'
  );

  gifElements.forEach(function (wrapper: Element) {
    const wrapperElement = wrapper as HTMLElement;
    const gifPlayerElement = wrapper.querySelector('gif-player') as any; // gif-player doesn't have TypeScript definitions

    if (!gifPlayerElement) {
      return;
    }
    wrapper.setAttribute('data-initialized', 'true');

    const delay = parseInt(
      wrapperElement.getAttribute('data-gif-controls-delay') || '0',
      10
    );
    const autoplay =
      wrapperElement.getAttribute('data-gif-controls-autoplay') === 'true';

    // Enable infinite loop
    gifPlayerElement.setAttribute('repeat', '');

    function startPlayback() {
      gifPlayerElement.play = true;
    }

    // Set up viewport detection for autoplay
    if (autoplay) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.target === wrapper) {
              observer.unobserve(wrapper as Element);

              if (delay > 0) {
                setTimeout(() => startPlayback(), delay);
              } else {
                startPlayback();
              }
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(wrapper as Element);
    } else {
      // If not autoplay, start immediately
      startPlayback();
    }
  });
}

/**
 * Auto-initialize when DOM is ready
 */
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGifControls);
  } else {
    initGifControls();
  }

  // Re-initialize for dynamically added content
  const observer = new MutationObserver(initGifControls);
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Export for manual initialization
 */
export default { initGifControls };
