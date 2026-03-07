// =====================================================
// POST /api/validate/wa — WhatsApp Number Validation
// =====================================================

import { Hono } from 'hono';
import type { Env } from '../types/index';
import { validateWhatsApp } from '../services/waValidator';
import { success, fail } from '../utils/response';

const validateWARoute = new Hono<{ Bindings: Env }>();

validateWARoute.post('/', async (c) => {
  const body = await c.req.json<{ phone?: string }>();

  if (!body.phone || typeof body.phone !== 'string') {
    return fail(c, 'phone field is required');
  }

  const result = await validateWhatsApp(
    body.phone,
    c.env.FONNTE_TOKEN
  );

  return success(c, result);
});

export default validateWARoute;
