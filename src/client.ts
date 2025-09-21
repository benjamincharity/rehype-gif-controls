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
    const gifPlayerElement = wrapper.querySelector('gif-player'); // Gif-player doesn't have TypeScript definitions

    if (!gifPlayerElement) {
      return;
    }

    wrapper.dataset.initialized = 'true';

    const delay = Number.parseInt(
      wrapperElement.dataset.gifControlsDelay || '0',
      10
    );
    const autoplay = wrapperElement.dataset.gifControlsAutoplay === 'true';

    // Enable infinite loop
    gifPlayerElement.setAttribute('repeat', '');

    function startPlayback() {
      gifPlayerElement.play = true;
    }

    // Set up viewport detection for autoplay
    if (autoplay) {
      const observer = new IntersectionObserver(
        function (entries) {
          for (const entry of entries) {
            if (entry.isIntersecting && entry.target === wrapper) {
              observer.unobserve(wrapper);

              if (delay > 0) {
                setTimeout(() => {
                  startPlayback();
                }, delay);
              } else {
                startPlayback();
              }
            }
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(wrapper);
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
