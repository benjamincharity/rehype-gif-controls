import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';
import type { RehypeGifControlsOptions, ProcessedGifElement } from './types.js';
import {
  mergeOptions,
  isGifImage,
  processGifElement,
  createGifWrapper,
  validateGifSource,
  injectClientScript,
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

  return (tree: Root) => {
    const processedGifs: ProcessedGifElement[] = [];

    // First pass: find and process all GIF images
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'img') return;

      // Check if this is a GIF image
      if (!isGifImage(node, options.extensions)) {
        return;
      }

      const src = node.properties?.['src'] as string;
      if (!src) {
        return;
      }

      // Validate source URL against security rules
      if (!validateGifSource(src, options.security.allowedDomains || [])) {
        return;
      }

      hasFoundGifs = true;

      // Process the GIF element
      const processedGif = processGifElement(node, options);
      processedGifs.push(processedGif);

      // Create wrapper and replace the original element
      if (parent && typeof index === 'number') {
        const wrapper = createGifWrapper(processedGif, options);
        parent.children[index] = wrapper;
      }
    });

    // Securely inject client script if GIFs were found and injection is enabled
    if (hasFoundGifs && options.injectScript) {
      injectClientScript(tree);
    }
  };
};

export default rehypeGifControls;
export type { RehypeGifControlsOptions, GifPlayerOptions } from './types.js';