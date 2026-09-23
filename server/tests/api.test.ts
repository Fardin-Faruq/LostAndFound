import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { User } from '../src/models/User';
import { Item } from '../src/models/Item';
import { Claim } from '../src/models/Claim';

describe('Lost2Found API', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.NODE_ENV = 'test';
    await mongoose.connect(process.env.MONGODB_URI);

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123',
      });

    token = registerRes.body.token;
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Item.deleteMany({});

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Authenticated User',
        email: 'authenticated@example.com',
        password: 'testpass123',
      });

    token = registerRes.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return 200 and API status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('API is running...');
  });

  it('should search, filter, and sort reported items by query parameters', async () => {
    const user = await User.create({
      name: 'Search User',
      email: 'search@example.com',
      passwordHash: 'hashedpassword',
    });

    await Promise.all([
      Item.create({
        type: 'LOST',
        title: 'Black Wallet',
        category: 'Accessories',
        description: 'Leather black wallet with student ID',
        brand: 'Nike',
        color: 'Black',
        location: 'Main Library',
        dateLostOrFound: new Date('2025-01-20'),
        status: 'REPORTED',
        reporter: user._id as any,
      }),
      Item.create({
        type: 'FOUND',
        title: 'Red Water Bottle',
        category: 'Accessories',
        description: 'Red bottle found near cafeteria',
        brand: 'Hydro Flask',
        color: 'Red',
        location: 'Cafeteria',
        dateLostOrFound: new Date('2025-01-10'),
        status: 'REPORTED',
        reporter: user._id as any,
      }),
      Item.create({
        type: 'LOST',
        title: 'Blue Headphones',
        category: 'Electronics',
        description: 'Wireless blue headphones',
        brand: 'Sony',
        color: 'Blue',
        location: 'Main Library',
        dateLostOrFound: new Date('2025-01-25'),
        status: 'MATCH_FOUND',
        reporter: user._id as any,
      }),
    ]);

    const res = await request(app)
      .get('/api/items')
      .query({
        search: 'wallet',
        type: 'LOST',
        category: 'Accessories',
        sort: 'newest',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toEqual('Black Wallet');
    expect(res.body[0].category).toEqual('Accessories');
    expect(res.body[0].type).toEqual('LOST');
  });

  it('should save and return an image URL for a reported item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'FOUND',
        title: 'Gray Backpack',
        category: 'Accessories',
        description: 'Gray backpack found outside class room',
        brand: 'North Face',
        color: 'Gray',
        location: 'Science Block',
        dateLostOrFound: '2025-02-01',
        imageUrl: 'https://example.com/backpack.jpg',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.imageUrl).toEqual('https://example.com/backpack.jpg');
  });

  it('should accept a large base64 image payload for reported items', async () => {
    const largeImage = 'data:image/png;base64,' + 'A'.repeat(250000);

    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'FOUND',
        title: 'Large Photo Item',
        category: 'Accessories',
        description: 'Item with larger photo payload',
        location: 'Main Gate',
        dateLostOrFound: '2025-02-12',
        imageUrl: largeImage,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.imageUrl).toContain('data:image/png;base64,');
  });

  it('should allow role-based registration and password reset requests', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Office Clerk',
        email: 'office@example.com',
        password: 'testpass123',
        role: 'ADMIN',
      });

    expect(registerRes.statusCode).toEqual(201);
    expect(registerRes.body.role).toEqual('ADMIN');

    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'office@example.com' });

    expect(forgotRes.statusCode).toEqual(200);
    expect(forgotRes.body.message).toContain('reset');
  });

  it('should create a pending claim for a reported item', async () => {
    const reporter = await User.create({
      name: 'Reporter User',
      email: 'reporter@example.com',
      passwordHash: 'hashedpassword',
    });

    const item = await Item.create({
      type: 'FOUND',
      title: 'Blue Water Bottle',
      category: 'Accessories',
      description: 'Blue bottle found outside lab',
      location: 'Chemistry Lab',
      dateLostOrFound: new Date('2025-02-05'),
      reporter: reporter._id as any,
    });

    const res = await request(app)
      .post(`/api/items/${item._id}/claims`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        proofDetails: 'I lost a blue water bottle with a silver cap and my student ID sticker.',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('PENDING');
    expect(res.body.proofDetails).toContain('student ID sticker');
    expect(res.body.claimant).toBeDefined();
  });

  it('should allow an admin to approve a claim and mark the item as claimed', async () => {
    const reporter = await User.create({
      name: 'Reporter User',
      email: 'reporter-admin@example.com',
      passwordHash: 'hashedpassword',
    });

    const claimant = await User.create({
      name: 'Claimant User',
      email: 'claimant-admin@example.com',
      passwordHash: 'hashedpassword',
    });

    const admin = await User.create({
      name: 'Office Admin',
      email: 'office-admin@example.com',
      passwordHash: 'hashedpassword',
      role: 'ADMIN',
    });

    const item = await Item.create({
      type: 'FOUND',
      title: 'Silver Laptop',
      category: 'Electronics',
      description: 'Silver laptop left in the library',
      location: 'Library',
      dateLostOrFound: new Date('2025-02-10'),
      reporter: reporter._id as any,
    });

    const claim = await Claim.create({
      item: item._id as any,
      claimant: claimant._id as any,
      proofDetails: 'I can identify the custom blue sticker on this laptop.',
    });

    const adminToken = jwt.sign({ id: admin._id.toString() }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '30d',
    });

    const res = await request(app)
      .put(`/api/claims/${claim._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('APPROVED');

    const updatedItem = await Item.findById(item._id);
    expect(updatedItem?.status).toEqual('CLAIMED');
  });

  it('should return a users reports and matching found items', async () => {
    const user = await User.findOne({ email: 'authenticated@example.com' });

    await Item.create({
      type: 'LOST',
      title: 'Black Wallet',
      category: 'Accessories',
      description: 'Wallet with student card',
      brand: 'Nike',
      color: 'Black',
      location: 'Main Library',
      dateLostOrFound: new Date('2025-02-10'),
      reporter: user?._id as any,
    });

    await Item.create({
      type: 'FOUND',
      title: 'Black Wallet',
      category: 'Accessories',
      description: 'Wallet found near the library desk',
      brand: 'Nike',
      color: 'Black',
      location: 'Main Library',
      dateLostOrFound: new Date('2025-02-11'),
      reporter: user?._id as any,
    });

    const mineRes = await request(app)
      .get('/api/items/mine')
      .set('Authorization', `Bearer ${token}`);
    const matchesRes = await request(app)
      .get('/api/items/matches')
      .set('Authorization', `Bearer ${token}`);

    expect(mineRes.statusCode).toEqual(200);
    expect(mineRes.body).toHaveLength(2);
    expect(matchesRes.statusCode).toEqual(200);
    expect(matchesRes.body).toHaveLength(1);
    expect(matchesRes.body[0].score).toBeLessThanOrEqual(100);
    expect(matchesRes.body[0].reasons).toEqual(expect.arrayContaining(['category', 'color', 'location', 'brand', 'title']));
  });
});
