// =====================================================
// Purchase Event KV Store
// Stores and retrieves recent purchases in Cloudflare KV
// =====================================================

export interface PurchaseEvent {
  buyerName: string;
  productName: string;
  timestamp: number;
  city?: string;
}

const KV_KEY = 'latest_purchases';
const MAX_PURCHASES = 5;

/**
 * Store a new purchase event in KV, keeping only the latest N entries.
 */
export async function storePurchase(kv: KVNamespace, purchase: PurchaseEvent): Promise<void> {
  const existing = await getLatestPurchases(kv);
  const updated = [purchase, ...existing].slice(0, MAX_PURCHASES);

  await kv.put(KV_KEY, JSON.stringify(updated), {
    // Auto-expire after 24 hours to prevent stale data
    expirationTtl: 86400,
  });
}

/**
 * Retrieve the latest purchases from KV.
 */
export async function getLatestPurchases(kv: KVNamespace): Promise<PurchaseEvent[]> {
  const raw = await kv.get(KV_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as PurchaseEvent[];
  } catch {
    return [];
  }
}
