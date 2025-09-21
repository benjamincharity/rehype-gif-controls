import type { ProcessedGifElement, RehypeGifControlsOptions } from './types.js';

type Element = any;

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
  injectScript: false, // Deprecated - use client import instead
  scriptUrl: '', // Deprecated - use client import instead
  dataAttributes: {},
  security: {
    allowedDomains: [],
    sanitizeAttributes: true,
  },
};

/**
 * Merge user options with defaults
 */
export function mergeOptions(userOptions: RehypeGifControlsOptions = {}): Required<RehypeGifControlsOptions> {
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
    const match = src.match(/^data:image\/([^;]+)/);
    return match?.[1] ?? null;
  }

  // Handle regular URLs
  const match = src.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
  return match?.[1] ?? null;
}

/**
 * Get attribute value from element
 */
export function getAttributeValue(element: Element, name: string): string | undefined {
  const properties = element.properties;
  if (!properties) return undefined;

  const value = properties[name];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Set attribute value on element
 */
export function setAttributeValue(element: Element, name: string, value: string): void {
  if (!element.properties) {
    element.properties = {};
  }
  element.properties[name] = value;
}

/**
 * Sanitize attribute values for security
 */
export function sanitizeAttribute(value: string): string {
  return value
    .replace(/[<>'\"]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 500); // Limit length
}

/**
 * Validate GIF source URL against security rules
 */
export function validateGifSource(src: string, allowedDomains: string[]): boolean {
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

    return allowedDomains.some(allowed =>
      domain === allowed || domain.endsWith('.' + allowed)
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
    'gif-controls-wrapper',
    ...(gifPlayer.wrapperClasses || []),
  ].join(' ');

  // Create the gif-player web component
  const gifPlayerElement: Element = {
    type: 'element',
    tagName: 'gif-player',
    properties: {
      src: gifElement.src,
      play: '', // Initially not playing, will be controlled by our script
      size: 'auto',
      class: 'gif-controls-player',
      repeat: '', // Enable infinite repeat
    },
    children: [],
  };

  const wrapper: Element = {
    type: 'element',
    tagName: 'div',
    properties: {
      class: wrapperClasses,
      'data-gif-controls': 'true',
      'data-delay': String(gifPlayer.delay),
      'data-autoplay': String(gifPlayer.autoplay),
      'data-preload': String(gifPlayer.preload),
      'data-show-loader': String(gifPlayer.showLoader),
      style: 'display: inline-block; position: relative;',
      ...dataAttributes,
    },
    children: [gifPlayerElement],
  };

  // Add width/height if available
  if (gifElement.width) {
    setAttributeValue(wrapper, 'data-width', gifElement.width);
    gifPlayerElement.properties!.style = `width: ${gifElement.width}px;`;
  }
  if (gifElement.height) {
    setAttributeValue(wrapper, 'data-height', gifElement.height);
    const existingStyle = gifPlayerElement.properties!.style || '';
    gifPlayerElement.properties!.style = `${existingStyle} height: ${gifElement.height}px;`;
  }

  // Sanitize alt text for data attribute
  if (gifElement.alt && security.sanitizeAttributes) {
    const sanitizedAlt = sanitizeAttribute(gifElement.alt);
    setAttributeValue(wrapper, 'data-alt', sanitizedAlt);
    gifPlayerElement.properties!.alt = sanitizedAlt;
  }

  return wrapper;
}

/**
 * Process GIF element - extract metadata for gif-player
 */
export function processGifElement(element: Element, _options: Required<RehypeGifControlsOptions>): ProcessedGifElement {
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

// Script injection functions removed - use client import instead:
// import '@benjc/rehype-gif-controls/client';