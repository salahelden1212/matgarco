# Scalability: Read Replicas & Query Optimization

## Current Architecture
- Single MongoDB instance (local dev / Atlas M10)
- No read replicas configured
- No connection pooling tuning
- No Atlas Search indexes
- Redis service present but optional (bullmq + cache)

## Read Replicas (MongoDB Atlas)

### Configuration
1. Upgrade to M20+ for replica set with 3 nodes
2. Configure read preference in Mongoose:
   ```ts
   mongoose.connect(MONGO_URI, {
     readPreference: 'secondaryPreferred',
     replicaSet: 'atlas-xxxxx-shard-0',
   });
   ```
3. Tag report queries (`/api/dashboard/sales-report`) for `secondary` explicitly
4. Payment/order writes must use `primary` read preference

### Connection Pooling
- Current: default `maxPoolSize: 100`
- Recommended:
  - Web requests: `minPoolSize: 10, maxPoolSize: 50`
  - Background jobs: `minPoolSize: 5, maxPoolSize: 10`
  - Create separate `mongoose.createConnection()` for queue workers

## Query Optimization

### Indexes (already created)
- Product: `{ merchantId: 1, status: 1, isVisible: 1, sortOrder: 1 }`
- Order: `{ merchantId: 1, orderNumber: 1 }`, `{ customerEmail: 1 }`
- Notification: `{ merchantId: 1, read: 1, createdAt: -1 }`

### Missing Indexes (add soon)
- Payment: `{ merchantId: 1, status: 1, createdAt: -1 }`
- Subscription: `{ merchantId: 1, status: 1, nextBillingDate: 1 }`
- Customer: `{ merchantId: 1, email: 1 }` (unique per merchant)
- Review: `{ merchantId: 1, productId: 1, status: 1 }`

### Atlas Search (Full-Text)
Product search uses MongoDB regex → upgrade to Atlas Search:
- Create search index on `Product` collection
  - Fields: `name`, `description`, `tags`, `brand`
  - Analyzer: `standard` for English, `arabic` for Arabic stores
- Replace `{ name: { $regex: query, $options: 'i' } }` with `$search` aggregation

### N+1 Query Elimination
- Storefront product detail: fetch product + theme + merchant in one aggregate, not 3 separate queries
- Admin dashboard: batch merchant stats into one aggregation pipeline

## Caching Strategy (Redis)

### Cache Key Layout
```
storefront:{subdomain}:products:{page}:{category}:{search}
storefront:{subdomain}:theme
product:{subdomain}:{slug}
```

### Cached Data TTL
- Products list: 5 minutes (invalidated on product update)
- Theme JSON: 5 minutes (invalidated on theme publish)
- Product detail: 5 minutes

### Invalidation
- Cache is cleared by subdomain pattern when merchant updates products/theme
- Admin product updates call `clearMerchantCache(subdomain)`

## Vertical Scaling (Before Horizontal)
1. Increase MongoDB Atlas tier (M20 → M50): handles 10x traffic
2. Increase Node `max-old-space-size` to 4GB
3. Add PM2 cluster mode: `pm2 start -i max`
4. Add Redis session store (currently JWT — stateless)

## Horizontal Scaling Checklist
- [x] Stateless API (JWT auth, no session state)
- [ ] Shared Redis for cache + queues
- [x] Cloudinary for images (no local file storage)
- [ ] Database connection pooling tuned
- [ ] Read replicas configured
- [ ] CI/CD for zero-downtime deploys
- [ ] Health check endpoints for load balancer
