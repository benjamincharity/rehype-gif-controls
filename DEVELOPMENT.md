# Local Development & Testing Guide

## Setup for Local Testing with Your Blog

### Option 1: Using npm link (Recommended)

The plugin is already built and linked! Now in your blog project:

```bash
# Navigate to your blog project
cd /path/to/your/blog

# Link the local plugin
npm link @benjc/rehype-gif-controls
```

### Option 2: Direct File Path (Alternative)

In your blog's `package.json`, you can also reference the local path:

```json
{
  "dependencies": {
    "@benjc/rehype-gif-controls": "file:/Users/[user]/code/open-source/rehype-gif-controls"
  }
}
```

## Adding to Your Blog Configuration

### For Next.js with MDX

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
          autoplay: true,
        },
        security: {
          allowedDomains: [], // Empty = allow all domains
        },
      }],
    ],
  },
});

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
});
```

### For Astro

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeGifControls from '@benjc/rehype-gif-controls';

export default defineConfig({
  integrations: [
    mdx({
      rehypePlugins: [
        [rehypeGifControls, {
          gifPlayer: {
            playCount: 1,
            clickToReplay: true,
          },
        }],
      ],
    }),
  ],
});
```

### For Gatsby

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        rehypePlugins: [
          [require('@benjc/rehype-gif-controls'), {
            gifPlayer: {
              playCount: 3,
              delay: 500,
            },
          }],
        ],
      },
    },
  ],
};
```

## Testing Your Setup

### 1. Create a Test MDX/Markdown File

Create a test file in your blog with some GIFs:

```markdown
# GIF Controls Test

Here are some test GIFs:

![Loading Animation](https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif)

![React Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/120px-React-icon.svg.png)

![Another Animation](https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif)
```

### 2. Expected Behavior

- **GIF images** should be wrapped in containers with `gif-controls-wrapper` class
- **Non-GIF images** (like the PNG) should remain unchanged
- **Scripts** should be automatically injected into the page
- **Console** should show no errors related to the plugin

### 3. Inspect the HTML Output

Look for this structure in your browser dev tools:

```html
<div class="gif-controls-wrapper" data-gif-controls="true" data-play-count="2" data-autoplay="true">
  <img src="animation.gif" class="gif-controls-image" loading="lazy" alt="Loading Animation">
</div>

<script src="https://cdn.jsdelivr.net/npm/gifplayer@0.3.3/dist/gifplayer.min.js" async defer></script>
<script>/* Initialization code */</script>
```

## Development Workflow

### Making Changes

1. **Edit source files** in `/src/`
2. **Rebuild the plugin**:
   ```bash
   cd /Users/bc/code/open-source/rehype-gif-controls
   npm run build
   ```
3. **Restart your blog's dev server** to pick up changes

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Format code
npm run format
```

## Debugging Common Issues

### Plugin Not Running

1. **Check blog restart** - Did you restart your dev server?
2. **Verify npm link** - Run `npm ls @benjc/rehype-gif-controls` in your blog
3. **Check configuration** - Ensure plugin is properly added to rehype plugins array

### GIFs Not Being Processed

1. **File extensions** - Only `.gif` files are processed by default
2. **Domain security** - Check if `allowedDomains` is blocking your GIFs
3. **Console warnings** - Look for plugin warnings in browser console

### Scripts Not Loading

1. **CSP headers** - Check if Content Security Policy blocks the CDN
2. **Network issues** - Verify gifplayer.js loads in Network tab
3. **Custom script URL** - Try using a different CDN or local file

### TypeScript Errors in Your Blog

If using TypeScript, you might need to add module declaration:

```typescript
// types/rehype-gif-controls.d.ts
declare module '@benjc/rehype-gif-controls' {
  import type { Plugin } from 'unified';
  import type { Root } from 'hast';

  interface RehypeGifControlsOptions {
    gifPlayer?: {
      playCount?: number;
      autoplay?: boolean;
      clickToReplay?: boolean;
      // ... other options
    };
    // ... other config
  }

  const rehypeGifControls: Plugin<[RehypeGifControlsOptions?], Root>;
  export default rehypeGifControls;
}
```

## Test Configuration Examples

### Minimal Setup
```javascript
rehypeGifControls // Uses all defaults
```

### Custom Play Count
```javascript
[rehypeGifControls, {
  gifPlayer: { playCount: 3 }
}]
```

### Security-Focused
```javascript
[rehypeGifControls, {
  security: {
    allowedDomains: ['yourdomain.com', 'trusted-cdn.com']
  }
}]
```

### No Script Injection
```javascript
[rehypeGifControls, {
  injectScript: false // Handle gifplayer.js yourself
}]
```

## Cleaning Up

When you're done testing:

```bash
# In your blog project
npm unlink @benjc/rehype-gif-controls

# In the plugin project
npm unlink -g @benjc/rehype-gif-controls
```