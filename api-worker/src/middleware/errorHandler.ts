// =====================================================
// Global Error Handler Middleware
// =====================================================

import type { ErrorHandler } from 'hono';
import type { Env } from '../types/index';

export const errorHandler: ErrorHandler<{ Bindings: Env }> = (err, c) => {
  console.error('[API Error]', err.message, err.stack);

  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
      ...(c.env?.ALLOWED_ORIGINS?.includes('localhost') ? { detail: err.message } : {}),
    },
    500
  );
};
