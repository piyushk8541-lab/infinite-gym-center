import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(24).optional().default(""),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const resetRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

export const bookingSchema = z.object({
  slotId: z.string().min(1),
  idempotencyKey: z.string().min(8),
});

export const planPatchSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  tagline: z.string().trim().max(120).optional(),
  priceCents: z.number().int().min(0).max(100000000).optional(),
  durationDays: z.number().int().min(1).max(3650).optional(),
  benefits: z.array(z.string().trim().min(1)).min(1).max(12).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const slotCreateSchema = z.object({
  sessionId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(1).max(500),
});

export const staffSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(60),
  specialty: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  schedule: z.string().trim().max(120).optional().default("Weekdays"),
});

export const promotionSchema = z.object({
  code: z.string().trim().min(3).max(20).toUpperCase(),
  description: z.string().trim().min(2).max(120),
  discountPercent: z.number().int().min(1).max(100),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  interest: z.string().trim().min(2).max(60),
  message: z.string().trim().max(500).optional().default(""),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(2).max(500),
});

export const campaignSchema = z.object({
  name: z.string().trim().min(2).max(80),
  audience: z.string().trim().min(2).max(80),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PlanPatch = z.infer<typeof planPatchSchema>;
export type SlotCreateInput = z.infer<typeof slotCreateSchema>;
