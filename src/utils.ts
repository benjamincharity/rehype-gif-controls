import type { Element } from 'hast';
import type { ProcessedGifElement, RehypeGifControlsOptions } from './types.js';

/**
 * Default plugin options
 */
export const defaultOptions: Required<RehypeGifControlsOptions> = {
  gifPlayer: {
    delay: 500,
    autoplay: true,
    preload: true,
    showLoader: true,
    wrapperClasses: [],
    gifClasses: [],
  },
  selector: 'img[src*=".gif"]',
  extensions: ['gif'],
  injectScript: true, // Default to true for standard rehype plugin behavior
  dataAttributes: {},
  security: {
    allowedDomains: [],
    sanitizeAttributes: true,
  },
};

/**
 * Merge user options with defaults
 */
export function mergeOptions(
  userOptions: RehypeGifControlsOptions = {}
): Required<RehypeGifControlsOptions> {
  return {
    ...defaultOptions,
    ...userOptions,
    gifPlayer: {
      ...defaultOptions.gifPlayer,
      ...userOptions.gifPlayer,
    },
    security: {
      ...defaultOptions.security,
      ...userOptions.security,
    },
  };
}

/**
 * Check if an image element is a GIF
 */
export function isGifImage(element: Element, extensions: string[]): boolean {
  const src = getAttributeValue(element, 'src');
  if (!src) return false;

  // Extract file extension from URL or data URI
  const extension = extractFileExtension(src);
  return extension !== null && extensions.includes(extension.toLowerCase());
}

/**
 * Extract file extension from URL or data URI
 */
function extractFileExtension(src: string): string | null {
  // Handle data URIs
  if (src.startsWith('data:')) {
    // Use simple string operations instead of regex to prevent ReDoS
    const mimeStart = src.indexOf('image/');
    if (mimeStart === -1) return null;

    const mimeType = src.substring(mimeStart + 6);
    const semicolon = mimeType.indexOf(';');
    const comma = mimeType.indexOf(',');

    const end = Math.min(
      semicolon > -1 ? semicolon : Infinity,
      comma > -1 ? comma : Infinity
    );

    return end !== Infinity ? mimeType.substring(0, end) : null;
  }

  // Handle regular URLs using safe string operations
  try {
    // Remove query and hash first
    const urlWithoutQuery = src.split('?')[0];
    const cleanUrl = urlWithoutQuery ? urlWithoutQuery.split('#')[0] : '';

    if (!cleanUrl) {
      return null;
    }

    const lastDot = cleanUrl.lastIndexOf('.');

    if (lastDot === -1 || lastDot === cleanUrl.length - 1) {
      return null;
    }

    const extension = cleanUrl.substring(lastDot + 1).toLowerCase();

    // Validate extension is alphanumeric only (security check)
    if (!/^[a-z0-9]+$/i.test(extension)) {
      return null;
    }

    return extension;
  } catch {
    return null;
  }
}

/**
 * Get attribute value from element
 */
export function getAttributeValue(
  element: Element,
  name: string
): string | undefined {
  const properties = element.properties;
  if (!properties) return undefined;

  const value = properties[name];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Set attribute value on element
 */
export function setAttributeValue(
  element: Element,
  name: string,
  value: string
): void {
  if (!element.properties) {
    element.properties = {};
  }
  element.properties[name] = value;
}

/**
 * Sanitize attribute values for security
 */
export function sanitizeAttribute(value: string): string {
  // Remove all HTML tags and dangerous patterns
  let sanitized = value
    // Remove HTML/XML tags
    .replace(/<[^>]*>/g, '')
    // Remove HTML entities that could become dangerous
    .replace(/&[#\w]+;/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: URIs with HTML content
    .replace(/data:text\/html[^,]*,/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove dangerous characters
    .replace(/[<>'\"\\]/g, '')
    .trim()
    .slice(0, 500);

  return sanitized;
}

/**
 * Validate GIF source URL against security rules
 */
export function validateGifSource(
  src: string,
  allowedDomains: string[]
): boolean {
  // Allow data URIs
  if (src.startsWith('data:')) {
    return src.startsWith('data:image/gif');
  }

  // If no domain restrictions, allow all
  if (allowedDomains.length === 0) {
    return true;
  }

  try {
    const url = new URL(src);
    const domain = url.hostname;

    return allowedDomains.some(
      (allowed) => domain === allowed || domain.endsWith('.' + allowed)
    );
  } catch {
    // For relative URLs, allow them if no domain restrictions or if they're just filenames
    return true;
  }
}

/**
 * Create a gif-player wrapper element
 */
export function createGifWrapper(
  gifElement: ProcessedGifElement,
  options: Required<RehypeGifControlsOptions>
): Element {
  const { gifPlayer, dataAttributes, security } = options;

  const wrapperClasses = [
    'gif-controls',
    ...(gifPlayer.wrapperClasses || []),
  ].join(' ');

  // Sanitize the src attribute for security
  const sanitizedSrc = security.sanitizeAttributes
    ? sanitizeAttribute(gifElement.src)
    : gifElement.src;

  // Create the gif-player web component
  const gifPlayerElement: Element = {
    type: 'element',
    tagName: 'gif-player',
    properties: {
      src: sanitizedSrc,
      play: '', // Initially not playing, will be controlled by our script
      class: 'gif-controls__player',
      repeat: '', // Enable infinite repeat
      // Note: Don't set size attribute - let CSS handle it
    },
    children: [],
  };

  const wrapper: Element = {
    type: 'element',
    tagName: 'div',
    properties: {
      class: wrapperClasses,
      'data-gif-controls': 'true',
      'data-gif-controls-delay': String(gifPlayer.delay),
      'data-gif-controls-autoplay': String(gifPlayer.autoplay),
      'data-gif-controls-preload': String(gifPlayer.preload),
      'data-gif-controls-show-loader': String(gifPlayer.showLoader),
      ...dataAttributes,
    },
    children: [gifPlayerElement],
  };

  // Add width/height as data attributes for reference
  // Don't set them on gif-player to keep it responsive
  if (gifElement.width) {
    setAttributeValue(wrapper, 'data-gif-controls-width', gifElement.width);
  }
  if (gifElement.height) {
    setAttributeValue(wrapper, 'data-gif-controls-height', gifElement.height);
  }

  // Calculate and store aspect ratio if dimensions are available
  if (gifElement.width && gifElement.height) {
    const aspectRatio = (
      (parseInt(gifElement.height) / parseInt(gifElement.width)) *
      100
    ).toFixed(2);
    setAttributeValue(wrapper, 'data-gif-controls-aspect-ratio', aspectRatio);
  }

  // Sanitize alt text for data attribute
  if (gifElement.alt && security.sanitizeAttributes) {
    const sanitizedAlt = sanitizeAttribute(gifElement.alt);
    setAttributeValue(wrapper, 'data-gif-controls-alt', sanitizedAlt);
    gifPlayerElement.properties!['alt'] = sanitizedAlt;
  }

  return wrapper;
}

/**
 * Process GIF element - extract metadata for gif-player
 */
export function processGifElement(
  element: Element,
  _options: Required<RehypeGifControlsOptions>
): ProcessedGifElement {
  const src = getAttributeValue(element, 'src') || '';
  const alt = getAttributeValue(element, 'alt');
  const width = getAttributeValue(element, 'width');
  const height = getAttributeValue(element, 'height');

  return {
    element,
    src,
    alt,
    width,
    height,
  };
}

/**
 * Securely inject the client script into the document
 * Only injects the bundled script, no arbitrary URLs allowed
 */
export function injectClientScript(tree: any): void {
  // For fragments or when we can't find proper HTML structure,
  // append script to the root children
  if (tree.type === 'root') {
    // Check if script is already injected
    const existingScript = findScriptInTree(tree);
    if (existingScript) {
      return; // Already injected
    }

    // Look for html > head structure first
    const htmlElement = tree.children?.find(
      (child: any) => child.tagName === 'html'
    );
    if (htmlElement) {
      let headElement = htmlElement.children?.find(
        (child: any) => child.tagName === 'head'
      );

      if (!headElement) {
        headElement = {
          type: 'element',
          tagName: 'head',
          properties: {},
          children: [],
        };

        if (!htmlElement.children) {
          htmlElement.children = [];
        }
        htmlElement.children.unshift(headElement);
      }

      // Create secure script element
      const scriptElement: Element = {
        type: 'element',
        tagName: 'script',
        properties: {
          type: 'module',
          'data-gif-controls-script': 'true',
          src: './lib/client.js', // Relative path to bundled script only
        },
        children: [],
      };

      if (!headElement.children) {
        headElement.children = [];
      }
      headElement.children.push(scriptElement);
      return;
    }

    // Fallback: Look for head or body element at root level
    let targetElement = tree.children?.find(
      (child: any) => child.tagName === 'head' || child.tagName === 'body'
    );

    if (!targetElement) {
      // Last resort: append to root children (for fragments)
      const scriptElement: Element = {
        type: 'element',
        tagName: 'script',
        properties: {
          type: 'module',
          'data-gif-controls-script': 'true',
          src: './lib/client.js',
        },
        children: [],
      };

      if (!tree.children) {
        tree.children = [];
      }
      tree.children.push(scriptElement);
      return;
    }

    // Inject into found head/body element
    const scriptElement: Element = {
      type: 'element',
      tagName: 'script',
      properties: {
        type: 'module',
        'data-gif-controls-script': 'true',
        src: './lib/client.js',
      },
      children: [],
    };

    if (!targetElement.children) {
      targetElement.children = [];
    }
    targetElement.children.push(scriptElement);
  }
}

/**
 * Recursively find script in tree to avoid duplicates
 */
function findScriptInTree(node: any): boolean {
  if (
    node.tagName === 'script' &&
    node.properties?.['data-gif-controls-script'] === 'true'
  ) {
    return true;
  }

  if (node.children) {
    for (const child of node.children) {
      if (findScriptInTree(child)) {
        return true;
      }
    }
  }

  return false;
}
