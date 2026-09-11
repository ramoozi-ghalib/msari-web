/**
 * B-0.8 — Cities contract/parity probe (manual run only, never imported by the app).
 *
 * Compares DIRECT Firestore path (CityService.getActiveCities) vs API path
 * (GET /v1/cities) and reports parity WITHOUT changing any behavior.
 *
 * Run (local only, needs Firestore creds in .env + API reachability):
 *   npx tsx scripts/migration/parity-cities.ts
 *
 * Exit 0 = ran to completion (report printed). Exit 1 = harness failure.
 * A non-empty diff list does NOT fail the run — it is EVIDENCE for the
 * D-3A-01 hotelCount decision and Phase A gating.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

function loadEnvFile(): void {
  const p = path.join(process.cwd(), '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, raw] = m;
    if (process.env[k] !== undefined) continue;
    process.env[k] = raw.replace(/^['"]|['"]$/g, '');
  }
}
loadEnvFile();

async function main(): Promise<void> {
  const { CityService } = await import('@/services/city.service');
  const { diffJson, instrumented } = await import('@/lib/api-migration/shadow');
  const { redact } = await import('@/lib/api-migration/log');

  const base =
    (process.env.MSARI_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://us-central1-msariapp-v2.cloudfunctions.net/api/v1').replace(/\/$/, '');
  // NOTE: probe uses the existing public client key plumbing read-only; B-0 does not
  // create credentials. Server-side credential (B-0.1) stays unset until approved.
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

  const direct = await instrumented('direct-cities', () => CityService.getActiveCities(100));
  const api = await instrumented('api-cities', async () => {
    const res = await fetch(`${base}/cities`, {
      headers: apiKey ? { 'x-api-key': apiKey } : {},
    });
    if (!res.ok) throw new Error(`API /v1/cities -> HTTP ${res.status}`);
    return res.json();
  });

  const normDirect = (direct.result || []).map((c: any) => ({
    id: c.id, name: c.name, nameEn: c.nameEn, image: c.image, hotelCount: c.hotelCount,
  }));
  const shortErr = (e?: string) =>
    e ? `direct-path requires Next runtime (${e.slice(0, 160)}…)` : undefined;
  const apiList = (api.result as any)?.data ?? api.result ?? [];
  const normApi = (Array.isArray(apiList) ? apiList : []).map((c: any) => ({
    id: c.id, name: c.nameAr ?? c.name, nameEn: c.nameEn, image: c.imageUrl ?? c.image,
    hotelCount: (c as any).hotelCount ?? null, // EXPECTED GAP (D-3A-01): API exposes no count
  }));

  const idsDirect = new Set(normDirect.map((c) => String(c.id)));
  const idsApi = new Set(normApi.map((c) => String(c.id)));
  const onlyDirect = [...idsDirect].filter((id) => !idsApi.has(id));
  const onlyApi = [...idsApi].filter((id) => !idsDirect.has(id));
  const commonDiffs = diffJson(
    normDirect.filter((c) => idsApi.has(String(c.id))),
    normApi.filter((c) => idsDirect.has(String(c.id)))
  );

  const report = {
    tool: 'parity-cities (B-0.8)',
    measuredAt: new Date().toISOString(),
    direct: {
      ms: direct.ms, bytes: direct.bytes, error: shortErr(direct.error),
      count: normDirect.length,
      note: direct.error
        ? 'Direct Firestore path needs Next.js cache runtime; compare against production measurements instead.'
        : undefined,
    },
    api: {
      ms: api.ms, bytes: api.bytes, error: api.error ?? null,
      count: normApi.length,
    },
    idSets: { onlyDirect, onlyApi },
    fieldDiffs: redact(commonDiffs.slice(0, 30)),
    fieldDiffTotal: commonDiffs.length,
    hotelCountGap: {
      apiExposesCount: normApi.some((c) => c.hotelCount !== null),
      note: 'If false, D-3A-01 remains BLOCKED: no count parity possible without a contract decision.',
    },
  };
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ tool: 'parity-cities', fatal: String(e?.message || e) }));
  process.exit(1);
});
