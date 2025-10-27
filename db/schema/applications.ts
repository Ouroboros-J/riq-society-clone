import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Step 1: Personal Information
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  phone: text("phone"),
  
  // Step 2: Test Scores
  testType: text("test_type").notNull(), // e.g., "RIQ Admission Test", "Mensa", etc.
  testScore: text("test_score").notNull(), // e.g., "135", "99%"
  testDate: text("test_date"), // When the test was taken
  
  // Step 3: Supporting Documents
  documentUrls: jsonb("document_urls").$type<string[]>().default([]),
  
  // Application Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  
  // Draft support (for temporary save)
  isDraft: integer("is_draft").notNull().default(1), // 1 = draft, 0 = submitted
});

export const insertApplicationSchema = createInsertSchema(applications, {
  fullName: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  dateOfBirth: z.string().min(1, "생년월일을 입력해주세요"),
  phone: z.string().optional(),
  testType: z.string().min(1, "시험 종류를 선택해주세요"),
  testScore: z.string().min(1, "점수를 입력해주세요"),
  testDate: z.string().optional(),
  documentUrls: z.array(z.string()).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  adminNotes: z.string().optional(),
  isDraft: z.number().optional(),
});

export const selectApplicationSchema = createSelectSchema(applications);

export type Application = z.infer<typeof selectApplicationSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

