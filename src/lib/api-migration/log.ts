/**
 * B-0.10 — Production-safe logging/redaction for migration tooling (Phase 3A).
 *
 * Never log: API secrets/keys, Bearer tokens, passwords, full user PII.
 * Allowed: key prefixes (last 4 chars max), partner IDs, booking numbers,
 * route/phase names, timings, counts, diff paths (never values containing secrets).
 */

const SECRET_KEYS = ['key', 'apikey', 'api_key', 'token', 'secret', 'password', 'authorization'];

export function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return SECRET_KEYS.some((s) => k.includes(s));
}

/** Recursively redact sensitive fields; truncate long strings; cap depth. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[truncated]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > 300 ? value.slice(0, 300) + '…[truncated]' : value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 25).map((v) => redact(v, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = isSensitiveKey(k) ? '[REDACTED]' : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

/** Show-once-safe credential descriptor: prefix + last-4 only, never the secret. */
export function describeCredential(prefix: string | null, configured: boolean): string {
  if (!configured) return 'unconfigured';
  if (!prefix) return 'configured';
  return `configured(prefix=${prefix.slice(0, 32)}…last4=${prefix.slice(-4)})`;
}

export function safeLog(event: string, fields: Record<string, unknown> = {}): void {
  console.info(JSON.stringify({ migration: event, ...(redact(fields) as Record<string, unknown>) }));
}
