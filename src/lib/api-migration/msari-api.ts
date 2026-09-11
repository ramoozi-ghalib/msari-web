/**
 * B-0.1 — Server-only MSARI API credential plumbing (Phase 3A migration prep).
 *
 * RULES (binding):
 * - Reads ONLY non-public env: MSARI_API_KEY / MSARI_API_BASE_URL.
 * - NEVER reads NEXT_PUBLIC_API_KEY (browser-exposed legacy key).
 * - Throws when bundled/executed in the browser.
 * - No behavior change: nothing in the app imports this module yet except
 *   the B-0 shadow harness and parity scripts.
 */

const API_KEY_ENV = 'MSARI_API_KEY';
const API_BASE_ENV = 'MSARI_API_BASE_URL';
const DEFAULT_BASE_URL = 'https://us-central1-msariapp-v2.cloudfunctions.net/api/v1';

function assertServerOnly(caller: string): void {
  if (typeof window !== 'undefined') {
    throw new Error(`[api-migration] ${caller} is server-only and must never run in the browser.`);
  }
}

export function getServerApiKey(): string {
  assertServerOnly('getServerApiKey');
  const key = process.env[API_KEY_ENV];
  if (!key) {
    throw new Error(
      `[api-migration] Missing ${API_KEY_ENV}. It is intentionally NOT set: ` +
        'no migration phase is active. Do not fall back to NEXT_PUBLIC_API_KEY.'
    );
  }
  return key;
}

export function getServerApiBaseUrl(): string {
  assertServerOnly('getServerApiBaseUrl');
  return (process.env[API_BASE_ENV] || DEFAULT_BASE_URL).replace(/\/$/, '');
}

/** Redacted descriptor for logs/reports — never contains the secret. */
export function describeServerCredential(): { configured: boolean; source: string } {
  assertServerOnly('describeServerCredential');
  return { configured: Boolean(process.env[API_KEY_ENV]), source: API_KEY_ENV };
}
