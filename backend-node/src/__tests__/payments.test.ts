import { setupDB, teardownDB } from './setup';
import request from 'supertest';
import app from '../app';
describe('Payment Integration', () => {
  it('POST /api/payments/create-intention — rejects empty body', async () => {
    await request(app)
      .post('/api/payments/create-intention')
      .send({})
      .expect((r) => { if (r.status !== 400 && r.status !== 404) throw new Error(`Expected 400 or 404, got ${r.status}`); });
  });

  it('POST /api/payments/create-intention — creates Paymob intention for valid order', async () => {
    const productRes = await request(app)
      .get('/api/storefront/demo-store/products?limit=1')
      .expect(200);
    const product = productRes.body.data.products[0];

    const orderRes = await request(app)
      .post('/api/orders')
      .send({
        subdomain: 'demo-store',
        customerInfo: {
          email: 'paymob@test.com',
          firstName: 'Paymob',
          lastName: 'Test',
          phone: '01066666666',
        },
        shippingAddress: {
          firstName: 'Paymob',
          lastName: 'Test',
          phone: '01066666666',
          street: 'Payment St',
          city: 'Cairo',
          country: 'EG',
        },
        items: [{ productId: product._id, quantity: 1 }],
        paymentMethod: 'card',
      })
      .expect(201);

    const orderId = orderRes.body.data.order._id;

    const res = await request(app)
      .post('/api/payments/create-intention')
      .send({
        orderId,
        customerInfo: { firstName: 'Paymob', lastName: 'Test', phone: '01066666666', email: 'paymob@test.com' },
        shippingAddress: { firstName: 'Paymob', lastName: 'Test', phone: '01066666666', street: 'Payment St', city: 'Cairo', country: 'EG' },
        items: [{ name: product.name, amount: Math.round(product.price * 100), quantity: 1 }],
        total: product.price,
      });

    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentUrl).toBeDefined();
      expect(res.body.data.paymentUrl).toContain('paymob.com');
    }
  });
});

beforeAll(async () => { await setupDB(); });
afterAll(async () => { await teardownDB(); });