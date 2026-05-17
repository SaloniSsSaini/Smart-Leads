import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { User } from '../models/User.model';
import { Lead } from '../models/Lead.model';
import { Organization } from '../models/Organization.model';
import { OrganizationMember } from '../models/OrganizationMember.model';
import bcrypt from 'bcryptjs';

let mongoServer: MongoMemoryServer;
let token: string;
let leadId: string;
let orgId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  process.env.JWT_SECRET = 'test-secret-key-12345';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.SKIP_EMAIL_VERIFICATION = 'true';

  const hashed = await bcrypt.hash('password123', 10);
  const user = await User.create({
    name: 'Test Admin',
    email: 'test@example.com',
    password: hashed,
    emailVerified: true,
  });

  const org = await Organization.create({
    name: 'Test Org',
    slug: 'test-org',
    ownerId: user._id,
    plan: 'free',
  });

  orgId = org._id.toString();

  await OrganizationMember.create({
    userId: user._id,
    organizationId: org._id,
    role: 'admin',
  });

  await User.findByIdAndUpdate(user._id, { currentOrganizationId: org._id });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });

  token = loginRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Health', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth', () => {
  it('POST /api/auth/register creates user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New User', email: 'new@example.com', password: 'password123', orgName: 'New Co' });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });

  it('GET /api/auth/me returns user with org', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.orgId).toBeDefined();
  });
});

describe('Leads', () => {
  it('POST /api/leads creates lead', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Doe', email: 'john@example.com', source: 'Website' });

    expect(res.status).toBe(201);
    leadId = res.body.data._id;
  });

  it('GET /api/leads lists with pagination', async () => {
    const res = await request(app)
      .get('/api/leads?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(10);
  });

  it('GET /api/billing/plans returns plans', async () => {
    const res = await request(app).get('/api/billing/plans');
    expect(res.status).toBe(200);
    expect(res.body.data.free).toBeDefined();
  });

  it('DELETE /api/leads/:id deletes lead', async () => {
    const res = await request(app)
      .delete(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
