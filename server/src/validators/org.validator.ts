import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z.string().min(2, 'Organization name required'),
});
