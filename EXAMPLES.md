# Usage Examples

This document provides practical examples for using `@benjc/rehype-gif-controls` with different frameworks and setups.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Framework Examples](#framework-examples)
  - [Next.js](#nextjs)
  - [Astro](#astro)
  - [Docusaurus](#docusaurus)
  - [Gatsby](#gatsby)
  - [SvelteKit](#sveltekit)
- [Configuration Examples](#configuration-examples)
- [CSS Examples](#css-examples)
- [Advanced Usage](#advanced-usage)

## Basic Setup

### 1. Install the Package

```bash
npm install @benjc/rehype-gif-controls
```

### 2. Basic Unified Setup

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeGifControls from '@benjc/rehype-gif-controls';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeGifControls)
  .use(rehypeStringify);

const markdown = `
# My Post
![Awesome animation](./demo.gif)
`;

const result = await processor.process(markdown);
console.log(String(result));
```

### 3. Client-Side Initialization

```typescript
// Import in your main client file
import '@benjc/rehype-gif-controls/client';
```

## Framework Examples

### Next.js

#### App Router (Next.js 13+)

```typescript
// app/layout.tsx
import '@benjc/rehype-gif-controls/client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```javascript
// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      ['@benjc/rehype-gif-controls', {
        gifPlayer: {
          delay: 1000,
          autoplay: true,
        },
      }],
    ],
  },
});

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
});
```

#### Pages Router (Next.js 12 and below)

```typescript
// pages/_app.tsx
import '@benjc/rehype-gif-controls/client';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

#### With next-mdx-remote

```typescript
// pages/blog/[slug].tsx
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeGifControls from '@benjc/rehype-gif-controls';

export async function getStaticProps({ params }) {
  const source = getPostContent(params.slug);
  const mdxSource = await serialize(source, {
    mdxOptions: {
      rehypePlugins: [
        ['@benjc/rehype-gif-controls', {
          gifPlayer: {
            autoplay: true,
            delay: 500,
          },
        }],
      ],
    },
  });

  return { props: { source: mdxSource } };
}

export default function BlogPost({ source }) {
  return (
    <div>
      <MDXRemote {...source} />
    </div>
  );
}
```

### Astro

#### Basic Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import rehypeGifControls from '@benjc/rehype-gif-controls';

export default defineConfig({
  markdown: {
    rehypePlugins: [
      ['@benjc/rehype-gif-controls', {
        gifPlayer: {
          delay: 500,
          autoplay: true,
        },
      }],
    ],
  },
});
```

#### With Custom CSS

```astro
---
// src/layouts/Layout.astro
import '@benjc/rehype-gif-controls/client';
---

<html lang="en">
  <head>
    <style>
      .gif-controls {
        margin: 2rem 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
    </style>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Docusaurus

#### Configuration

```javascript
// docusaurus.config.js
const config = {
  title: 'My Site',
  presets: [
    [
      'classic',
      {
        docs: {
          beforeDefaultRehypePlugins: [
            ['@benjc/rehype-gif-controls', {
              gifPlayer: {
                autoplay: true,
                delay: 1000,
              },
              security: {
                allowedDomains: ['cdn.mysite.com'],
              },
            }],
          ],
        },
        blog: {
          beforeDefaultRehypePlugins: [
            ['@benjc/rehype-gif-controls', {
              gifPlayer: {
                autoplay: false, // Disable autoplay in blog
              },
            }],
          ],
        },
      },
    ],
  ],
  clientModules: [
    require.resolve('@benjc/rehype-gif-controls/client'),
  ],
};

module.exports = config;
```

#### Custom CSS

```css
/* src/css/custom.css */
.gif-controls {
  margin: 1.5rem auto;
  max-width: 100%;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: var(--ifm-border-radius);
}

.gif-controls[data-gif-controls-autoplay="false"] {
  border-style: dashed;
  opacity: 0.8;
}
```

### Gatsby

#### Configuration

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        rehypePlugins: [
          ['@benjc/rehype-gif-controls', {
            gifPlayer: {
              autoplay: true,
              delay: 500,
            },
          }],
        ],
      },
    },
  ],
};
```

#### Client Initialization

```javascript
// gatsby-browser.js
import '@benjc/rehype-gif-controls/client';
```

### SvelteKit

#### Configuration

```javascript
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // MDX setup would go here
});
```

#### Client Initialization

```typescript
// src/app.html or src/app.ts
import '@benjc/rehype-gif-controls/client';
```

## Configuration Examples

### Security-First Setup

```typescript
.use(rehypeGifControls, {
  security: {
    allowedDomains: [
      'cdn.mysite.com',
      'images.unsplash.com',
      'media.giphy.com',
    ],
    sanitizeAttributes: true,
  },
  gifPlayer: {
    autoplay: false, // Manual control only
    preload: false,  // Don't preload for security
  },
});
```

### Performance-Optimized

```typescript
.use(rehypeGifControls, {
  gifPlayer: {
    preload: false,     // Don't preload frames
    showLoader: true,   // Show loading indicator
    autoplay: false,    // Manual start only
    delay: 0,           // No delay when manually started
  },
  dataAttributes: {
    'data-loading': 'lazy', // Custom attribute
  },
});
```

### Custom Styling Classes

```typescript
.use(rehypeGifControls, {
  gifPlayer: {
    wrapperClasses: [
      'media-container',
      'interactive-media',
      'rounded-lg',
    ],
    gifClasses: ['responsive-gif'],
  },
  dataAttributes: {
    'data-component': 'gif-player',
    'data-analytics': 'media-interaction',
  },
});
```

### Content Management System

```typescript
// For CMS with untrusted content
.use(rehypeGifControls, {
  security: {
    allowedDomains: ['cdn.contentful.com', 'assets.strapi.io'],
    sanitizeAttributes: true,
  },
  gifPlayer: {
    autoplay: true,
    delay: 2000,        // Delay to improve perceived performance
    preload: true,
    showLoader: true,
  },
  extensions: ['gif', 'webp'], // Support animated WebP
});
```

## CSS Examples

### Basic Styling

```css
/* Add spacing and styling to GIF containers */
.gif-controls {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #f8f9fa;
}

/* Style the gif-player element */
.gif-controls__player {
  display: block;
  width: 100%;
}
```

### Responsive Design

```css
/* Mobile-first responsive design */
.gif-controls {
  margin: 1rem 0;
}

/* Tablet and up */
@media (min-width: 768px) {
  .gif-controls {
    margin: 1.5rem 0;
    border-radius: 12px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .gif-controls {
    margin: 2rem 0;
  }
}

/* Large screens */
@media (min-width: 1200px) {
  .gif-controls {
    max-width: 800px;
    margin: 2rem auto;
  }
}
```

### Dark Mode Support

```css
/* Light mode (default) */
.gif-controls {
  border: 1px solid #e1e5e9;
  background: #ffffff;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .gif-controls {
    border: 1px solid #444;
    background: #1a1a1a;
  }
}

/* CSS custom properties approach */
:root {
  --gif-border: #e1e5e9;
  --gif-background: #ffffff;
}

[data-theme='dark'] {
  --gif-border: #444;
  --gif-background: #1a1a1a;
}

.gif-controls {
  border: 1px solid var(--gif-border);
  background: var(--gif-background);
}
```

### State-Based Styling

```css
/* Style based on autoplay state */
.gif-controls[data-gif-controls-autoplay="true"] {
  border: 2px solid #28a745;
}

.gif-controls[data-gif-controls-autoplay="false"] {
  border: 2px dashed #6c757d;
}

/* Style based on loading state */
.gif-controls[data-gif-controls-show-loader="true"]:not([data-initialized]) {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gif-controls[data-gif-controls-show-loader="true"]:not([data-initialized])::before {
  content: "Loading GIF...";
  color: #6c757d;
  font-style: italic;
}
```

### Custom Animations

```css
/* Fade in animation */
.gif-controls {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.gif-controls[data-initialized] {
  opacity: 1;
  transform: translateY(0);
}

/* Hover effects */
.gif-controls:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
```

### Grid Layout

```css
/* Grid layout for multiple GIFs */
.content-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.gif-controls {
  margin: 0; /* Remove default margin in grid */
  height: fit-content;
}
```

## Advanced Usage

### Dynamic Content Loading

```typescript
// For dynamically loaded content
import { initGifControls } from '@benjc/rehype-gif-controls/client';

// After loading new content
async function loadMoreContent() {
  const response = await fetch('/api/more-content');
  const html = await response.text();

  document.getElementById('content').innerHTML += html;

  // Re-initialize GIF controls for new content
  initGifControls();
}
```

### React Hook

```typescript
import { useEffect } from 'react';
import { initGifControls } from '@benjc/rehype-gif-controls/client';

export function useGifControls() {
  useEffect(() => {
    initGifControls();
  }, []);

  const reinitialize = () => {
    initGifControls();
  };

  return { reinitialize };
}

// Usage in component
function BlogPost({ content }) {
  const { reinitialize } = useGifControls();

  useEffect(() => {
    reinitialize();
  }, [content, reinitialize]);

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

### Vue Composable

```typescript
// composables/useGifControls.ts
import { onMounted, onUpdated } from 'vue';
import { initGifControls } from '@benjc/rehype-gif-controls/client';

export function useGifControls() {
  const initialize = () => {
    initGifControls();
  };

  onMounted(initialize);
  onUpdated(initialize);

  return { initialize };
}
```

### Analytics Integration

```typescript
// Track GIF interactions
.use(rehypeGifControls, {
  dataAttributes: {
    'data-analytics': 'gif-interaction',
    'data-component': 'interactive-media',
  },
});
```

```javascript
// Client-side analytics
document.addEventListener('gif-loaded', (event) => {
  analytics.track('GIF Loaded', {
    src: event.detail.src,
    component: 'gif-controls',
  });
});

document.addEventListener('gif-frame', (event) => {
  // Track frame changes for engagement metrics
  analytics.track('GIF Frame Change', {
    frame: event.detail,
  });
});
```

### Custom Event Handling

```javascript
// Listen for gif-player events
document.addEventListener('gif-loaded', (event) => {
  console.log('GIF loaded:', event.detail);
});

document.addEventListener('gif-frame', (event) => {
  console.log('Frame changed:', event.detail);
});
```

### Intersection Observer Integration

```javascript
// Pause GIFs when out of viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const gifPlayer = entry.target.querySelector('gif-player');
    if (gifPlayer) {
      if (entry.isIntersecting) {
        gifPlayer.setAttribute('play', '');
      } else {
        gifPlayer.removeAttribute('play');
      }
    }
  });
});

// Observe all gif-controls
document.querySelectorAll('.gif-controls').forEach((el) => {
  observer.observe(el);
});
```

This comprehensive example guide should help users implement the package in various scenarios and frameworks while leveraging all the BEM classes and new features we've implemented.