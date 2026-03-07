// =====================================================
// CORS Middleware Factory
// Only allows requests from configured origins
// =====================================================

import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

/**
 * Creates a CORS middleware that validates origins from the
 * ALLOWED_ORIGINS environment variable (comma-separated).
 */
export function createCorsMiddleware(allowedOriginsStr: string): MiddlewareHandler {
  const allowedOrigins = allowedOriginsStr.split(',').map((o) => o.trim());

  return cors({
    origin: (origin) => {
      if (allowedOrigins.includes(origin)) return origin;
      return '';
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Scalev-Secret'],
    maxAge: 86400, // 24h preflight cache
  });
}
