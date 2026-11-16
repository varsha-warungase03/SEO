import { z } from 'zod';
export const auditInput = z.object({
  url: z.string().url().refine(v => ['http:', 'https:'].includes(new URL(v).protocol), 'Only HTTP(S) URLs are allowed'),
  businessType: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  clientName: z.string().min(2).max(120)
});