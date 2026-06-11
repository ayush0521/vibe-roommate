const request = require('supertest');
const { app } = require('../server');
const Auth = require('../modules/auth/auth.model');
const User = require('../modules/users/user.model');
const Match = require('../modules/matches/match.model');
const QuizResult = require('../modules/quiz/quizResult.model');

describe('Matches API Endpoints', () => {
  let cookie;
  let currentUser;
  let candidateUser;

  beforeEach(async () => {
    const currentAuth = await Auth.create({
      email: 'me@college.edu',
      password: 'password123',
    });

    currentUser = await User.create({
      authId: currentAuth._id,
      fullName: 'Me Current',
      gender: 'male',
      college: 'MGM College of Engineering, Nanded',
      city: 'Nanded',
      isProfileComplete: true,
      hasCompletedQuiz: true,
      budgetRange: { min: 2000, max: 5000 },
      foodPreference: 'veg',
      sleepSchedule: 'early-bird',
    });

    await QuizResult.create({
      userId: currentUser._id,
      answers: {},
      hiddenScores: { study: 8, social: 3, cleanliness: 9 },
    });

    const candidateAuth = await Auth.create({
      email: 'roomie@college.edu',
      password: 'password123',
    });

    candidateUser = await User.create({
      authId: candidateAuth._id,
      fullName: 'Compatible Roomie',
      gender: 'male',
      college: 'MGM College of Engineering, Nanded',
      city: 'Nanded',
      isProfileComplete: true,
      hasCompletedQuiz: true,
      budgetRange: { min: 3000, max: 6000 },
      foodPreference: 'veg',
      sleepSchedule: 'early-bird',
    });

    await QuizResult.create({
      userId: candidateUser._id,
      answers: {},
      hiddenScores: { study: 7, social: 4, cleanliness: 8 },
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'me@college.edu',
        password: 'password123',
      });

    cookie = loginRes.headers['set-cookie'];
  });

  describe('POST /api/matches/compute', () => {
    it('should compute matches and save them to database', async () => {
      const res = await request(app)
        .post('/api/matches/compute')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.computed).toBe(1);

      const match = await Match.findOne({
        $or: [
          { user1: currentUser._id, user2: candidateUser._id },
          { user1: candidateUser._id, user2: currentUser._id },
        ],
      });
      expect(match).toBeTruthy();
      expect(match.compatibilityScore).toBeGreaterThanOrEqual(80);
    });
  });

  describe('GET /api/matches', () => {
    it('should fetch matches list with details', async () => {
      await request(app)
        .post('/api/matches/compute')
        .set('Cookie', cookie);

      const res = await request(app)
        .get('/api/matches')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].user.fullName).toBe('Compatible Roomie');
      expect(res.body.data[0]).toHaveProperty('compatibilityScore');
      expect(res.body.data[0]).toHaveProperty('explanation');
    });
  });
});
