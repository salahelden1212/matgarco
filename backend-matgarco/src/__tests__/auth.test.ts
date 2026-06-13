import { setupDB, teardownDB } from './setup';
import request from 'supertest';
import app from '../app';
describe('Auth API', () => {
  const testEmail = `test-${Date.now()}@matgarco.com`;
  const testPassword = 'TestPass123!';

  it('POST /api/auth/register — creates a new merchant account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        phone: '01000000000',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/auth/register — rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(400);
  });

  it('POST /api/auth/login — logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/auth/login — rejects invalid password', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' })
      .expect(401);
  });

  it('POST /api/auth/login — rejects non-existent email', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@matgarco.com', password: testPassword })
      .expect(401);
  });
});

beforeAll(async () => { await setupDB(); });
afterAll(async () => { await teardownDB(); });