import { setupDB, teardownDB } from './setup';
import request from 'supertest';
import app from '../app';
describe('Product API (merchant, authenticated)', () => {
  let token = '';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@matgarco.com', password: 'Demo1234' })
      .expect(200);
    token = loginRes.body.data.accessToken;
  });

  it('GET /api/products — lists merchant products with auth', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('GET /api/products — rejects without auth token', async () => {
    await request(app)
      .get('/api/products')
      .expect(401);
  });

  it('GET /api/products?category= — filters by category', async () => {
    const res = await request(app)
      .get('/api/products?category=إلكترونيات')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    if (res.body.data.products.length > 0) {
      expect(res.body.data.products[0].category).toBe('إلكترونيات');
    }
  });

  it('GET /api/products?search= — searches by keyword', async () => {
    const res = await request(app)
      .get('/api/products?search=نايكي')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });

  it('GET /api/products?search= — returns empty for no match', async () => {
    const res = await request(app)
      .get('/api/products?search=zzzznonexistent')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.products.length).toBe(0);
  });
});

beforeAll(async () => { await setupDB(); });
afterAll(async () => { await teardownDB(); });