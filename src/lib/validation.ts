import { z } from "zod";

const dimensionsSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
});

const specsSchema = z.object({
  drivetrain: z.string().min(2).max(80),
  fuelType: z.string().min(2).max(80),
  transmission: z.string().min(2).max(80),
  horsepower: z.number().int().positive(),
  exteriorColor: z.string().min(2).max(80),
  interiorColor: z.string().min(2).max(80),
});

const mediaRefSchema = z.object({
  id: z.string().min(2),
  url: z.string().url(),
  alt: z.string().min(2).max(200),
});

export const inquiryPayloadSchema = z.object({
  carId: z.string().min(2),
  buyerId: z.string().min(2).optional(),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30).optional(),
  message: z.string().min(10).max(1500),
  preferredContact: z.enum(["email", "phone"]),
});

export const createOrUpdateCarSchema = z.object({
  id: z.string().min(2).optional(),
  make: z.string().min(2).max(120),
  model: z.string().min(1).max(120),
  year: z.number().int().gte(1990).lte(new Date().getFullYear() + 1),
  trim: z.string().min(1).max(120),
  condition: z.enum(["new", "used"]),
  priceUSD: z.number().positive(),
  mileageMiles: z.number().int().min(0),
  description: z.string().min(20).max(8000),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  specs: specsSchema,
  mediaRefs: z.array(mediaRefSchema).max(20),
  modelRefId: z.string().min(2),
});

export const publishCarSchema = z.object({
  publish: z.boolean(),
});

export const moderateModelUploadSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  notes: z.string().max(2000).optional(),
});

export const modelAssetSchema = z.object({
  id: z.string().min(2),
  carId: z.string().min(2),
  glbPath: z.string().min(2),
  usdzPath: z.string().min(2).optional(),
  dimensionsMeters: dimensionsSchema,
  normalizedScale: z.number().positive(),
  qaStatus: z.enum(["pending", "approved", "rejected"]),
  sourceType: z.enum(["curated", "uploaded"]),
  checksum: z.string().optional(),
  version: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
});

export type InquiryPayloadInput = z.infer<typeof inquiryPayloadSchema>;
export type CreateOrUpdateCarInput = z.infer<typeof createOrUpdateCarSchema>;
export type PublishCarInput = z.infer<typeof publishCarSchema>;
export type ModerateModelUploadInput = z.infer<typeof moderateModelUploadSchema>;
