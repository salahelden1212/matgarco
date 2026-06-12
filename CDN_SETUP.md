# CDN & Asset Optimization

## Current Setup

### Image Delivery — Cloudinary
- All storefront images are served via Cloudinary
- `f_auto` + `q_auto` transformation parameters for format/quality optimization
- Cache-Control: `public, max-age=86400, immutable` (1 day) set via `next.config.js`
- Responsive image sizes via `<Image>` component `sizes` attribute
- `fetchpriority="high"` + `loading="eager"` on first 4 product cards for LCP

### Static Assets — Next.js
- Cache-Control: `public, max-age=31536000, immutable` (1 year) for JS/CSS/fonts
- Font files preloaded in `<head>` via `<link rel="preload">`
- No additional CDN layer (served directly from Next.js)

## Recommendation: Cloudflare

### Why Cloudflare
- Free plan covers CDN, SSL, DDoS protection
- Workers for edge-side caching of API responses
- Image Resizing product (alternative to Cloudinary at lower scale)
- Argo Smart Routing (paid) for faster origin connections

### Implementation Steps
1. Add Cloudflare proxied DNS for `*.matgarco.com` and landing domain
2. Configure Page Rules:
   - `*.matgarco.com/_next/static/*` → Cache Everything, Edge TTL 1 year
   - `*.matgarco.com/images/*` → Cache Everything, Edge TTL 1 day
   - `/api/*` → Standard, Edge TTL 0, Browser TTL 0 (dynamic)
3. Enable Brotli compression
4. Set SSL mode to Full (strict)
5. Configure WAF rate limiting rules for `/api/*`

### Cloudinary Alternative Timeline
| Scale | Solution |
|-------|----------|
| < 10k images/month | Keep Cloudinary (free tier) |
| 10k–100k | Cloudinary paid or Cloudflare Images |
| > 100k | Self-host Thumbor or Sharp on S3 |

## Performance Budget
- LCP: < 2.5s (target 1.8s with CDN + Cloudinary)
- CLS: < 0.1
- First Byte: < 200ms (use Cloudflare edge caching)
- Image bytes per page: < 300KB (Cloudinary q_auto handles this)
