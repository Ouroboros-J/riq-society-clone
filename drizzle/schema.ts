import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "member", "admin"]).default("user").notNull(),
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "deposit_requested", "confirmed"]).default("pending").notNull(),
  depositorName: varchar("depositorName", { length: 100 }),
  depositDate: varchar("depositDate", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;



export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Step 1: Personal Information
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  
  // Step 2: Test Scores
  testType: varchar("testType", { length: 255 }).notNull(),
  testScore: varchar("testScore", { length: 100 }).notNull(),
  testDate: varchar("testDate", { length: 50 }),
  isOtherTest: int("isOtherTest").default(0).notNull(), // 1 = 기타 시험, 0 = 공식 인정 시험
  otherTestName: varchar("otherTestName", { length: 255 }), // 기타 시험 이름
  
  // Step 3: Supporting Documents
  documentUrls: text("documentUrls"), // JSON array of URLs
  
  // Application Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  
  // Payment Information
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "deposit_requested", "confirmed"]).default("pending").notNull(),
  depositorName: varchar("depositorName", { length: 100 }),
  depositDate: varchar("depositDate", { length: 50 }),
  paymentConfirmedAt: timestamp("paymentConfirmedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  submittedAt: timestamp("submittedAt"),
  reviewedAt: timestamp("reviewedAt"),
  
  // Draft support
  isDraft: int("isDraft").default(1).notNull(), // 1 = draft, 0 = submitted
  
  // Review request
  reviewRequestCount: int("reviewRequestCount").default(0).notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

export const applicationReviews = mysqlTable("applicationReviews", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  requestReason: text("requestReason").notNull(),
  additionalDocuments: text("additionalDocuments"), // JSON array of S3 URLs
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"), // admin user id
  reviewedAt: timestamp("reviewedAt"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApplicationReview = typeof applicationReviews.$inferSelect;
export type InsertApplicationReview = typeof applicationReviews.$inferInsert;

// TODO: Add your tables here

export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  templateKey: varchar("templateKey", { length: 100 }).notNull().unique(), // e.g., "application_approved", "application_rejected"
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  description: text("description"), // 템플릿 설명
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;




export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  isPublished: int("isPublished").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = typeof faqs.$inferInsert;




export const blogs = mysqlTable("blogs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  thumbnailUrl: text("thumbnailUrl"),
  category: varchar("category", { length: 100 }),
  authorId: int("authorId").notNull(),
  isPublished: int("isPublished").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = typeof blogs.$inferInsert;




export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }),
  fileType: varchar("fileType", { length: 50 }),
  fileSize: int("fileSize"),
  category: varchar("category", { length: 100 }),
  isPublished: int("isPublished").default(0).notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// 공식 인정 시험 목록
export const recognizedTests = mysqlTable("recognizedTests", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(), // "표준 지능 검사", "학업 능력 검사", "대학 진학 시험"
  testName: varchar("testName", { length: 255 }).notNull(),
  description: text("description"),
  requiredScore: varchar("requiredScore", { length: 100 }), // 예: "IQ 135 이상", "99%ile"
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RecognizedTest = typeof recognizedTests.$inferSelect;
export type InsertRecognizedTest = typeof recognizedTests.$inferInsert;

// AI 모델 설정
export const aiSettings = mysqlTable("aiSettings", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull().unique(), // "openai", "anthropic", "google", "perplexity"
  apiKey: text("apiKey"), // 암호화 권장
  selectedModel: varchar("selectedModel", { length: 100 }), // 예: "gpt-4", "claude-3-opus"
  isEnabled: int("isEnabled").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiSetting = typeof aiSettings.$inferSelect;
export type InsertAiSetting = typeof aiSettings.$inferInsert;

// AI 검증 결과
export const aiVerifications = mysqlTable("aiVerifications", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  result: mysqlEnum("result", ["approved", "rejected", "uncertain"]).notNull(),
  reasoning: text("reasoning"), // AI가 제시한 이유
  confidence: int("confidence"), // 0-100 신뢰도
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiVerification = typeof aiVerifications.$inferSelect;
export type InsertAiVerification = typeof aiVerifications.$inferInsert;

// 오토 파일럿 모드 설정
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

