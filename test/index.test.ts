import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { describe, it, expect } from 'vitest';
import rehypeGifControls from '../src/index.js';
import type { RehypeGifControlsOptions } from '../src/types.js';

const process = (html: string, options?: RehypeGifControlsOptions) => {
  const defaultOptions = { injectScript: false, ...options }; // Default to false in tests for cleaner output
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
      expect(result).toContain('gif-controls');
      expect(result).toContain('gif-player');
      expect(result).toContain('data-gif-controls-autoplay="true"');
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

      expect(result).toContain('data-gif-controls-delay="1000"');
    });

    it('should respect autoplay disabled', async () => {
      const input = '<img src="test.gif" alt="Test GIF">';
      const result = await process(input, {
        gifPlayer: { autoplay: false }
      });

      expect(result).toContain('data-gif-controls-autoplay="false"');
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

      expect(result).toContain('data-gif-controls-alt="Test alert(1) GIF"');
      // Check that script tags are removed from the sanitized alt text
      const wrapper = result.match(/data-gif-controls-alt="[^"]*"/);
      expect(wrapper?.[0]).toContain('Test');
      expect(wrapper?.[0]).toContain('GIF');
      // The sanitization removes dangerous characters like < > ' "
      expect(wrapper?.[0]).not.toContain('<');
      expect(wrapper?.[0]).not.toContain('>');
    });

    it('should prevent XSS attacks through alt attribute', async () => {
      const xssVectors = [
        '<img src="test.gif" alt="<script>alert(1)</script>">',
        '<img src="test.gif" alt="javascript:alert(1)">',
        '<img src="test.gif" alt="&lt;script&gt;alert(1)&lt;/script&gt;">',
        '<img src="test.gif" alt="onclick=alert(1)">',
        '<img src="test.gif" alt="data:text/html,<script>alert(1)</script>">',
        '<img src="test.gif" alt="onload=alert(1)">',
        '<img src="test.gif" alt="<iframe src=javascript:alert(1)>">',
      ];

      for (const input of xssVectors) {
        const result = await process(input);
        // Ensure no dangerous patterns remain
        expect(result).not.toMatch(/<script|javascript:|onclick=|onload=|<iframe/i);
        expect(result).not.toMatch(/data:text\/html/i);
        expect(result).not.toMatch(/&lt;script|&gt;/i);
      }
    });

    it('should handle malicious file extensions safely', async () => {
      const maliciousInputs = [
        { input: '<img src="test.gif?param=value" alt="Test">', shouldProcess: true },
        { input: '<img src="test.gif#fragment" alt="Test">', shouldProcess: true },
        { input: '<img src="test.gif/../../../etc/passwd" alt="Test">', shouldProcess: false }, // Path traversal - should not be processed
      ];

      for (const { input, shouldProcess } of maliciousInputs) {
        const result = await process(input);
        if (shouldProcess) {
          // Should process as GIF but sanitize dangerous content
          expect(result).toContain('data-gif-controls="true"');
        } else {
          // Should not process suspicious URLs
          expect(result).not.toContain('data-gif-controls="true"');
        }
      }
    });

    it('should prevent ReDoS attacks in file extension parsing', async () => {
      // Test with potentially problematic URLs that could cause ReDoS
      const problematicUrls = [
        '<img src="test' + 'a'.repeat(10000) + '.gif" alt="Test">',
        '<img src="test.gif' + '?param=' + 'b'.repeat(10000) + '" alt="Test">',
        '<img src="data:image/gif;base64,' + 'A'.repeat(10000) + '" alt="Test">',
      ];

      for (const input of problematicUrls) {
        const startTime = Date.now();
        const result = await process(input);
        const endTime = Date.now();

        // Should complete quickly (under 1 second)
        expect(endTime - startTime).toBeLessThan(1000);
        expect(result).toContain('data-gif-controls="true"');
      }
    });
  });

  describe('secure script injection', () => {
    it('should inject script when enabled and GIFs found', async () => {
      const input = '<html><head></head><body><img src="test.gif" alt="Test"></body></html>';
      const result = await process(input, { injectScript: true });

      expect(result).toContain('data-gif-controls-script="true"');
      expect(result).toContain('src="./lib/client.js"');
      expect(result).toContain('type="module"');
    });

    it('should not inject script when disabled', async () => {
      const input = '<html><head></head><body><img src="test.gif" alt="Test"></body></html>';
      const result = await process(input, { injectScript: false });

      expect(result).not.toContain('data-gif-controls-script');
      expect(result).not.toContain('client.js');
    });

    it('should not inject script if no GIFs found', async () => {
      const input = '<html><head></head><body><img src="test.jpg" alt="Test"></body></html>';
      const result = await process(input, { injectScript: true });

      expect(result).not.toContain('data-gif-controls-script');
    });

    it('should only inject script once for multiple GIFs', async () => {
      const input = '<html><head></head><body><img src="first.gif" alt="First"><img src="second.gif" alt="Second"></body></html>';
      const result = await process(input, { injectScript: true });

      const scriptMatches = result.match(/data-gif-controls-script="true"/g);
      expect(scriptMatches).toHaveLength(1);
    });

    it('should inject secure script attributes only', async () => {
      const input = '<html><head></head><body><img src="test.gif" alt="Test"></body></html>';
      const result = await process(input, { injectScript: true });

      // Should only allow bundled script path
      expect(result).toContain('src="./lib/client.js"');
      expect(result).not.toContain('http://');
      expect(result).not.toContain('https://');
      expect(result).not.toContain('javascript:');
    });
  });

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

  describe('security hardening', () => {
    it('should validate file extensions securely', async () => {
      const maliciousExtensions = [
        '<img src="test.exe.gif" alt="Test">',
        '<img src="test.gif.exe" alt="Test">',
        '<img src="test.gif.php" alt="Test">',
        '<img src="test.gif.js" alt="Test">',
      ];

      for (const input of maliciousExtensions) {
        const result = await process(input);
        // Only the .gif one should be processed
        if (input.includes('.gif.')) {
          expect(result).not.toContain('data-gif-controls="true"');
        } else {
          expect(result).toContain('data-gif-controls="true"');
        }
      }
    });

    it('should handle data URIs securely', async () => {
      const validDataUri = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Valid GIF">';
      const invalidDataUris = [
        '<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" alt="HTML Data URI">',
        '<img src="data:application/javascript;base64,YWxlcnQoMSk=" alt="JS Data URI">',
        '<img src="data:image/svg+xml;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" alt="SVG Data URI">',
      ];

      // Valid GIF data URI should be processed
      const validResult = await process(validDataUri);
      expect(validResult).toContain('data-gif-controls="true"');

      // Invalid data URIs should not be processed
      for (const input of invalidDataUris) {
        const result = await process(input);
        expect(result).not.toContain('data-gif-controls="true"');
      }
    });

    it('should prevent attribute injection', async () => {
      const maliciousAttributes = [
        '<img src="test.gif" alt="test" onclick="alert(1)">',
        '<img src="test.gif" alt="test" onerror="alert(1)">',
        '<img src="test.gif" alt="test" style="background:url(javascript:alert(1))">',
        '<img src="test.gif" alt="test" data-custom="<script>alert(1)</script>">',
      ];

      for (const input of maliciousAttributes) {
        const result = await process(input);
        // Should process the GIF but not include dangerous attributes
        expect(result).toContain('data-gif-controls="true"');
        expect(result).not.toMatch(/onclick|onerror|javascript:/i);
      }
    });

    it('should limit attribute length to prevent memory exhaustion', async () => {
      const longAlt = 'a'.repeat(1000);
      const input = `<img src="test.gif" alt="${longAlt}">`;
      const result = await process(input);

      // Should truncate to 500 characters
      const altMatch = result.match(/data-gif-controls-alt="([^"]*)"/);
      if (altMatch && altMatch[1]) {
        expect(altMatch[1].length).toBeLessThanOrEqual(500);
      }
    });
  });
});