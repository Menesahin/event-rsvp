import { z } from "zod";

export const speakerSchema = z.object({
  name: z.string().min(1, "Speaker name is required").max(100),
  title: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
});

// datetime-local input sends "2026-04-15T10:00", not ISO 8601
const dateTimeString = z
  .string()
  .min(1, "Date is required")
  .refine((val) => !isNaN(Date.parse(val)), "Invalid date format");

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().min(1, "Description is required").max(5000),
  date: dateTimeString,
  endDate: z.union([dateTimeString, z.literal("")]).optional(),
  location: z.string().min(1, "Location is required").max(200),
  coverImage: z.union([z.string().url("Invalid URL"), z.literal("")]).optional(),
  capacity: z.number().int().min(1, "Minimum capacity is 1").max(10000),
  speakers: z.array(speakerSchema).default([]),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const approvedEventUpdateSchema = z.object({
  description: z.string().min(1).max(5000).optional(),
  coverImage: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
});

export type ApprovedEventUpdateInput = z.infer<typeof approvedEventUpdateSchema>;
