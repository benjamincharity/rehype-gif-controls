import { visit } from 'unist-util-visit';
import type { RehypeGifControlsOptions, ProcessedGifElement } from './types.js';

type Root = any;
type Element = any;
import {
  mergeOptions,
  isGifImage,
  processGifElement,
  createGifWrapper,
  validateGifSource,
} from './utils.js';

/**
 * A rehype plugin that adds interactive GIF controls with play-count limits and click-to-replay functionality.
 *
 * This plugin:
 * 1. Detects GIF images in the HTML AST
 * 2. Wraps them in containers with data attributes for configuration
 * 3. Adds CSS classes for styling
 * 4. Optionally injects gifplayer.js script for client-side functionality
 *
 * @param options - Configuration options for the plugin
 * @returns The rehype plugin function
 *
 * @example
 * ```typescript
 * import { unified } from 'unified';
 * import rehypeGifControls from '@benjc/rehype-gif-controls';
 *
 * const processor = unified()
 *   .use(rehypeGifControls, {
 *     gifPlayer: {
 *       playCount: 2,
 *       clickToReplay: true,
 *     },
 *   });
 * ```
 */
const rehypeGifControls = (userOptions: Partial<RehypeGifControlsOptions> = {}) => {
  const options = mergeOptions(userOptions);
  let hasFoundGifs = false;

  console.log('🎬 rehype-gif-controls: Plugin initialized with options:', JSON.stringify(options, null, 2));

  return (tree: Root) => {
    const processedGifs: ProcessedGifElement[] = [];

    console.log('🔍 rehype-gif-controls: Starting to process tree...');

    // First pass: find and process all GIF images
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'img') return;

      console.log('📷 rehype-gif-controls: Found img element:', node.properties?.['src']);

      // Check if this is a GIF image
      if (!isGifImage(node, options.extensions)) {
        console.log('❌ rehype-gif-controls: Not a GIF, skipping:', node.properties?.['src']);
        return;
      }

      console.log('✅ rehype-gif-controls: Confirmed GIF image:', node.properties?.['src']);

      const src = node.properties?.['src'] as string;
      if (!src) {
        console.log('❌ rehype-gif-controls: No src attribute found');
        return;
      }

      // Validate source URL against security rules
      if (!validateGifSource(src, options.security.allowedDomains || [])) {
        console.warn(`rehype-gif-controls: Skipping GIF with invalid source: ${src}`);
        return;
      }

      hasFoundGifs = true;
      console.log('🎯 rehype-gif-controls: Processing GIF:', src);

      // Process the GIF element
      const processedGif = processGifElement(node, options);
      processedGifs.push(processedGif);

      // Create wrapper and replace the original element
      if (parent && typeof index === 'number') {
        const wrapper = createGifWrapper(processedGif, options);
        parent.children[index] = wrapper;
        console.log('🎁 rehype-gif-controls: Wrapped GIF in container');
      } else {
        console.warn('❌ rehype-gif-controls: Could not wrap GIF - missing parent or index');
      }
    });

    console.log(`📊 rehype-gif-controls: Summary - Found ${processedGifs.length} GIFs, hasFoundGifs: ${hasFoundGifs}, injectScript: ${options.injectScript}`);

    // Note: Script injection has been deprecated in favor of proper client-side imports
    if (hasFoundGifs) {
      console.log(`📊 rehype-gif-controls: Found ${processedGifs.length} GIFs. Import '@benjc/rehype-gif-controls/client' in your app for functionality.`);
    }
  };
};

export default rehypeGifControls;
export type { RehypeGifControlsOptions, GifPlayerOptions } from './types.js';