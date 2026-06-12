# Database Migration Plan: MongoDB → PostgreSQL

## Rationale

MongoDB was chosen for rapid prototyping. For production scale, PostgreSQL offers:
- **ACID transactions** across multiple records (inventory + orders + payments)
- **Powerful JOINs** for financial reporting and analytics
- **Schema enforcement** for data integrity
- **Better tenant isolation** with schema-per-tenant or row-level security
- **Mature tooling** for migrations, backups, and replication

## Migration Strategy: Hybrid (Phased)

### Phase 1 — Dual-Write (2 weeks)
- Set up PostgreSQL alongside MongoDB
- Configure Mongoose-like ODM (e.g., `Prisma` or `TypeORM`)
- Write new data to both databases
- Read from MongoDB (existing), verify PostgreSQL parity

### Phase 2 — Backfill (2 weeks)
- Write migration scripts to backfill existing data
- Order: Merchants → Products → Customers → Orders → Payments
- Verify data integrity with reconciliation queries

### Phase 3 — Read Switch (1 week)
- Switch read operations to PostgreSQL
- Keep MongoDB as fallback for 1 billing cycle
- Monitor query performance and error rates

### Phase 4 — Decommission (1 week)
- Remove MongoDB dependency
- Archive old MongoDB data
- Update backup/restore procedures

## Schema Design

### Approach: Shared Schema with Tenant Column
- All merchants in same tables
- `merchant_id` column (indexed + NOT NULL) on every table
- Row-Level Security (RLS) policies for tenant isolation
- Benefits: simpler operations, shared indexes, easier cross-tenant analytics

### Tables
```sql
-- merchants (was Merchant collection)
-- products (was Product collection)
-- customers (was Customer collection)
-- orders + order_items (was Order collection with embedded items)
-- payments (was Payment collection, now linked to orders)
-- subscriptions + invoices (was Subscription collection)
-- reviews (was Review collection)
-- themes + store_themes (was Theme/StoreTheme collections)
-- notifications (was Notification collection)
-- audit_logs (new — for GDPR compliance)
```

## Key Considerations
1. **Embedded → Relational**: Order items move from embedded array to `order_items` table
2. **Dynamic schemas**: Theme `pages.sections.blocks.settings` → JSONB column
3. **Full-text search**: PostgreSQL `tsvector` replaces MongoDB text index
4. **Sequential IDs**: Replace ObjectId with `BIGSERIAL` for invoices, order numbers
5. **Soft deletes**: Add `deleted_at` timestamp to all tables

## Rollback Plan
- Keep MongoDB read-only during Phase 3
- Swap DNS / config to switch back if needed
- Monitor error rates for 48h before declaring success
