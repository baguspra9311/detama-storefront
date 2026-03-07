// =====================================================
// GET /api/latest-purchases — Recent Purchases Feed
// =====================================================

import { Hono } from 'hono';
import type { Env } from '../types/index';
import { getLatestPurchases } from '../services/purchaseStore';
import { success } from '../utils/response';

const purchases = new Hono<{ Bindings: Env }>();

purchases.get('/', async (c) => {
  const data = await getLatestPurchases(c.env.KV_PURCHASES);


  // Cache-Control: public, short TTL for near-real-time updates
  c.header('Cache-Control', 'public, max-age=60, s-maxage=30');

  return success(c, { purchases: data });
});

export default purchases;
