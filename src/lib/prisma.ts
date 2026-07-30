import { PrismaClient, Prisma } from '@prisma/client';

// ─── Singleton Pattern ──────────────────────────────────────────────────────────
// Ensures only one PrismaClient is instantiated across the entire application.
const prismaGlobal = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient =
  prismaGlobal.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prismaClient;
}

// ─── Retry & Stability System ───────────────────────────────────────────────────
// Handles connection instability, cold starts, and pool exhaustion.

const RETRYABLE_OPS = new Set([
  'findMany', 'findUnique', 'findFirst', 'findUniqueOrThrow',
  'findFirstOrThrow', 'count', 'aggregate', 'groupBy',
  'create', 'createMany', 'update', 'updateMany', 'upsert',
  'delete', 'deleteMany',
]);

const MAX_RETRIES = 4; // Increased for Supabase free-tier instability

function isRetryableError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    // P1001: Can't reach database server
    // P1008: Operations timed out
    // P1017: Connection closed
    // P2024: Pool timeout
    return ['P1001', 'P1008', 'P1017', 'P2024'].includes(e.code);
  }

  if (e instanceof Error) {
    return (
      e.message.includes("Can't reach database server") ||
      e.message.includes("connection closed") ||
      e.message.includes("timeout")
    );
  }

  return false;
}

async function withRetry<T>(fn: () => Promise<T>, opName: string): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < MAX_RETRIES + 1; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential Backoff: 2s, 4s
        console.warn(`[PRISMA] Retrying ${opName} (Attempt ${attempt}/${MAX_RETRIES}) after ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
      return await fn();
    } catch (e) {
      lastError = e;
      
      if (!isRetryableError(e)) {
        console.error(`[PRISMA] Non-retryable error in ${opName}:`, e);
        throw e;
      }

      if (attempt >= MAX_RETRIES) {
        console.error(`[PRISMA] Max retries reached for ${opName}. Last error:`, e);
        break;
      }

      console.warn(`[PRISMA] Retryable error in ${opName}:`, e instanceof Error ? e.message : e);
    }
  }
  throw lastError;
}

// Proxy wrapper to inject retry logic into all Prisma models
export const prisma = new Proxy(prismaClient, {
  get(target, modelName) {
    const model = (target as unknown as Record<string, unknown>)[modelName as string];
    if (!model || typeof model !== 'object') return model;

    return new Proxy(model as Record<string, unknown>, {
      get(modelTarget, opName) {
        const op = modelTarget[opName as string];
        if (typeof op !== 'function') return op;
        
        const fullOpName = `${String(modelName)}.${String(opName)}`;
        if (!RETRYABLE_OPS.has(opName as string)) return op.bind(modelTarget);

        return (...args: unknown[]) =>
          withRetry(() => (op as (...a: unknown[]) => Promise<unknown>).apply(modelTarget, args), fullOpName);
      },
    });
  },
}) as unknown as PrismaClient;


