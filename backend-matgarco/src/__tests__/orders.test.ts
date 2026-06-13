import { setupDB, teardownDB } from './setup';
import request from 'supertest';
import app from '../app';
describe('Order Creation (guest checkout)', () => {
  it('POST /api/orders — creates an order with subdomain (storefront flow)', async () => {
    const productRes = await request(app)
      .get('/api/storefront/demo-store/products?limit=1')
      .expect(200);
    const product = productRes.body.data.products[0];

    const res = await request(app)
      .post('/api/orders')
      .send({
        subdomain: 'demo-store',
        customerInfo: {
          email: 'customer@test.com',
          firstName: 'عميل',
          lastName: 'تجريبي',
          phone: '01099999999',
        },
        shippingAddress: {
          firstName: 'عميل',
          lastName: 'تجريبي',
          phone: '01099999999',
          street: 'شارع التحرير',
          city: 'القاهرة',
          country: 'EG',
        },
        items: [{ productId: product._id, quantity: 2 }],
        paymentMethod: 'cash',
        shippingCost: 30,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toBeDefined();
    expect(res.body.data.order.orderNumber).toBeDefined();
    expect(res.body.data.order.total).toBeGreaterThan(0);
  });

  it('POST /api/orders — creates an order with merchantId (dashboard flow)', async () => {
    const productRes = await request(app)
      .get('/api/storefront/demo-store/products?limit=1')
      .expect(200);
    const product = productRes.body.data.products[0];

    const res = await request(app)
      .post('/api/orders')
      .send({
        merchantId: product.merchantId,
        customerInfo: {
          email: 'direct@test.com',
          firstName: 'Direct',
          lastName: 'Order',
          phone: '01088888888',
        },
        shippingAddress: {
          firstName: 'Direct',
          lastName: 'Order',
          phone: '01088888888',
          street: 'Test St',
          city: 'Cairo',
          country: 'EG',
        },
        items: [{ productId: product._id, quantity: 1 }],
        paymentMethod: 'cash',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toBeDefined();
  });

  it('POST /api/orders — rejects invalid productId', async () => {
    await request(app)
      .post('/api/orders')
      .send({
        subdomain: 'demo-store',
        customerInfo: {
          email: 'bad@test.com',
          firstName: 'Bad',
          lastName: 'Order',
          phone: '01077777777',
        },
        shippingAddress: {
          firstName: 'Bad',
          lastName: 'Order',
          phone: '01077777777',
          street: 'Fake St',
          city: 'Cairo',
          country: 'EG',
        },
        items: [{ productId: '000000000000000000000000', quantity: 1 }],
        paymentMethod: 'cash',
      })
      .expect(404);
  });

  it('POST /api/orders — rejects missing required fields', async () => {
    await request(app)
      .post('/api/orders')
      .send({ subdomain: 'demo-store' })
      .expect(400);
  });
});

describe('Merchant Orders (authenticated)', () => {
  let token = '';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@matgarco.com', password: 'Demo1234' })
      .expect(200);
    token = loginRes.body.data.accessToken;
  });

  it('GET /api/orders — lists merchant orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.orders.length).toBeGreaterThan(0);
  });

  it('GET /api/orders/track?orderNumber= — public tracking', async () => {
    await request(app)
      .get('/api/orders/track?orderNumber=ORD-20260001')
      .expect(200);
  });
});

beforeAll(async () => { await setupDB(); });
afterAll(async () => { await teardownDB(); });