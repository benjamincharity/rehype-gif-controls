type Element = any;

/**
 * Configuration options for gifplayer.js integration
 */
export interface GifPlayerOptions {
  /**
   * Delay before starting auto-play (in milliseconds)
   * @default 500
   */
  delay?: number;

  /**
   * Whether to auto-play on viewport entry
   * @default true
   */
  autoplay?: boolean;

  /**
   * Preload GIF frames for smoother playback
   * @default true
   */
  preload?: boolean;

  /**
   * Show loading indicator while preloading
   * @default true
   */
  showLoader?: boolean;

  /**
   * Custom CSS classes to add to the wrapper
   */
  wrapperClasses?: string[];

  /**
   * Custom CSS classes to add to the GIF element
   */
  gifClasses?: string[];
}

/**
 * Main plugin configuration
 */
export interface RehypeGifControlsOptions {
  /**
   * Gifplayer.js configuration options
   */
  gifPlayer?: GifPlayerOptions;

  /**
   * Custom selector for GIF images (override default detection)
   */
  selector?: string;

  /**
   * File extensions to treat as GIFs
   * @default ['gif']
   */
  extensions?: string[];

  /**
   * Whether to inject the gifplayer.js client script
   * @default true
   */
  injectScript?: boolean;

  /**
   * Custom gifplayer.js script URL (if not using the bundled version)
   */
  scriptUrl?: string;

  /**
   * Additional data attributes to add to GIF containers
   */
  dataAttributes?: Record<string, string>;

  /**
   * Security options
   */
  security?: {
    /**
     * Allowed domains for GIF sources
     * Empty array means all domains are allowed
     * @default []
     */
    allowedDomains?: string[];

    /**
     * Maximum file size hint in bytes (for data attributes)
     */
    maxFileSize?: number;

    /**
     * Sanitize alt text and other attributes
     * @default true
     */
    sanitizeAttributes?: boolean;
  };
}

/**
 * Internal type for processed GIF elements
 */
export interface ProcessedGifElement {
  element: Element;
  src: string;
  alt: string | undefined;
  width: string | undefined;
  height: string | undefined;
}