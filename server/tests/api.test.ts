import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { User } from '../src/models/User';
import { Item } from '../src/models/Item';
import { Claim } from '../src/models/Claim';
import { Notification } from '../src/models/Notification';
import { DeterministicMatchingEngine } from '../src/services/matchingService';

// ============================================================
// Test Helpers
// ============================================================
const makeToken = (userId: string, role = 'USER') =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

describe('Lost2Found API', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.NODE_ENV = 'test';
    await mongoose.connect(process.env.MONGODB_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});
    await Notification.deleteMany({});

    // Create a regular user via API
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'student@university.edu',
      password: 'Password123',
    });
    token = userRes.body.token;
    userId = userRes.body._id;

    // Create admin directly in DB
    const admin = await User.create({
      name: 'Office Admin',
      email: 'admin@university.edu',
      passwordHash: 'hashedpass',
      role: 'ADMIN',
    });
    adminId = String(admin._id);
    adminToken = makeToken(adminId, 'ADMIN');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // ──────────────────────────────────────────────────────────
  // HEALTH CHECK
  // ──────────────────────────────────────────────────────────
  describe('Health Check', () => {
    it('GET /api/health → 200 with status message', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('API is running...');
    });
  });

  // ──────────────────────────────────────────────────────────
  // AUTHENTICATION
  // ──────────────────────────────────────────────────────────
  describe('Auth Endpoints', () => {
    it('POST /api/auth/register → 201 with token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'New Student',
        email: 'new@university.edu',
        password: 'Password123',
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.email).toBe('new@university.edu');
    });

    it('POST /api/auth/register → rejects duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Dup User',
        email: 'dup@university.edu',
        password: 'Password123',
      });
      const res = await request(app).post('/api/auth/register').send({
        name: 'Dup User 2',
        email: 'dup@university.edu',
        password: 'Password123',
      });
      expect(res.statusCode).toBe(400);
    });

    it('POST /api/auth/login → 200 with token on correct credentials', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Login User',
        email: 'login@university.edu',
        password: 'Password123',
      });
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@university.edu',
        password: 'Password123',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('POST /api/auth/login → 401 on wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'student@university.edu',
        password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/auth/me → 200 with user data when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('student@university.edu');
    });

    it('GET /api/auth/me → 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/auth/forgot-password → 200 with reset message', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'student@university.edu' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────
  // ITEMS
  // ──────────────────────────────────────────────────────────
  describe('Items Endpoints', () => {
    it('POST /api/items → 201 creates a LOST item', async () => {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LOST',
          title: 'Black Wallet',
          category: 'Accessories',
          description: 'Leather wallet with student ID',
          brand: 'Nike',
          color: 'Black',
          location: 'Main Library',
          dateLostOrFound: '2025-02-10',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.type).toBe('LOST');
      expect(res.body.status).toBe('REPORTED');
      expect(res.body.reporter).toBeDefined();
    });

    it('POST /api/items → 201 creates a FOUND item', async () => {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'FOUND',
          title: 'Blue Hydro Flask',
          category: 'Accessories',
          description: 'Blue bottle left on table',
          brand: 'Hydro Flask',
          color: 'Blue',
          location: 'Cafeteria',
          dateLostOrFound: '2025-02-12',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.type).toBe('FOUND');
    });

    it('POST /api/items → 401 without authentication', async () => {
      const res = await request(app).post('/api/items').send({
        type: 'LOST',
        title: 'Unauth Item',
        category: 'Other',
        description: 'Test',
        location: 'Somewhere',
        dateLostOrFound: '2025-02-10',
      });
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/items → returns all items', async () => {
      await Item.create([
        { type: 'LOST', title: 'Item A', category: 'Electronics', description: 'Desc', location: 'Library', dateLostOrFound: new Date(), reporter: userId },
        { type: 'FOUND', title: 'Item B', category: 'Accessories', description: 'Desc', location: 'Cafe', dateLostOrFound: new Date(), reporter: userId },
      ]);
      const res = await request(app).get('/api/items');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/items?type=LOST → filters by type', async () => {
      await Item.create([
        { type: 'LOST', title: 'Lost Only', category: 'Electronics', description: 'Desc', location: 'Gym', dateLostOrFound: new Date(), reporter: userId },
        { type: 'FOUND', title: 'Found Only', category: 'Accessories', description: 'Desc', location: 'Gym', dateLostOrFound: new Date(), reporter: userId },
      ]);
      const res = await request(app).get('/api/items?type=LOST');
      expect(res.statusCode).toBe(200);
      res.body.forEach((item: any) => expect(item.type).toBe('LOST'));
    });

    it('GET /api/items?search=wallet → keyword search', async () => {
      await Item.create({
        type: 'LOST', title: 'Black Wallet', category: 'Accessories',
        description: 'With student card', location: 'Library',
        dateLostOrFound: new Date(), reporter: userId,
      });
      const res = await request(app).get('/api/items?search=wallet');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].title.toLowerCase()).toContain('wallet');
    });

    it('GET /api/items/:id → returns single item', async () => {
      const item = await Item.create({
        type: 'LOST', title: 'Single Item', category: 'Electronics',
        description: 'Specific item', location: 'Lab', dateLostOrFound: new Date(), reporter: userId,
      });
      const res = await request(app).get(`/api/items/${item._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Single Item');
    });

    it('GET /api/items/:id → 404 for invalid id', async () => {
      const res = await request(app).get('/api/items/000000000000000000000000');
      expect(res.statusCode).toBe(404);
    });

    it('GET /api/items/mine → returns only user items', async () => {
      const otherUser = await User.create({ name: 'Other', email: 'other@test.com', passwordHash: 'hash' });
      await Item.create([
        { type: 'LOST', title: 'My Item', category: 'Other', description: 'Mine', location: 'Here', dateLostOrFound: new Date(), reporter: userId },
        { type: 'LOST', title: 'Other Item', category: 'Other', description: 'Not mine', location: 'There', dateLostOrFound: new Date(), reporter: otherUser._id },
      ]);
      const res = await request(app).get('/api/items/mine').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.every((i: any) => String(i.reporter) === userId || i.reporter?._id === userId)).toBe(true);
    });

    it('saves imageUrl for items with a valid URL', async () => {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'FOUND',
          title: 'Backpack With Photo',
          category: 'Accessories',
          description: 'Gray backpack',
          location: 'Science Block',
          dateLostOrFound: '2025-02-01',
          imageUrl: 'https://example.com/backpack.jpg',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.imageUrl).toBe('https://example.com/backpack.jpg');
    });
  });

  // ──────────────────────────────────────────────────────────
  // CLAIMS
  // ──────────────────────────────────────────────────────────
  describe('Claims Endpoints', () => {
    let foundItemId: string;

    beforeEach(async () => {
      const item = await Item.create({
        type: 'FOUND',
        title: 'Silver Laptop',
        category: 'Electronics',
        description: 'Found in Library',
        location: 'Main Library',
        dateLostOrFound: new Date(),
        reporter: adminId,
      });
      foundItemId = String(item._id);
    });

    it('POST /api/items/:id/claims → 201 creates PENDING claim', async () => {
      const res = await request(app)
        .post(`/api/items/${foundItemId}/claims`)
        .set('Authorization', `Bearer ${token}`)
        .send({ proofDetails: 'I can identify the custom sticker on this laptop.' });
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.claimant).toBeDefined();
    });

    it('POST /api/items/:id/claims → 400 when proofDetails is missing', async () => {
      const res = await request(app)
        .post(`/api/items/${foundItemId}/claims`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('GET /api/claims → returns claims for authenticated user', async () => {
      await Claim.create({ item: foundItemId, claimant: userId, proofDetails: 'My item', status: 'PENDING' });
      const res = await request(app)
        .get('/api/claims')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('PUT /api/claims/:id/status → admin can approve claim', async () => {
      const claim = await Claim.create({
        item: foundItemId,
        claimant: userId,
        proofDetails: 'My item, I have photos',
        status: 'PENDING',
      });
      const res = await request(app)
        .put(`/api/claims/${claim._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('APPROVED');
      // Item should be marked CLAIMED
      const updatedItem = await Item.findById(foundItemId);
      expect(updatedItem?.status).toBe('CLAIMED');
    });

    it('PUT /api/claims/:id/status → non-admin cannot approve claim', async () => {
      const claim = await Claim.create({
        item: foundItemId,
        claimant: userId,
        proofDetails: 'My item',
        status: 'PENDING',
      });
      const res = await request(app)
        .put(`/api/claims/${claim._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'APPROVED' });
      expect(res.statusCode).toBe(403);
    });
  });

  // ──────────────────────────────────────────────────────────
  // OFFICE ENDPOINTS
  // ──────────────────────────────────────────────────────────
  describe('Office Endpoints', () => {
    let foundItemId: string;

    beforeEach(async () => {
      const item = await Item.create({
        type: 'FOUND',
        title: 'Blue Backpack',
        category: 'Accessories',
        description: 'Found in cafeteria',
        location: 'Cafeteria',
        dateLostOrFound: new Date(),
        reporter: userId,
      });
      foundItemId = String(item._id);
    });

    it('GET /api/office/stats → 200 with stats for admin', async () => {
      const res = await request(app)
        .get('/api/office/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalLost');
      expect(res.body).toHaveProperty('totalFound');
      expect(res.body).toHaveProperty('pendingClaims');
      expect(res.body).toHaveProperty('returnedItems');
    });

    it('GET /api/office/stats → 403 for non-admin', async () => {
      const res = await request(app)
        .get('/api/office/stats')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(403);
    });

    it('GET /api/office/items → 200 returns FOUND items list', async () => {
      const res = await request(app)
        .get('/api/office/items')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('PUT /api/office/items/:id/receive → marks item as physically received', async () => {
      const res = await request(app)
        .put(`/api/office/items/${foundItemId}/receive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ storageReference: 'SHELF-B2', storageLocation: 'Main Office Shelf B' });
      expect(res.statusCode).toBe(200);
      expect(res.body.item.physicalItemReceived).toBe(true);
      expect(res.body.item.storageReference).toBe('SHELF-B2');
    });

    it('PUT /api/office/items/:id/return → marks item as RETURNED', async () => {
      // First receive it
      await Item.findByIdAndUpdate(foundItemId, { physicalItemReceived: true });
      const res = await request(app)
        .put(`/api/office/items/${foundItemId}/return`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.item.status).toBe('RETURNED');
    });

    it('GET /api/office/claims → returns all claims for admin', async () => {
      await Claim.create({ item: foundItemId, claimant: userId, proofDetails: 'Proof', status: 'PENDING' });
      const res = await request(app)
        .get('/api/office/claims')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('PUT /api/office/claims/:id/approve → approves claim and notifies', async () => {
      const claim = await Claim.create({
        item: foundItemId,
        claimant: userId,
        proofDetails: 'Valid proof',
        status: 'PENDING',
      });
      const res = await request(app)
        .put(`/api/office/claims/${claim._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('APPROVED');
    });

    it('PUT /api/office/claims/:id/reject → rejects claim with reason', async () => {
      const claim = await Claim.create({
        item: foundItemId,
        claimant: userId,
        proofDetails: 'Weak proof',
        status: 'PENDING',
      });
      const res = await request(app)
        .put(`/api/office/claims/${claim._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Insufficient identification provided' });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('REJECTED');
      expect(res.body.rejectionReason).toContain('Insufficient');
    });
  });

  // ──────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ──────────────────────────────────────────────────────────
  describe('Notification Endpoints', () => {
    it('GET /api/notifications → 200 returns user notifications', async () => {
      await Notification.create({
        user: userId as any,
        type: 'SYSTEM',
        title: 'Welcome',
        message: 'Welcome to Lost2Found!',
        isRead: false,
      });
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.notifications).toBeDefined();
      expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
    });

    it('PUT /api/notifications/:id/read → marks single notification as read', async () => {
      const notif = await Notification.create({
        user: userId as any,
        type: 'SYSTEM',
        title: 'Test',
        message: 'Test notification',
        isRead: false,
      });
      const res = await request(app)
        .put(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.isRead).toBe(true);
    });

    it('PUT /api/notifications/read-all → marks all as read', async () => {
      await Notification.create({ user: userId as any, type: 'SYSTEM', title: 'N1', message: 'Msg 1', isRead: false });
      await Notification.create({ user: userId as any, type: 'SYSTEM', title: 'N2', message: 'Msg 2', isRead: false });
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      const remaining = await Notification.countDocuments({ user: userId as any, isRead: false });
      expect(remaining).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────
  // MATCHING ENGINE (unit tests)
  // ──────────────────────────────────────────────────────────
  describe('DeterministicMatchingEngine', () => {
    const engine = new DeterministicMatchingEngine();

    const makeLost = (overrides = {}): any => ({
      _id: new mongoose.Types.ObjectId(),
      type: 'LOST',
      title: 'Black Leather Wallet',
      category: 'Accessories',
      brand: 'Nike',
      color: 'Black',
      location: 'Main Library',
      dateLostOrFound: new Date('2025-02-10'),
      description: 'Leather wallet with student card inside',
      ...overrides,
    });

    const makeFound = (overrides = {}): any => ({
      _id: new mongoose.Types.ObjectId(),
      type: 'FOUND',
      title: 'Black Leather Wallet',
      category: 'Accessories',
      brand: 'Nike',
      color: 'Black',
      location: 'Main Library',
      dateLostOrFound: new Date('2025-02-11'),
      description: 'Wallet found near library desk',
      ...overrides,
    });

    it('returns a high score for near-identical items', () => {
      const { score } = engine.calculateScore(makeLost(), makeFound());
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('category match contributes points', () => {
      const { score, reasons } = engine.calculateScore(makeLost(), makeFound());
      expect(reasons).toContain('Category match');
      expect(score).toBeGreaterThan(0);
    });

    it('returns 0 score for completely different items', () => {
      const { score } = engine.calculateScore(
        makeLost({ category: 'Electronics', color: 'Silver', brand: 'Apple', title: 'MacBook', description: 'Laptop', location: 'Science Block', dateLostOrFound: new Date('2024-01-01') }),
        makeFound({ category: 'Clothing', color: 'Red', brand: 'Zara', title: 'Red Jacket', description: 'Winter coat', location: 'Gym', dateLostOrFound: new Date('2025-12-01') })
      );
      expect(score).toBe(0);
    });

    it('score is capped at 100', () => {
      const { score } = engine.calculateScore(makeLost(), makeFound());
      expect(score).toBeLessThanOrEqual(100);
    });

    it('date proximity within 2 days adds 15 points', () => {
      const { reasons } = engine.calculateScore(
        makeLost({ dateLostOrFound: new Date('2025-02-10'), category: 'X', brand: '', color: '', location: '', title: 't', description: 'd' }),
        makeFound({ dateLostOrFound: new Date('2025-02-11'), category: 'X', brand: '', color: '', location: '', title: 't', description: 'd' })
      );
      expect(reasons).toContain('Dates within 2 days');
    });

    it('findMatchesForUser returns candidates sorted by score', async () => {
      const user = await User.create({ name: 'Match User', email: 'matchuser@test.com', passwordHash: 'hash' });
      const uid = String(user._id);

      await Item.create({ type: 'LOST', title: 'Black Wallet', category: 'Accessories', brand: 'Nike', color: 'Black', location: 'Library', dateLostOrFound: new Date('2025-02-10'), description: 'wallet', reporter: uid as any });
      await Item.create({ type: 'FOUND', title: 'Black Wallet', category: 'Accessories', brand: 'Nike', color: 'Black', location: 'Library', dateLostOrFound: new Date('2025-02-11'), description: 'wallet', reporter: uid as any, status: 'REPORTED' });

      const matches = await engine.findMatchesForUser(uid);
      expect(matches.length).toBeGreaterThanOrEqual(1);
      expect(matches[0].score).toBeLessThanOrEqual(100);
      if (matches.length > 1) {
        expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
      }
    });
  });
});
