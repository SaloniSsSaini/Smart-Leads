/** Live demo: frontend-only, no backend deploy required */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const DEMO_LOGIN_HINT = {
  admin: { email: 'admin@smartleads.com', password: 'password123' },
  sales: { email: 'sales@smartleads.com', password: 'password123' },
};

export const demoTokenPrefix = 'demo.';

export const parseDemoUserId = (token: string | null): string | null => {
  if (!token?.startsWith(demoTokenPrefix)) return null;
  return token.slice(demoTokenPrefix.length);
};

export const makeDemoToken = (userId: string): string => `${demoTokenPrefix}${userId}`;
