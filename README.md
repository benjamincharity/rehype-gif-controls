# @benjc/rehype-gif-controls

[![npm version](https://badge.fury.io/js/@benjc%2Frehype-gif-controls.svg)](https://badge.fury.io/js/@benjc%2Frehype-gif-controls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [rehype](https://github.com/rehypejs/rehype) plugin that automatically adds interactive controls to GIF images in your MDX/HTML content. Provides play-count limits, click-to-replay functionality, and viewport-based auto-play using [gifplayer.js](https://github.com/rubentd/gifplayer).

## Features

- 🎮 **Interactive Controls**: Click-to-replay and configurable auto-play
- 🔢 **Play Count Limits**: Control how many times GIFs auto-play
- 👁️ **Viewport Detection**: Auto-play when GIFs enter the viewport
- 🔒 **Security First**: Domain validation and content sanitization
- ⚡ **Performance Optimized**: Lazy loading and efficient canvas rendering
- 🎨 **Highly Customizable**: Extensive styling and behavior options
- 📱 **Responsive**: Works across all device types

## Installation

```bash
npm install @benjc/rehype-gif-controls
```

## Usage

### Basic Setup

```typescript
import { unified } from 'unified';
import rehypeGifControls from '@benjc/rehype-gif-controls';

const processor = unified()
  .use(rehypeGifControls);
```

### With Next.js MDX

```javascript
// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      ['@benjc/rehype-gif-controls', {
        gifPlayer: {
          playCount: 2,
          clickToReplay: true,
        },
      }],
    ],
  },
});

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
});
```

### Markdown Input

```markdown
![My awesome animation](./animation.gif)
![Another cool GIF](https://example.com/cool.gif)
```

### Generated Output

```html
<div class="gif-controls-wrapper" data-gif-controls="true" data-play-count="1" data-autoplay="true" data-click-to-replay="true">
  <img src="./animation.gif" alt="My awesome animation" class="gif-controls-image" loading="lazy">
</div>

<!-- Scripts automatically injected -->
<script src="https://cdn.jsdelivr.net/npm/gifplayer@0.3.3/dist/gifplayer.min.js" async defer data-gif-controls-script="true"></script>
<script data-gif-controls-init="true">/* Initialization code */</script>
```

## Configuration Options

### Plugin Options

```typescript
interface RehypeGifControlsOptions {
  // GIF player behavior
  gifPlayer?: {
    playCount?: number;           // Auto-play count (default: 1)
    delay?: number;               // Delay before auto-play in ms (default: 0)
    autoplay?: boolean;           // Enable auto-play (default: true)
    clickToReplay?: boolean;      // Enable click-to-replay (default: true)
    preload?: boolean;            // Preload GIF frames (default: true)
    showLoader?: boolean;         // Show loading indicator (default: true)
    wrapperClasses?: string[];    // Custom wrapper classes
    gifClasses?: string[];        // Custom GIF element classes
  };

  // File detection
  extensions?: string[];          // File extensions to treat as GIFs (default: ['gif'])
  selector?: string;              // Custom selector override

  // Script injection
  injectScript?: boolean;         // Inject gifplayer.js (default: true)
  scriptUrl?: string;             // Custom script URL

  // Data attributes
  dataAttributes?: Record<string, string>; // Custom data attributes

  // Security
  security?: {
    allowedDomains?: string[];    // Allowed domains for GIF sources
    maxFileSize?: number;         // Max file size hint
    sanitizeAttributes?: boolean; // Sanitize attributes (default: true)
  };
}
```

### Example Configurations

#### Basic Auto-play Control

```typescript
.use(rehypeGifControls, {
  gifPlayer: {
    playCount: 3,      // Play 3 times then stop
    delay: 1000,       // Wait 1 second before auto-play
  },
});
```

#### Security-Focused Setup

```typescript
.use(rehypeGifControls, {
  security: {
    allowedDomains: ['mycdn.com', 'trusted-images.com'],
    sanitizeAttributes: true,
  },
});
```

#### Custom Styling

```typescript
.use(rehypeGifControls, {
  gifPlayer: {
    wrapperClasses: ['my-gif-container', 'interactive'],
    gifClasses: ['responsive-gif'],
  },
  dataAttributes: {
    'data-analytics': 'gif-interaction',
  },
});
```

#### Disable Auto-features

```typescript
.use(rehypeGifControls, {
  gifPlayer: {
    autoplay: false,        // No auto-play
    clickToReplay: false,   // No click interaction
    preload: false,         // No preloading
  },
});
```

## CSS Styling

The plugin adds classes for easy styling:

```css
/* Wrapper container */
.gif-controls-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

/* GIF image element */
.gif-controls-image {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Loading state (when showLoader: true) */
.gif-controls-wrapper.loading::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Paused state styling */
.gif-controls-wrapper.paused::after {
  content: '▶';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
```

## Security Considerations

### Domain Validation

Restrict GIF sources to trusted domains:

```typescript
.use(rehypeGifControls, {
  security: {
    allowedDomains: ['cdn.mysite.com', 'images.trusted.com'],
  },
});
```

### Content Sanitization

Alt text and other attributes are automatically sanitized:

- Removes potentially dangerous characters (`<`, `>`, `'`, `"`)
- Limits attribute length to prevent DOS attacks
- Can be disabled with `sanitizeAttributes: false`

### Script Injection

The plugin can operate without injecting scripts:

```typescript
.use(rehypeGifControls, {
  injectScript: false, // Handle gifplayer.js loading yourself
});
```

## Performance Optimization

### Lazy Loading

All processed GIFs automatically get `loading="lazy"` attributes.

### Efficient Canvas Rendering

gifplayer.js converts GIFs to canvas elements for better performance:
- Reduces memory usage for large GIFs
- Provides frame-by-frame control
- Enables smooth play/pause functionality

### Bundle Size

- Plugin core: ~8KB minified
- gifplayer.js: ~3KB minified
- Total overhead: ~11KB for full functionality

## Browser Support

- **Modern browsers**: Full functionality with gifplayer.js
- **Legacy browsers**: Graceful degradation to standard GIF behavior
- **No JavaScript**: GIFs display normally

## Troubleshooting

### GIFs Not Being Processed

1. Check file extensions match your configuration
2. Verify domain whitelist if using security options
3. Ensure GIFs have proper `src` attributes

### Scripts Not Loading

1. Check network tab for 404s on gifplayer.js
2. Verify Content Security Policy allows script sources
3. Try using a custom `scriptUrl` if CDN is blocked

### Performance Issues

1. Enable `preload: false` for large GIFs
2. Consider reducing `playCount` for bandwidth savings
3. Use lazy loading with `loading="lazy"` (automatic)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT © [Benjamin Charity](https://github.com/benjamincharity)

## Related

- [rehype-semantic-images](https://github.com/benjamincharity/rehype-semantic-images) - Enhanced semantic image processing
- [rehype-scroll-to-top](https://github.com/benjamincharity/rehype-scroll-to-top) - Auto-generated scroll-to-top links
- [gifplayer.js](https://github.com/rubentd/gifplayer) - Underlying GIF control library