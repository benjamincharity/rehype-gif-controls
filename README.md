# @benjc/rehype-gif-controls

[![npm version](https://badge.fury.io/js/@benjc%2Frehype-gif-controls.svg)](https://badge.fury.io/js/@benjc%2Frehype-gif-controls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [rehype](https://github.com/rehypejs/rehype) plugin that automatically transforms GIF images into interactive, responsive web components with advanced playback controls. Features include auto-play limits, viewport detection, click-to-replay functionality, and efficient canvas rendering.

## Features

- 🎮 **Interactive Controls**: Click to pause/resume, frame scrubbing, speed control
- 🖼️ **Responsive Canvas Rendering**: High-performance GIF playback with auto-sizing
- 🔢 **Auto-play Control**: Configurable play counts and viewport-based triggering
- 👁️ **Viewport Detection**: Smart auto-play when GIFs enter the visible area
- 🔒 **Security First**: Domain validation and content sanitization
- ⚡ **Self-Contained**: No external dependencies - all GIF processing built-in
- 🎨 **BEM CSS Classes**: Clean, predictable styling with proper naming conventions
- 📱 **Mobile Optimized**: Touch-friendly controls and responsive behavior
- 🔧 **Framework Agnostic**: Works with any rehype/unified setup

## Installation

```bash
npm install @benjc/rehype-gif-controls
```

## Quick Start

### 1. Add the Plugin

```typescript
import { unified } from 'unified';
import rehypeGifControls from '@benjc/rehype-gif-controls';

const processor = unified().use(rehypeGifControls);
```

### 2. That's it!

The plugin automatically injects the client-side script when GIFs are found. No additional imports needed for basic usage.

**Optional**: For manual control, you can import the client directly:

```typescript
// Optional: For manual initialization control
import '@benjc/rehype-gif-controls/client';
```

### 3. Markdown Input

```markdown
![Animated demo](./demo.gif)
![Loading animation](https://example.com/loader.gif)
```

### 4. Generated Output (with Auto-Injected Script)

```html
<div
  class="gif-controls"
  data-gif-controls="true"
  data-gif-controls-delay="500"
  data-gif-controls-autoplay="true"
>
  <gif-player
    src="./demo.gif"
    class="gif-controls__player"
    repeat
    alt="Animated demo"
  >
  </gif-player>
</div>

<!-- Auto-injected script -->
<script
  type="module"
  data-gif-controls-script="true"
  src="./lib/client.js"
></script>
```

## Usage Example

### Basic Rehype Pipeline

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeGifControls from '@benjc/rehype-gif-controls';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeGifControls, {
    gifPlayer: {
      delay: 500,
      autoplay: true,
    },
  })
  .use(rehypeStringify);

const markdown = '![Animation](./demo.gif)';
const result = await processor.process(markdown);
```

The plugin automatically injects the client script when GIFs are found. No additional imports needed for basic usage.

## Configuration Options

### Complete Options Interface

```typescript
interface RehypeGifControlsOptions {
  // GIF player behavior configuration
  gifPlayer?: {
    delay?: number; // Delay before auto-play (ms) - default: 500
    autoplay?: boolean; // Enable auto-play - default: true
    preload?: boolean; // Preload GIF frames - default: true
    showLoader?: boolean; // Show loading spinner - default: true
    wrapperClasses?: string[]; // Custom CSS classes for wrapper
    gifClasses?: string[]; // Custom CSS classes for gif-player
  };

  // File detection
  selector?: string; // Custom selector override
  extensions?: string[]; // File extensions to treat as GIFs - default: ['gif']

  // Script injection (automatic by default)
  injectScript?: boolean; // default: true

  // Data attributes
  dataAttributes?: Record<string, string>; // Custom data attributes

  // Security
  security?: {
    allowedDomains?: string[]; // Allowed domains for GIF sources
    sanitizeAttributes?: boolean; // Sanitize attributes - default: true
  };
}
```


## BEM CSS Classes & Styling

This package follows [BEM methodology](http://getbem.com/) for CSS class naming:

### CSS Class Structure

```css
/* Block: Main wrapper */
.gif-controls {
}

/* Element: GIF player component */
.gif-controls__player {
}

/* Internal gif-player elements (in shadow DOM) */
.gif-player__canvas {
}
.gif-player__spinner {
}
```

### Data Attributes (BEM-style)

All data attributes follow BEM naming conventions:

- `data-gif-controls="true"` - Identifies processed GIFs
- `data-gif-controls-delay="500"` - Auto-play delay value
- `data-gif-controls-autoplay="true"` - Auto-play enabled state
- `data-gif-controls-preload="true"` - Preload setting
- `data-gif-controls-show-loader="true"` - Loader visibility setting
- `data-gif-controls-width="640"` - Original width (if available)
- `data-gif-controls-height="480"` - Original height (if available)
- `data-gif-controls-aspect-ratio="75.00"` - Calculated aspect ratio percentage
- `data-gif-controls-alt="Alternative text"` - Sanitized alt text

### Responsive Styling (Recommended)

The gif-player web component handles responsive behavior automatically with these built-in styles:

```css
/* These styles are applied automatically by the component */
.gif-player__canvas {
  height: auto;
  width: auto;
  max-width: 100%;
}
```


## gif-player Web Component Features

The generated `<gif-player>` elements support these attributes:

### Supported Attributes

- `src` - GIF source URL (required)
- `play` - Boolean attribute to start/stop playback
- `repeat` - Boolean attribute for infinite looping
- `speed` - Playback speed multiplier (e.g., "0.5" for half speed)
- `frame` - Jump to specific frame number
- `size` - Sizing mode: "auto", "cover", "contain", "stretch"
- `bounce` - Boolean for back-and-forth playback
- `direction` - Playback direction: 1 (forward) or -1 (reverse)
- `prerender` - Boolean to prerender frames during idle time

### Interactive Features

- **Mouse/Touch Controls**: Scrub through frames by dragging
- **Click to Play/Pause**: Click anywhere to toggle playback
- **Smooth Animation**: Canvas-based rendering for optimal performance
- **Frame-accurate Control**: Precise frame navigation and speed control

## Client-Side Integration

### Automatic Initialization (Default)

The plugin automatically injects and initializes the client script when GIFs are found. No manual imports needed!

### Manual Integration (Advanced)

For advanced use cases where you want to disable auto-injection:

```typescript
// 1. Disable auto-injection in plugin config
.use(rehypeGifControls, { injectScript: false })

// 2. Manually import the client
import '@benjc/rehype-gif-controls/client';
```

## Security Considerations

**🔒 Security-First Design**: This plugin has undergone comprehensive security hardening to protect against XSS, injection attacks, and other vulnerabilities.

### Secure Script Injection

The plugin uses secure script injection that:

- ✅ Only injects the bundled client script (no arbitrary URLs)
- ✅ Uses CSP-friendly `type="module"` scripts
- ✅ Prevents duplicate script injection
- ✅ No external dependencies or CDN risks

### Domain Validation

Restrict GIF sources to trusted domains:

```typescript
.use(rehypeGifControls, {
  security: {
    allowedDomains: ['cdn.mysite.com', 'images.trusted.com'],
  },
});
```

- Empty array (default) allows all domains
- Supports subdomain matching (e.g., 'example.com' matches 'cdn.example.com')
- Data URIs are automatically validated for GIF format

### Enhanced XSS Protection

Multi-layered XSS protection includes:

```typescript
// Dangerous input examples that are automatically sanitized:
'<img src="evil.gif" alt="<script>alert(\'xss\')</script>" />';
'<img src="evil.gif" alt="javascript:alert(1)" />';
'<img src="evil.gif" alt="onclick=malicious()" />';
'<img src="evil.gif" alt="data:text/html,<script>alert(1)</script>" />';

// Safe sanitized output
'data-gif-controls-alt="scriptalert(xss)"';
'data-gif-controls-alt="javascriptalert(1)"';
'data-gif-controls-alt="onclickmalicious()"';
'data-gif-controls-alt="alert(1)"';
```

**Protection Features**:

- ✅ Removes HTML tags and dangerous characters
- ✅ Blocks JavaScript protocols and event handlers
- ✅ Prevents HTML entity bypass attacks
- ✅ Limits attribute length to prevent DoS
- ✅ Safe handling of data URIs

### Content Security Policy

If using CSP, ensure these directives:

```
Content-Security-Policy: script-src 'self' 'unsafe-inline'; worker-src 'self' blob:; connect-src 'self' data:;
```

## Performance Optimization

### Bundle Size

- **Plugin core**: ~5KB minified + gzipped
- **Client code**: ~3KB minified + gzipped
- **GIF decoder**: ~4KB minified + gzipped
- **Total**: ~12KB for complete functionality

### Loading Performance

```typescript
// Optimize for large GIFs
.use(rehypeGifControls, {
  gifPlayer: {
    preload: false,    // Don't preload all frames
    showLoader: true,  // Show loading indicator
    autoplay: false,   // Manual start only
  },
});
```

### Memory Usage

- Canvas-based rendering reduces memory usage vs native GIF elements
- Frame-by-frame decoding prevents loading entire GIF into memory
- Automatic garbage collection of unused frames

## Browser Support

### Modern Browsers (Full Support)

- Chrome 64+
- Firefox 53+
- Safari 11.1+
- Edge 79+

### Legacy Support

- Graceful degradation to standard `<img>` tags
- Web Components polyfill can extend support to IE11
- Core functionality works without JavaScript

### Mobile Support

- iOS Safari 11.1+
- Chrome Mobile 64+
- Samsung Internet 7.2+
- Touch controls for frame scrubbing

## Troubleshooting

### Common Issues

#### GIFs Not Being Processed

1. **Check file extensions**: Ensure GIFs have `.gif` extension or configure custom extensions
2. **Verify domain whitelist**: If using `allowedDomains`, ensure GIF sources are included
3. **Check selector**: Ensure images have proper `src` attributes and match the selector

```typescript
// Debug configuration
.use(rehypeGifControls, {
  extensions: ['gif', 'webp'], // Add additional formats
  security: {
    allowedDomains: [], // Empty = allow all domains for testing
  },
});
```

#### Controls Not Working

1. **Missing client import**: Ensure `import '@benjc/rehype-gif-controls/client'` is included
2. **CSP restrictions**: Check browser console for Content Security Policy errors
3. **JavaScript errors**: Check browser console for initialization errors

#### Styling Issues

1. **CSS specificity**: Use more specific selectors or `!important` if needed
2. **Shadow DOM**: gif-player internal styles are isolated - style the wrapper instead
3. **Responsive issues**: Ensure container has proper width constraints

#### Performance Issues

1. **Large GIFs**: Disable preloading or reduce auto-play count
2. **Many GIFs**: Use intersection observer to limit concurrent playback
3. **Memory usage**: Monitor DevTools memory tab for excessive usage

### Debug Mode

Enable console logging for troubleshooting:

```typescript
// The plugin automatically logs processing steps to console
// Look for messages starting with "🎬 rehype-gif-controls:"
```

## Migration Guide

### From v0.x to v1.x

#### Breaking Changes

1. **Script injection now secure by default**:

   ```typescript
   // Old (insecure)
   .use(rehypeGifControls, {
     injectScript: true,
     scriptUrl: 'https://any-url.com/script.js' // SECURITY RISK
   });

   // New (secure by default)
   .use(rehypeGifControls); // Automatically injects secure bundled script

   // Or disable if you prefer manual imports
   .use(rehypeGifControls, { injectScript: false });
   import '@benjc/rehype-gif-controls/client';
   ```

2. **Data attribute naming**:

   ```css
   /* Old */
   [data-delay="500"]
   [data-autoplay="true"]
   [data-alt="text"]

   /* New (BEM) */
   [data-gif-controls-delay="500"]
   [data-gif-controls-autoplay="true"]
   [data-gif-controls-alt="text"]
   ```

3. **Enhanced security**:
   - Removed external dependency security risks
   - All functionality is now built-in and self-contained
   - Comprehensive XSS protection and input sanitization

#### Migration Steps

1. **Update plugin usage** (most users can just remove configuration):

   ```diff
   .use(rehypeGifControls, {
   -   injectScript: true,
   -   scriptUrl: 'custom-url',
   });

   ```

2. **Update CSS selectors**:

   ```diff
   - [data-delay]
   + [data-gif-controls-delay]
   - [data-autoplay]
   + [data-gif-controls-autoplay]
   ```

3. **No manual script management needed**:
   ```diff
   - import '@benjc/rehype-gif-controls/client';
   // Script is now auto-injected when GIFs are found
   ```

## Development

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Lint and format
npm run lint
npm run format

# Type checking
npm run typecheck
```

### Project Structure

```
src/
├── index.ts              # Main plugin entry point
├── client.ts             # Client-side initialization
├── utils.ts              # Plugin utilities and BEM helpers
├── types.ts              # TypeScript definitions
└── gif-player/           # Self-contained GIF player
    ├── index.js          # Web component initialization
    ├── gif-player.js     # Main web component with BEM styles
    └── omggif.js         # GIF decoding library
```

### Testing

```bash
# Run specific test file
npm test -- test/index.test.ts

# Run with coverage
npm test -- --coverage

# Debug tests
npm test -- --inspect-brk
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for your changes
4. Run tests (`npm test`)
5. Run linting (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT © [Benjamin Charity](https://github.com/benjamincharity)

### Third-Party Licenses

- **omggif**: MIT License © Dean McNamee - GIF encoding/decoding library
- **gif-player**: MIT License © Simon Green - Original web component design

## Related Projects

- [rehype-semantic-images](https://github.com/benjamincharity/rehype-semantic-images) - Enhanced semantic image processing
- [rehype-scroll-to-top](https://github.com/benjamincharity/rehype-scroll-to-top) - Auto-generated scroll-to-top links
- [unified](https://github.com/unifiedjs/unified) - Universal syntax tree processor
- [rehype](https://github.com/rehypejs/rehype) - HTML processor built on unified

## Changelog

### v1.0.0

- ✨ **Self-contained**: Integrated gif-player functionality directly into package
- 🎨 **BEM CSS**: Implemented proper BEM naming conventions for all classes and data attributes
- 📱 **Responsive**: Built-in responsive canvas rendering with auto-sizing
- 🔧 **Client Import**: Simplified integration with `import '@benjc/rehype-gif-controls/client'`
- 🔒 **Enhanced Security**: Improved domain validation and content sanitization
- ⚡ **Performance**: Optimized canvas rendering and frame management
- 📚 **Documentation**: Comprehensive usage examples and migration guide

### v0.x

- Initial implementation with external gif-player dependency
- Basic GIF processing and control functionality
