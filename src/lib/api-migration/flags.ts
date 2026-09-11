/**
 * B-0.2 + B-0.7 — Migration feature flags + direct-path lifecycle (Phase 3A).
 *
 * Modes: OFF → SHADOW → CANARY → ON → (VERIFICATION WINDOW) → REMOVE DIRECT PATH.
 * - OFF (default): current behavior, direct Firestore only. Safe default when unset.
 * - SHADOW: run both paths, serve direct, log diffs. No user impact.
 * - CANARY: serve API path to a fraction (see canaryRatio), direct otherwise.
 * - ON: serve API path to all; direct path still present but unused.
 * - REMOVE: follow-up release deletes the direct path (separate commit + gate).
 *
 * Rollback at any stage = set flag to OFF (or revert the phase commit).
 * A direct path surviving past its removal gate is a defect, not a fallback.
 */

export type MigrationPhase = 'cities' | 'hotels-listing' | 'hotel-detail' | 'rooms' | 'pricing' | 'booking' | 'payment';
export type MigrationMode = 'OFF' | 'SHADOW' | 'CANARY' | 'ON';

const VALID_MODES: MigrationMode[] = ['OFF', 'SHADOW', 'CANARY', 'ON'];

function readMode(envName: string): MigrationMode | null {
  const raw = (process.env[envName] || '').trim().toUpperCase();
  return (VALID_MODES as string[]).includes(raw) ? (raw as MigrationMode) : null;
}

/** Global default for all phases (env MSARI_API_MODE, default OFF). */
export function getGlobalMigrationMode(): MigrationMode {
  return readMode('MSARI_API_MODE') ?? 'OFF';
}

/** Per-phase override: MSARI_API_<PHASE>_MODE (e.g. MSARI_API_CITIES_MODE), else global. */
export function getPhaseMigrationMode(phase: MigrationPhase): MigrationMode {
  const key = `MSARI_API_${phase.toUpperCase().replace(/-/g, '_')}_MODE`;
  return readMode(key) ?? getGlobalMigrationMode();
}

/** Canary fraction 0..1 (env MSARI_API_CANARY_RATIO, default 0.05). Deterministic per key. */
export function getCanaryRatio(): number {
  const raw = Number(process.env.MSARI_API_CANARY_RATIO ?? '0.05');
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  if (raw >= 1) return 1;
  return raw;
}

/** Stable bucketing for canary: same key → same decision (no sticky state). */
export function inCanaryBucket(key: string, ratio: number): boolean {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash / 0xffffffff < ratio;
}

export interface RemovalGate {
  ready: boolean;
  reasons: string[];
}

/**
 * B-0.7 — Direct-path removal gate checklist. All must be true before a phase's
 * direct Firestore path may be deleted (separate release, own rollback):
 * parity proven, verification window elapsed, sign-off recorded, rollback tested.
 */
export function assertRemovalGate(input: {
  parityProven: boolean;
  verificationWindowElapsed: boolean;
  signOffRecorded: boolean;
  rollbackTested: boolean;
}): RemovalGate {
  const reasons: string[] = [];
  if (!input.parityProven) reasons.push('parity not proven (shadow/canary diffs unresolved)');
  if (!input.verificationWindowElapsed) reasons.push('verification window not elapsed');
  if (!input.signOffRecorded) reasons.push('architecture sign-off missing');
  if (!input.rollbackTested) reasons.push('rollback not demonstrated');
  return { ready: reasons.length === 0, reasons };
}
