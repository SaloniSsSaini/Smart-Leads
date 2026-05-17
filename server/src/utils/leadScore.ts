import { LeadSource, LeadStatus } from '../models/Lead.model';

const statusPoints: Record<LeadStatus, number> = {
  New: 20,
  Contacted: 50,
  Qualified: 85,
  Lost: 5,
};

const sourcePoints: Record<LeadSource, number> = {
  Referral: 25,
  Website: 15,
  Instagram: 10,
};

export const calculateLeadScore = (status: LeadStatus, source: LeadSource, email: string): number => {
  let score = statusPoints[status] + sourcePoints[source];
  if (email.includes('@gmail.com') || email.includes('@company')) score += 5;
  return Math.min(100, Math.max(0, score));
};
