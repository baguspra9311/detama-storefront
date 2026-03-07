// =====================================================
// Hono App Entry Point — DeTama API Worker
// =====================================================

import { Hono } from 'hono';
import type { Env } from './types/index';
import { createCorsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import webhook from './routes/webhook';
import purchases from './routes/purchases';
import validateEmailRoute from './routes/validateEmail';
import validateWARoute from './routes/validateWA';

const app = new Hono<{ Bindings: Env }>();

// ===== Global Middleware =====

// CORS — applied to all routes
app.use('*', async (c, next) => {
  const corsHandler = createCorsMiddleware(c.env.ALLOWED_ORIGINS);
  return corsHandler(c, next);
});

// Global error handler
app.onError(errorHandler);

// ===== Health Check =====

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== Routes =====

// Webhook routes
app.route('/webhook', webhook);

// Public API routes
app.route('/api/latest-purchases', purchases);
app.route('/api/validate/email', validateEmailRoute);
app.route('/api/validate/wa', validateWARoute);

// ===== 404 Fallback =====

app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});

export default app;
