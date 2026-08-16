/**
 * src/lib/sanitize.ts
 *
 * Minimal sanitization utilities for CMS content rendering.
 * Prevents XSS in dangerouslySetInnerHTML and JSON-LD injection.
 */

/**
 * Sanitizes HTML content from CMS to prevent stored XSS attacks.
 * Strips dangerous tags and attributes while preserving safe formatting.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return html
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handlers
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: and data: protocol hrefs
    .replace(/\s+href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')
    .replace(/\s+href\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '')
    .replace(/\s+src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')
    .replace(/\s+src\s*=\s*(?:"data:text\/html[^"]*"|'data:text\/html[^']*')/gi, '')
    // Remove iframe, object, embed, form tags
    .replace(/<\/?(?:iframe|object|embed|form|input|textarea|button)\b[^>]*>/gi, '')
    // Remove style attributes with expression/url
    .replace(/style\s*=\s*"[^"]*expression\s*\([^"]*"/gi, '')
    .replace(/style\s*=\s*'[^']*expression\s*\([^']*'/gi, '');
}

/**
 * Safely serializes JSON-LD structured data to prevent script injection.
 * JSON.stringify does NOT escape </script> sequences by default, which can
 * break out of the JSON-LD script block and inject arbitrary HTML.
 */
export function safeJsonLd(data: Record<string, any>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
