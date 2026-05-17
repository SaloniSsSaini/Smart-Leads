import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { Lead } from '../models/Lead.model';
import { Organization } from '../models/Organization.model';
import { OrganizationMember } from '../models/OrganizationMember.model';

dotenv.config();
process.env.SKIP_EMAIL_VERIFICATION = 'true';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-leads';

const seed = async (): Promise<void> => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Lead.deleteMany({});
  await Organization.deleteMany({});
  await OrganizationMember.deleteMany({});

  const password = await bcrypt.hash('password123', 10);

  const createUserWithOrg = async (
    name: string,
    email: string,
    role: 'admin' | 'sales',
    orgName: string
  ) => {
    const user = await User.create({
      name,
      email,
      password,
      emailVerified: true,
      locale: 'en',
      onboardingDone: true,
    });

    const org = await Organization.create({
      name: orgName,
      slug: orgName.toLowerCase().replace(/\s+/g, '-') + '-demo',
      plan: role === 'admin' ? 'pro' : 'free',
      ownerId: user._id,
    });

    await OrganizationMember.create({
      userId: user._id,
      organizationId: org._id,
      role,
    });

    await User.findByIdAndUpdate(user._id, { currentOrganizationId: org._id });
    return { user, org };
  };

  const { user: admin, org } = await createUserWithOrg(
    'Admin User',
    'admin@smartleads.com',
    'admin',
    'Smart Leads HQ'
  );

  const { user: sales } = await createUserWithOrg(
    'Sales User',
    'sales@smartleads.com',
    'sales',
    'Sales Team'
  );

  await OrganizationMember.create({
    userId: sales._id,
    organizationId: org._id,
    role: 'sales',
  });

  const sampleLeads = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', status: 'New' as const, source: 'Website' as const },
    { name: 'Priya Patel', email: 'priya@example.com', status: 'Contacted' as const, source: 'Instagram' as const },
    { name: 'Amit Kumar', email: 'amit@example.com', status: 'Qualified' as const, source: 'Referral' as const },
    { name: 'Sneha Reddy', email: 'sneha@example.com', status: 'Lost' as const, source: 'Website' as const },
    { name: 'Vikram Singh', email: 'vikram@example.com', status: 'New' as const, source: 'Referral' as const },
    { name: 'Anita Desai', email: 'anita@example.com', status: 'Contacted' as const, source: 'Website' as const },
    { name: 'Karan Mehta', email: 'karan@example.com', status: 'Qualified' as const, source: 'Instagram' as const },
    { name: 'Divya Nair', email: 'divya@example.com', status: 'New' as const, source: 'Instagram' as const },
    { name: 'Rohan Gupta', email: 'rohan@example.com', status: 'Contacted' as const, source: 'Referral' as const },
    { name: 'Meera Joshi', email: 'meera@example.com', status: 'Qualified' as const, source: 'Website' as const },
    { name: 'Arjun Iyer', email: 'arjun@example.com', status: 'New' as const, source: 'Website' as const },
    { name: 'Lisa Chen', email: 'lisa@example.com', status: 'Lost' as const, source: 'Referral' as const },
  ];

  for (const lead of sampleLeads) {
    await Lead.create({
      ...lead,
      organizationId: org._id,
      createdBy: admin._id,
      assignedTo: sales._id,
    });
  }

  console.log('Seed completed!');
  console.log('Admin: admin@smartleads.com / password123 (Smart Leads HQ)');
  console.log('Sales: sales@smartleads.com / password123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
