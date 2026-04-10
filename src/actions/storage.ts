'use server';

/**
 * storage.ts — Server Action for generating Supabase presigned upload URLs.
 *
 * ARCHITECTURE CHANGE (security fix):
 * The old implementation accepted a full base64-encoded file and uploaded it
 * server-side, which had three critical problems:
 *   1. No authentication — any HTTP caller could upload files
 *   2. No real size enforcement — the 5MB limit was only in UI text
 *   3. Server memory pressure — entire file passed through the server
 *
 * This new implementation generates a short-lived presigned URL instead.
 * The browser uploads DIRECTLY to Supabase (zero file bytes through server).
 * The server only authorises the upload and controls the destination path.
 *
 * UPLOAD FLOW:
 *   1. Client requests a presigned URL (sends: filename, fileSize, mimeType)
 *   2. This action verifies: auth → role → allowlisted bucket → size → MIME
 *   3. Returns a presigned URL (60s TTL) + the final public URL
 *   4. Client PUT-uploads directly to Supabase using the presigned URL
 *   5. Client saves the public URL to the DB via a separate Server Action
 */

import { createClient } from '@supabase/supabase-js';
import { adminGuard, handleActionSafe } from '@/lib/action-guard';
import { uploadLimiter, RATE_LIMIT_RESPONSE } from '@/lib/rate-limiter';
import { validateInput } from '@/lib/action-utils';
import { GetUploadUrlSchema } from '@/schemas/actions.schema';

// ─── Supabase Admin Client ────────────────────────────────────────────────────
// Service role key — bypasses Supabase RLS. Used ONLY server-side.
// Never exposed to the client.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Security Allowlists ──────────────────────────────────────────────────────

/** Only these buckets may be written to via this action. */
const ALLOWED_BUCKETS = ['hotels', 'rooms', 'destinations'] as const;
type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

/** Only these MIME types are accepted. No SVG (XSS risk), no GIF. */
const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_MIME_EXTENSIONS);

/** Maximum upload size: 5 MB */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// ─── getUploadPresignedUrl ────────────────────────────────────────────────────

/**
 * Issues a short-lived presigned URL for a direct browser→Supabase upload.
 *
 * The caller controls: filename, fileSize, mimeType
 * The server controls: bucket selection, file path, TTL
 *
 * @param fileName  - Original filename (used only for extension extraction)
 * @param fileSize  - Declared file size in bytes (enforced by Supabase policy)
 * @param mimeType  - Declared MIME type (must be in ALLOWED_MIME_TYPES)
 * @param bucket    - Target bucket (must be in ALLOWED_BUCKETS)
 */
export async function getUploadPresignedUrl(
  rawFileName: unknown,
  rawFileSize: unknown,
  rawMimeType: unknown,
  rawBucket: unknown
) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  // ── Rate Limit مخصص لرفع الملفات (إضافي فوق حد adminGuard) ──────────────
  // 30 رفع/ساعة — أقل من حد العمليات العام (200) لأن الرفع أكثر تكلفةً
  const { success: uploadAllowed } = await uploadLimiter.limit(guard.user.id);
  if (!uploadAllowed) {
    console.warn(`[storage] Upload rate limit exceeded for: ${guard.user.id}`);
    return RATE_LIMIT_RESPONSE;
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const validation = validateInput(GetUploadUrlSchema, {
    fileName: rawFileName,
    fileSize: rawFileSize,
    mimeType: rawMimeType,
    bucket: rawBucket,
  });

  if (!validation.success) return validation;

  const { fileName, fileSize, mimeType, bucket } = validation.data;

  try {
    // ── Generate a server-controlled secure file path ─────────────────────
    // Client has ZERO control over the final storage path or extension.
    const ext = ALLOWED_MIME_EXTENSIONS[mimeType];
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const storagePath = `${safeName}.${ext}`;

    // ── Create bucket if it doesn't exist ─────────────────────────────────
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucket);

    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(
        bucket,
        {
          public: true,
          allowedMimeTypes: [...ALLOWED_MIME_TYPES],
          fileSizeLimit: MAX_FILE_SIZE_BYTES,
        }
      );
      if (createError) {
        console.error(`[storage] Failed to create bucket "${bucket}":`, createError);
        // Continue — bucket may have been created concurrently
      }
    }

    // ── Issue 60-second presigned upload URL ──────────────────────────────
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      return handleActionSafe('getUploadPresignedUrl:createSignedUploadUrl', error);
    }

    // Compute the final public URL upfront so the client can save it after upload
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return {
      success: true as const,
      signedUrl: data.signedUrl,   // PUT target for the browser
      token: data.token,           // Auth token for the PUT request
      path: storagePath,           // For reference
      publicUrl,                   // Save this to the database after upload
    };
  } catch (error) {
    return handleActionSafe('getUploadPresignedUrl', error);
  }
}

