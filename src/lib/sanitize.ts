/**
 * src/lib/sanitize.ts
 *
 * HTML sanitization for CMS content rendering.
 * Uses DOMPurify (isomorphic) — allowlist-based parsing, not regex matching.
 * Prevents XSS in dangerouslySetInnerHTML and JSON-LD injection.
 */
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content from CMS to prevent stored XSS attacks.
 * Same signature as before; implementation is now a real HTML parser with
 * an allowlist profile (scripts, event handlers, javascript:/data: URLs,
 * iframes/objects/embeds/forms all stripped by default).
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
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
