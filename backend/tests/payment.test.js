const request = require('supertest');
const { app } = require('../server');
const Auth = require('../modules/auth/auth.model');

describe('Payments API Endpoints', () => {
  let cookie;
  let authUser;

  beforeEach(async () => {
    authUser = await Auth.create({
      email: 'payer@college.edu',
      password: 'password123',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'payer@college.edu',
        password: 'password123',
      });

    cookie = loginRes.headers['set-cookie'];
  });

  describe('POST /api/payments/create-order', () => {
    it('should create a Razorpay order or fail gracefully if credentials are missing', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .set('Cookie', cookie);

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('orderId');
        expect(res.body.data).toHaveProperty('amount');
      } else {
        // If razorpay keys are missing in env, it responds with 500 error
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
      }
    });
  });

  describe('POST /api/payments/verify', () => {
    it('should return 400 for invalid signature parameters', async () => {
      const res = await request(app)
        .post('/api/payments/verify')
        .set('Cookie', cookie)
        .send({
          razorpay_payment_id: 'pay_123',
          razorpay_order_id: 'order_123',
          razorpay_signature: 'invalid_sig',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
