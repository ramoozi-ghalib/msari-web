/**
 * B-0.3 + B-0.4 + B-0.5 — Shadow comparison harness with structured parity/diff
 * reporting and latency/payload instrumentation (Phase 3A migration prep).
 *
 * Contract:
 * - Runs direct (current) + API (candidate) paths, ALWAYS serves direct.
 * - Never throws: failures are captured as structured entries.
 * - Never logs secrets (all output passes through redact()).
 * - Read amplification methodology: records wall latency + response payload bytes
 *   for both paths. Firestore document-read counts are NOT observable from here;
 *   they come from code-path analysis (modeled) or Firestore telemetry (measured).
 *   The report labels each number explicitly.
 */

import { redact, safeLog } from './log';

export interface Instrumented<T> {
  result?: T;
  error?: string;
  ms: number;
  bytes: number;
}

/** B-0.5 — time + payload-size a thunk. Source label: MEASURED (local). */
export async function instrumented<T>(label: string, fn: () => Promise<T>): Promise<Instrumented<T>> {
  const started = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - started;
    let bytes = 0;
    try {
      bytes = Buffer.byteLength(JSON.stringify(result) ?? '', 'utf8');
    } catch {
      bytes = -1; // not JSON-serializable; size unknown
    }
    return { result, ms, bytes };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), ms: Date.now() - started, bytes: -1 };
  }
}

export interface FieldDiff {
  path: string;
  before: unknown;
  after: unknown;
}

/** Deterministic deep diff over JSON-shaped values (arrays compared by index). */
export function diffJson(before: unknown, after: unknown, path = '$', out: FieldDiff[] = [], limit = 50): FieldDiff[] {
  if (out.length >= limit) return out;
  if (Object.is(before, after)) return out;
  if (
    before !== null && after !== null &&
    typeof before === 'object' && typeof after === 'object' &&
    Array.isArray(before) === Array.isArray(after)
  ) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const k of keys) {
      diffJson(
        (before as Record<string, unknown>)[k],
        (after as Record<string, unknown>)[k],
        `${path}.${k}`,
        out,
        limit
      );
      if (out.length >= limit) break;
    }
    return out;
  }
  out.push({ path, before: redact(before), after: redact(after) });
  return out;
}

export interface ShadowReport {
  phase: string;
  route: string;
  match: boolean;
  diffCount: number;
  diffs: FieldDiff[];
  direct: { ms: number; bytes: number; error?: string };
  api: { ms: number; bytes: number; error?: string };
  measuredAt: string;
}

/**
 * B-0.3 — run both paths, serve direct, report parity. Returns the DIRECT result
 * for serving plus the structured report for logging/review.
 */
export async function shadowCompare<T>(input: {
  phase: string;
  route: string;
  direct: () => Promise<T>;
  api: () => Promise<unknown>;
  normalize?: (value: unknown) => unknown;
  timeoutMs?: number;
}): Promise<{ served: T | undefined; report: ShadowReport; serveError?: string }> {
  const withTimeout = <V>(p: Promise<V>, ms: number, label: string): Promise<V> =>
    Promise.race([
      p,
      new Promise<V>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)),
    ]);

  const timeoutMs = input.timeoutMs ?? 15000;
  const [direct, api] = await Promise.all([
    instrumented('direct', () => withTimeout(input.direct(), timeoutMs, 'direct')),
    instrumented('api', () => withTimeout(input.api(), timeoutMs, 'api')),
  ]);

  let diffs: FieldDiff[] = [];
  let match = false;
  if (direct.error || api.error) {
    diffs = [{ path: '$._transport', before: direct.error ?? null, after: api.error ?? null }];
  } else {
    const norm = input.normalize ?? ((v: unknown) => v);
    try {
      diffs = diffJson(norm(direct.result), norm(api.result));
      match = diffs.length === 0;
    } catch (error) {
      diffs = [{ path: '$._normalize', before: null, after: error instanceof Error ? error.message : String(error) }];
    }
  }

  const report: ShadowReport = {
    phase: input.phase,
    route: input.route,
    match,
    diffCount: diffs.length,
    diffs,
    direct: { ms: direct.ms, bytes: direct.bytes, error: direct.error },
    api: { ms: api.ms, bytes: api.bytes, error: api.error },
    measuredAt: new Date().toISOString(),
  };
  safeLog('shadow-compare', { ...report, diffs: diffs.slice(0, 10) });
  return { served: direct.result, report, serveError: direct.error };
}
