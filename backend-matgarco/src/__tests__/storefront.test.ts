import { setupDB, teardownDB } from './setup';
import request from 'supertest';
import app from '../app';
describe('Storefront API (public)', () => {
  const subdomain = 'demo-store';

  it('GET /api/storefront/:subdomain/products — returns products with pagination', async () => {
    const res = await request(app)
      .get(`/api/storefront/${subdomain}/products`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.products).toBeDefined();
    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('GET /api/storefront/:subdomain/products?search= — filters by search term', async () => {
    const res = await request(app)
      .get(`/api/storefront/${subdomain}/products?search=نايكي`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });

  it('GET /api/storefront/:subdomain/products/slug/:slug — returns a single product', async () => {
    const res = await request(app)
      .get(`/api/storefront/${subdomain}/products/slug/nike-air-max`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.product).toBeDefined();
    expect(res.body.data.product.name).toContain('نايكي');
    expect(res.body.data.merchant).toBeDefined();
  });

  it('GET /api/storefront/:subdomain/products/slug/:slug — 404 for unknown slug', async () => {
    await request(app)
      .get(`/api/storefront/${subdomain}/products/slug/nonexistent-product`)
      .expect(404);
  });

  it('GET /api/storefront/:subdomain/categories — returns categories', async () => {
    const res = await request(app)
      .get(`/api/storefront/${subdomain}/categories`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.categories.length).toBeGreaterThan(0);
  });

  it('GET /api/storefront/:subdomain/theme — returns active theme', async () => {
    const res = await request(app)
      .get(`/api/storefront/${subdomain}/theme`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.theme).toBeDefined();
    expect(res.body.data.merchant).toBeDefined();
  });
});

describe('Order Tracking (public)', () => {
  it('GET /api/orders/track?orderNumber= — returns order by number', async () => {
    await request(app)
      .get('/api/orders/track?orderNumber=ORD-20260001')
      .expect(200);
  });

  it('GET /api/orders/track?orderNumber= — 404 for unknown order', async () => {
    await request(app)
      .get('/api/orders/track?orderNumber=INVALID-999')
      .expect(404);
  });
});

beforeAll(async () => { await setupDB(); });
afterAll(async () => { await teardownDB(); });