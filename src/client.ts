/**
 * Client-side GIF controls functionality using gif-player web component
 * Import this in your application's main JS/TS file for proper dependency management
 */

import gifPlayerInit from 'gif-player';

type PlayCountTracker = Map<string, number>;

let playCountTracker: PlayCountTracker = new Map();
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

    const playCount = parseInt(wrapperElement.dataset['playCount'] || '1', 10);
    const delay = parseInt(wrapperElement.dataset['delay'] || '0', 10);
    const autoplay = wrapperElement.dataset['autoplay'] === 'true';
    const clickToReplay = wrapperElement.dataset['clickToReplay'] === 'true';

    console.log('⚙️ GIF Controls: Settings -', { playCount, delay, autoplay, clickToReplay });

    const trackingId = gifPlayerElement.src || Math.random().toString();
    let currentPlayCount = playCountTracker.get(trackingId) || 0;
    let isPlaying = false;

    function startPlaybackCycle() {
      if (isPlaying) return; // Prevent multiple simultaneous cycles

      currentPlayCount++;
      playCountTracker.set(trackingId, currentPlayCount);
      console.log('🎞️ GIF Controls: Play count incremented to', currentPlayCount);

      isPlaying = true;
      gifPlayerElement.play = true;

      // Listen for animation completion
      const handleFrame = function(event: CustomEvent) {
        // When we return to frame 0, the animation has completed one cycle
        if (event.detail === 0 && currentPlayCount > 0) {
          console.log('⏱️ GIF Controls: Animation cycle completed');

          if (currentPlayCount >= playCount) {
            console.log('⏸️ GIF Controls: Play count limit reached, pausing');
            gifPlayerElement.play = false;
            gifPlayerElement.frame = 0; // Show first frame
            isPlaying = false;
            showReplayButton();
          } else {
            console.log('🔄 GIF Controls: Starting next play cycle');
            // Continue to next cycle
            isPlaying = false;
            setTimeout(() => startPlaybackCycle(), 50); // Small delay between cycles
          }

          gifPlayerElement.removeEventListener('gif-frame', handleFrame);
        }
      };

      gifPlayerElement.addEventListener('gif-frame', handleFrame);
    }

    function showReplayButton() {
      if (!wrapper.querySelector('.gif-replay-btn')) {
        const replayBtn = document.createElement('button');
        replayBtn.className = 'gif-replay-btn';
        replayBtn.innerHTML = '▶️ Replay';
        replayBtn.style.cssText = 'position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 14px; z-index: 10;';
        wrapperElement.appendChild(replayBtn);

        replayBtn.addEventListener('click', function() {
          console.log('🔄 GIF Controls: Replay button clicked');
          // Reset play count and restart
          currentPlayCount = 0;
          playCountTracker.set(trackingId, 0);
          isPlaying = false;
          replayBtn.remove();

          if (delay > 0) {
            setTimeout(() => startPlaybackCycle(), delay);
          } else {
            startPlaybackCycle();
          }
        });
      }
    }

    // Set up viewport detection for autoplay
    if (autoplay) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && entry.target === wrapper) {
            console.log('📺 GIF Controls: GIF entered viewport - starting playback');
            observer.unobserve(wrapper as Element);

            if (delay > 0) {
              setTimeout(() => startPlaybackCycle(), delay);
            } else {
              startPlaybackCycle();
            }
          }
        });
      }, { threshold: 0.1 });

      observer.observe(wrapper as Element);
    }

    // Click to replay functionality
    if (clickToReplay) {
      wrapperElement.style.cursor = 'pointer';
      wrapperElement.addEventListener('click', function(e) {
        const target = e.target as HTMLElement;
        if (target.classList.contains('gif-replay-btn')) return;
        if (target.tagName.toLowerCase() === 'gif-player') return; // Don't interfere with gif-player controls

        console.log('👆 GIF Controls: Click to replay triggered');
        // Reset and replay
        currentPlayCount = 0;
        playCountTracker.set(trackingId, 0);
        isPlaying = false;

        const existingBtn = wrapper.querySelector('.gif-replay-btn');
        if (existingBtn) existingBtn.remove();

        startPlaybackCycle();
      });
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
export { playCountTracker };
export default { initGifControls, playCountTracker };