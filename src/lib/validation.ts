import { z } from "zod";

// Evidence Vault validation schemas
export const evidenceUploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  evidenceType: z.enum(
    ["screenshot", "video", "audio", "chat_log", "link", "document"],
    {
      errorMap: () => ({ message: "Please select a valid evidence type" }),
    }
  ),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: "File size must be less than 50MB",
    })
    .refine(
      (file) => {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "video/mp4",
          "video/quicktime",
          "audio/mpeg",
          "audio/wav",
          "application/pdf",
          "text/plain",
        ];
        return allowedTypes.includes(file.type);
      },
      {
        message: "Invalid file type. Allowed: images, videos, audio, PDF, text files",
      }
    ),
});

// Threat Intelligence validation schemas
export const threatIncidentSchema = z.object({
  platform: z.enum(
    ["instagram", "facebook", "twitter", "tiktok", "snapchat", "whatsapp", "telegram", "other"],
    {
      errorMap: () => ({ message: "Please select a platform" }),
    }
  ),
  username: z
    .string()
    .max(100, "Username must be less than 100 characters")
    .optional(),
  profileUrl: z
    .string()
    .url("Invalid URL format")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  incidentDate: z
    .string()
    .min(1, "Incident date is required")
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime()) && d <= new Date();
    }, {
      message: "Incident date must be a valid date in the past or present",
    }),
});

// Geo Tracking validation schemas
export const trackingLinkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  targetUrl: z
    .string()
    .url("Invalid URL format")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

// Authentication validation schemas
export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});

// Export types for TypeScript
export type EvidenceUpload = z.infer<typeof evidenceUploadSchema>;
export type ThreatIncident = z.infer<typeof threatIncidentSchema>;
export type TrackingLink = z.infer<typeof trackingLinkSchema>;
export type Auth = z.infer<typeof authSchema>;