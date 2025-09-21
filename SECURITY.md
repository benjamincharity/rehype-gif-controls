# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

### 🔒 Comprehensive Security Hardening

Version 1.0.0 includes extensive security improvements designed to protect against common web vulnerabilities:

#### **XSS Protection**

- **Multi-layered sanitization**: Removes HTML tags, dangerous characters, and malicious patterns
- **JavaScript protocol blocking**: Prevents `javascript:` URLs and event handlers
- **HTML entity protection**: Blocks encoded attack vectors like `&lt;script&gt;`
- **Data URI validation**: Safely handles data URIs while preventing HTML content injection

#### **Secure Script Injection**

- **No arbitrary URLs**: Only bundled scripts can be injected - no external script loading
- **CSP-friendly**: Uses `type="module"` for modern Content Security Policy compatibility
- **Duplicate prevention**: Ensures scripts are only injected once per page
- **Integrity protection**: No external dependencies that could be compromised

#### **Input Validation**

- **File extension validation**: Uses safe string operations instead of regex (prevents ReDoS)
- **Domain whitelist support**: Restrict GIF sources to trusted domains
- **Attribute length limits**: Prevents memory exhaustion attacks
- **Safe property access**: Uses `getAttribute()` to prevent DOM clobbering

#### **Supply Chain Security**

- **Self-contained**: No external dependencies that could be compromised
- **Bundled components**: All GIF processing built-in, eliminating CDN risks
- **Version pinning**: Dependencies are locked to specific, audited versions

## Security Audit Results

### Fixed Vulnerabilities (v1.0.0)

| ID       | Severity | Issue                                          | Status         |
| -------- | -------- | ---------------------------------------------- | -------------- |
| VULN-001 | HIGH     | Information disclosure through console logging | ✅ **FIXED**   |
| VULN-002 | HIGH     | XSS via incomplete sanitization                | ✅ **FIXED**   |
| VULN-003 | HIGH     | Supply chain risk from unpinned dependencies   | ✅ **FIXED**   |
| VULN-004 | MEDIUM   | Unsafe TypeScript `any` types                  | ✅ **FIXED**   |
| VULN-005 | MEDIUM   | ReDoS in URL parsing regex                     | ✅ **FIXED**   |
| VULN-006 | MEDIUM   | DOM clobbering via dataset access              | ✅ **FIXED**   |
| VULN-007 | MEDIUM   | Arbitrary script injection                     | ✅ **SECURED** |

### Security Testing

The package includes comprehensive security tests covering:

- XSS attack vectors (HTML injection, JavaScript protocols, event handlers)
- ReDoS protection with large input strings
- File extension validation edge cases
- Data URI security handling
- Attribute injection prevention

## Reporting Security Vulnerabilities

**Please do not report security vulnerabilities through public GitHub issues.**

### Preferred Method

Send security reports to: **security@benjamincharity.com**

Include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested remediation (if known)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Regular updates**: Every 7 days until resolution
- **Resolution timeline**: Target 30 days for critical issues

### Scope

This security policy applies to:

- The main `@benjc/rehype-gif-controls` package
- Bundled client-side scripts
- Processing of user-provided content (GIF URLs, alt text, etc.)

**Out of scope**:

- Issues in dependencies beyond our control
- Vulnerabilities requiring physical access
- Social engineering attacks

## Security Best Practices

When using this plugin in production:

### Content Security Policy (CSP)

Recommended CSP directives:

```
Content-Security-Policy:
  script-src 'self' 'unsafe-inline';
  worker-src 'self' blob:;
  connect-src 'self' data:;
  img-src 'self' data: https:;
```

### Domain Whitelisting

For maximum security, restrict GIF sources:

```typescript
.use(rehypeGifControls, {
  security: {
    allowedDomains: ['your-cdn.com', 'trusted-images.com'],
    sanitizeAttributes: true, // Always keep enabled
  },
});
```

### Input Validation

When accepting user-provided GIF URLs:

```typescript
// Validate URLs before processing
function isValidGifUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.trusted-domain.com') &&
      url.toLowerCase().endsWith('.gif')
    );
  } catch {
    return false;
  }
}
```

### Monitoring

Monitor your application for:

- Failed GIF processing attempts (potential attacks)
- Unusual patterns in alt text or URLs
- Content Security Policy violations
- JavaScript errors related to gif-player initialization

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors will be acknowledged in release notes unless they prefer to remain anonymous.

---

**Last Updated**: January 2025
**Next Review**: July 2025
