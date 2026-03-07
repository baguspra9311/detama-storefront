// =====================================================
// Standardized JSON Response Helpers
// =====================================================

import type { Context } from 'hono';

export function success<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, data }, status);
}

export function fail(c: Context, error: string, status: 400 | 401 | 403 | 404 | 500 = 400) {
  return c.json({ success: false, error }, status);
}
