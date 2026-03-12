# Data (Static Assets Mirror)

## Package Identity
Mirror/backup dari data statis yang di-host di CDN (`cdn.scalev.id`). Dipakai sebagai referensi development dan version control.

## Patterns & Conventions
- **CDN-First**: Data produk di-serve dari CDN saat runtime, file di sini hanya mirror.
- **Future Migration**: Di Phase 5, data akan migrasi ke Cloudflare D1/KV via API Worker.

## Key Files
- `products.json` — Data produk (mirror dari `cdn.scalev.id`)
