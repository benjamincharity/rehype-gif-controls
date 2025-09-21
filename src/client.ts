/**
 * Client-side GIF controls functionality using gif-player web component
 * Import this in your application's main JS/TS file for proper dependency management
 */

import gifPlayerInit from 'gif-player';

let isInitialized = false;

/**
 * Initialize GIF controls for all GIFs on the page using gif-player
 */
export function initGifControls(): void {
  if (typeof window === 'undefined') return;

  if (!isInitialized) {
    // Initialize gif-player web component
    gifPlayerInit();
    console.log('🎬 GIF Controls: gif-player web component initialized');
    isInitialized = true;
  }

  const gifElements = document.querySelectorAll('[data-gif-controls="true"]:not([data-initialized])');
  console.log('🔍 GIF Controls: Found', gifElements.length, 'GIF elements to initialize');

  gifElements.forEach(function(wrapper: Element) {
    const wrapperElement = wrapper as HTMLElement;
    const gifPlayerElement = wrapper.querySelector('gif-player') as any; // gif-player doesn't have TypeScript definitions

    if (!gifPlayerElement) {
      console.warn('❌ GIF Controls: No gif-player element found in wrapper');
      return;
    }

    console.log('🎯 GIF Controls: Initializing GIF Player for:', gifPlayerElement.src);
    wrapper.setAttribute('data-initialized', 'true');

    // Ensure wrapper has position relative for absolute positioned children
    if (getComputedStyle(wrapperElement).position === 'static') {
      wrapperElement.style.position = 'relative';
    }

    const delay = parseInt(wrapperElement.dataset['delay'] || '0', 10);
    const autoplay = wrapperElement.dataset['autoplay'] === 'true';

    console.log('⚙️ GIF Controls: Settings -', { delay, autoplay });

    // Start with gif-player ready to play immediately
    gifPlayerElement.style.display = 'block';
    gifPlayerElement.style.visibility = 'visible';
    gifPlayerElement.setAttribute('repeat', ''); // Enable infinite loop

    function startPlayback() {
      console.log('🎬 GIF Controls: Starting GIF playback with infinite loop');
      gifPlayerElement.play = true;
    }

    // Set up viewport detection for autoplay
    if (autoplay) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && entry.target === wrapper) {
            console.log('📺 GIF Controls: GIF entered viewport - starting playback');
            observer.unobserve(wrapper as Element);

            if (delay > 0) {
              setTimeout(() => startPlayback(), delay);
            } else {
              startPlayback();
            }
          }
        });
      }, { threshold: 0.1 });

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