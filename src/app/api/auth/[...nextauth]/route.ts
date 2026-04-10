/**
 * /api/auth/[...nextauth]/route.ts
 *
 * This file exposes Auth.js's built-in HTTP handlers for the following routes:
 *   GET  /api/auth/session      — returns current session (used by client)
 *   GET  /api/auth/providers    — lists configured providers
 *   POST /api/auth/callback/credentials — handles credential sign-in
 *   POST /api/auth/signout      — handles sign-out
 *
 * No custom logic belongs here. All auth logic lives in src/auth.ts.
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
