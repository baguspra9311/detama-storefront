// =====================================================
// Cloudflare Worker Environment Type Bindings
// =====================================================

export interface Env {
  // KV Namespace (binding name must match wrangler.toml)
  KV_PURCHASES: KVNamespace;

  // Public vars
  ALLOWED_ORIGINS: string;

  // Secrets (set via wrangler secret put)
  SCALEV_SIGNING_SECRET: string;
  FONNTE_TOKEN: string;
  QEV_API_KEY: string;
}

// ===== API Response Types =====

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
