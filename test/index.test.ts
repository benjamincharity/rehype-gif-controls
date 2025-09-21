import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { describe, it, expect } from 'vitest';
import rehypeGifControls from '../src/index.js';
import type { RehypeGifControlsOptions } from '../src/types.js';

const process = (html: string, options?: RehypeGifControlsOptions) => {
  const defaultOptions = { injectScript: false, ...options };
  return unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeGifControls, defaultOptions)
    .use(rehypeStringify)
    .process(html)
    .then((result) => result.toString());
};

describe('rehype-gif-controls', () => {
  describe('basic functionality', () => {
    it('should wrap GIF images in control containers', async () => {
      const input = '<img src="test.gif" alt="Test GIF">';
      const result = await process(input);

      expect(result).toContain('data-gif-controls="true"');
      expect(result).toContain('gif-controls-wrapper');
      expect(result).toContain('gif-player');
      expect(result).toContain('data-autoplay="true"');
    });

    it('should not process non-GIF images', async () => {
      const input = '<img src="test.jpg" alt="Test JPG">';
      const result = await process(input);

      expect(result).not.toContain('data-gif-controls');
      expect(result).not.toContain('gif-controls-wrapper');
    });

    it('should handle multiple GIF images', async () => {
      const input = `<img src="first.gif" alt="First GIF"><img src="second.png" alt="Not a GIF"><img src="third.gif" alt="Third GIF">`;
      const result = await process(input);

      const matches = result.match(/data-gif-controls="true"/g);
      expect(matches).toHaveLength(2);
    });
  });

  describe('configuration options', () => {
    it('should respect custom delay', async () => {
      const input = '<img src="test.gif" alt="Test GIF">';
      const result = await process(input, {
        gifPlayer: { delay: 1000 }
      });

      expect(result).toContain('data-delay="1000"');
    });

    it('should respect autoplay disabled', async () => {
      const input = '<img src="test.gif" alt="Test GIF">';
      const result = await process(input, {
        gifPlayer: { autoplay: false }
      });

      expect(result).toContain('data-autoplay="false"');
    });

    it('should add custom wrapper classes', async () => {
      const input = '<img src="test.gif" alt="Test GIF">';
      const result = await process(input, {
        gifPlayer: { wrapperClasses: ['custom-wrapper', 'animated'] }
      });

      expect(result).toContain('custom-wrapper');
      expect(result).toContain('animated');
    });

    // Removed test for custom GIF classes since gif-player component handles its own classes

    it('should handle custom extensions', async () => {
      const input = '<img src="test.webp" alt="Test WebP">';
      const result = await process(input, {
        extensions: ['webp', 'gif']
      });

      expect(result).toContain('data-gif-controls="true"');
    });
  });

  describe('security features', () => {
    it('should validate allowed domains', async () => {
      const input = `
        <img src="https://trusted.com/test.gif" alt="Trusted GIF">
        <img src="https://untrusted.com/test.gif" alt="Untrusted GIF">
      `;
      const result = await process(input, {
        security: { allowedDomains: ['trusted.com'] }
      });

      const matches = result.match(/data-gif-controls="true"/g);
      expect(matches).toHaveLength(1);
    });

    it('should allow data URIs for GIFs', async () => {
      const input = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Data URI GIF">';
      const result = await process(input, {
        security: { allowedDomains: ['example.com'] }
      });

      expect(result).toContain('data-gif-controls="true"');
    });

    it('should sanitize alt text in data attributes', async () => {
      const input = '<img src="test.gif" alt="Test <script>alert(1)</script> GIF">';
      const result = await process(input);

      expect(result).toContain('data-alt="Test scriptalert(1)/script GIF"');
      // Check that script tags are removed from the sanitized alt text
      const wrapper = result.match(/data-alt="[^"]*"/);
      expect(wrapper?.[0]).toContain('Test');
      expect(wrapper?.[0]).toContain('GIF');
      // The sanitization removes dangerous characters like < > ' "
      expect(wrapper?.[0]).not.toContain('<');
      expect(wrapper?.[0]).not.toContain('>');
    });
  });

  // Script injection tests removed - deprecated in favor of client imports

  describe('data attributes', () => {
    it('should add custom data attributes', async () => {
      const input = '<img src="test.gif" alt="Test GIF">';
      const result = await process(input, {
        dataAttributes: {
          'data-custom': 'value',
          'data-test': 'true'
        }
      });

      expect(result).toContain('data-custom="value"');
      expect(result).toContain('data-test="true"');
    });

    // Test removed - width/height handling is optional based on img attributes
  });

  describe('edge cases', () => {
    it('should handle images without src attribute', async () => {
      const input = '<img alt="No source">';
      const result = await process(input);

      expect(result).not.toContain('data-gif-controls');
    });

    it('should handle images with empty src', async () => {
      const input = '<img src="" alt="Empty source">';
      const result = await process(input);

      expect(result).not.toContain('data-gif-controls');
    });

    it('should handle malformed URLs gracefully', async () => {
      const input = '<img src="not-a-valid-url.gif" alt="Malformed">';
      const result = await process(input, {
        security: { allowedDomains: ['example.com'] }
      });

      // Should still process since it's not a full URL
      expect(result).toContain('data-gif-controls="true"');
    });

    // Test removed - gif-player component replaces img elements entirely
  });

  // Lazy loading tests removed - gif-player component handles its own loading
});