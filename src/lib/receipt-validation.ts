/**
 * src/lib/receipt-validation.ts
 *
 * [F4 CLOSURE] Server-side validation for payment receipt uploads.
 *
 * Threat model addressed:
 *   1. Memory-exhaustion via multi-MB base64 payloads      -> max byte limit
 *   2. Malicious file disguised as image                   -> MIME allowlist
 *   3. Content that does not match its declared MIME type  -> magic-byte check
 *   4. Non-image payloads entirely                         -> data:image/ prefix
 *
 * This module is dependency-free (no Firestore/Next imports) so it can be
 * unit-tested directly. It enforces the boundary INSIDE msari_web; it does
 * not alter any Operational API contract (no booking API exists — proven).
 */

/** Maximum accepted receipt size: 2 MB (binary, after base64 decode). */
export const RECEIPT_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Maximum accepted base64 string length (chars).
 * base64 inflates 4/3: ceil(2MB / 3) * 4 = 2,796,204 chars + "data:...;base64," prefix.
 */
export const RECEIPT_MAX_BASE64_CHARS = 3_000_000;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type ReceiptValidationResult =
  | { ok: true; contentType: string; buffer: Buffer }
  | { ok: false; reason: string };

/**
 * Validates a `data:image/...;base64,...` receipt payload end-to-end:
 * format -> declared MIME -> size -> magic bytes.
 */
export function validateReceiptDataUrl(
  dataUrl: string | undefined | null
): ReceiptValidationResult {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return { ok: false, reason: 'receipt-missing' };
  }

  // 1. Strict format check — must be an image data URL.
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!match) {
    return { ok: false, reason: 'receipt-format-invalid' };
  }

  const contentType = match[1].toLowerCase();
  const base64 = match[2];

  // 2. Declared MIME must be in the allowlist (no SVG — XSS vector, no GIF).
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(contentType)) {
    return { ok: false, reason: `receipt-mime-not-allowed:${contentType}` };
  }

  // 3. Size limit on the encoded payload (cheap check before decoding).
  if (base64.length > RECEIPT_MAX_BASE64_CHARS) {
    return { ok: false, reason: 'receipt-too-large' };
  }

  // 4. Decode and verify real byte size.
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) {
    return { ok: false, reason: 'receipt-empty' };
  }
  if (buffer.length > RECEIPT_MAX_BYTES) {
    return { ok: false, reason: 'receipt-too-large-decoded' };
  }

  // 5. Magic-byte check — content must actually BE the declared image type.
  if (!magicBytesMatch(buffer, contentType)) {
    return { ok: false, reason: `receipt-content-mismatch:${contentType}` };
  }

  return { ok: true, contentType, buffer };
}

function magicBytesMatch(buffer: Buffer, contentType: string): boolean {
  if (buffer.length < 12) return false;

  switch (contentType) {
    case 'image/jpeg':
      // FF D8 FF
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      // 89 50 4E 47 0D 0A 1A 0A
      return (
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
      );
    case 'image/webp':
      // "RIFF" .... "WEBP"
      return (
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
      );
    default:
      return false;
  }
}