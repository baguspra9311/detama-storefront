// =====================================================
// POST /api/validate/email — Email Validation Endpoint
// =====================================================

import { Hono } from 'hono';
import type { Env } from '../types/index';
import { validateEmail } from '../services/emailValidator';
import { success, fail } from '../utils/response';

const validateEmailRoute = new Hono<{ Bindings: Env }>();

validateEmailRoute.post('/', async (c) => {
  const body = await c.req.json<{ email?: string }>();

  if (!body.email || typeof body.email !== 'string') {
    return fail(c, 'email field is required');
  }

  const result = validateEmail(body.email);
  return success(c, result);
});

export default validateEmailRoute;
