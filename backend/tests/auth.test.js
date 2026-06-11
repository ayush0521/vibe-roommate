const request = require('supertest');
const { app } = require('../server');
const Auth = require('../modules/auth/auth.model');
const User = require('../modules/users/user.model');
const EmailVerification = require('../shared/models/emailVerification.model');

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'teststudent@college.edu',
          password: 'password123',
          fullName: 'Test Student',
          gender: 'male',
          college: 'MGM College of Engineering, Nanded',
          city: 'Nanded',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'teststudent@college.edu');

      const auth = await Auth.findOne({ email: 'teststudent@college.edu' });
      expect(auth).toBeTruthy();
      const user = await User.findOne({ authId: auth._id });
      expect(user).toBeTruthy();
      expect(user.fullName).toBe('Test Student');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user and return access and refresh cookies', async () => {
      await Auth.create({
        email: 'testuser@college.edu',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@college.edu',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('vr_token'))).toBe(true);
      expect(cookies.some(c => c.includes('vr_refresh'))).toBe(true);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify user email when correct OTP is provided', async () => {
      const authUser = await Auth.create({
        email: 'testverify@college.edu',
        password: 'password123',
        isEmailVerified: false,
      });

      const testOtp = '123456';
      await EmailVerification.create({
        email: 'testverify@college.edu',
        otp: testOtp,
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testverify@college.edu',
          password: 'password123',
        });

      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/verify-email')
        .set('Cookie', cookie)
        .send({ otp: testOtp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedAuth = await Auth.findById(authUser._id);
      expect(updatedAuth.isEmailVerified).toBe(true);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear authentication cookies and invalidate the token', async () => {
      await Auth.create({
        email: 'testlogout@college.edu',
        password: 'password123',
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testlogout@college.edu',
          password: 'password123',
        });

      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const setCookies = res.headers['set-cookie'];
      expect(setCookies.some(c => c.includes('vr_token=;'))).toBe(true);
    });
  });
});
