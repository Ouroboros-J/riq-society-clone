import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, memberProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { confirmPayment, getAllUsers, getPendingPayments, getUserByOpenId, updateUserApprovalStatus } from "./db";
import { getAllEmailTemplates, getEmailTemplate, updateEmailTemplate, createEmailTemplate } from "./db-email-templates";
import { getAllFaqs, getAllFaqsAdmin, getFaqById, createFaq, updateFaq, deleteFaq } from "./db-faqs";
import { getAllBlogs, getAllBlogsAdmin, getBlogBySlug, getBlogById, createBlog, updateBlog, deleteBlog } from "./db-blogs";
import { getAllResources, getAllResourcesAdmin, getResourceById, createResource, updateResource, deleteResource, incrementDownloadCount } from "./db-resources";
import { createApplication, updateApplication, getUserApplication, getAllApplications, updateApplicationStatus } from "./db-applications";
import { getAllRecognizedTests, getRecognizedTestById, createRecognizedTest, updateRecognizedTest, deleteRecognizedTest } from "./db-recognized-tests";
import { getAllAiSettings, getAiSettingById, getAiSettingByProvider, addAiSetting, updateAiSetting, deleteAiSetting, getEnabledAiSettings, countEnabledAiSettings, validateAiSettingsConfiguration } from "./db-ai-settings";
import { isAutopilotEnabled, getSystemSetting, setSystemSetting } from "./db-system-settings";
import { saveMultipleAiVerifications, getAiVerificationsByApplicationId } from "./db-ai-verifications";
import { getAiAccuracyStats, getOverallAiAccuracy } from "./db-ai-accuracy";
import { getEventStats, getPageViewStats, getConversionStats } from "./posthog-api";
import { verifyApplicationWithAI } from "./ai-verification";
import { getFirstDocumentAsBase64 } from "./s3-helper";
import { getModelsByPlatform } from "./ai-models";
import { validateApiKey } from "./ai-key-validation";
import { createApplicationReview, getApplicationReviewsByApplicationId, getAllPendingReviews, updateApplicationReviewStatus, incrementReviewRequestCount } from "./db-application-reviews";
import { getDb } from "./db";
import { applications, users, applicationReviews } from "../drizzle/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "./storage";
import { validateFileUpload } from "./file-validation";
import { sendEmail } from "./_core/email";
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail, sendReviewApprovedEmail, sendReviewRejectedEmail, sendPaymentConfirmedEmail } from "./email";
import { cleanupUnpaidDocuments } from "./cleanup-documents";
import { notifyInactiveAccounts, deleteInactiveAccounts, getInactiveAccounts } from "./cleanup-inactive-accounts";
import { getAllModels, filterVisionModels, getProvidersWithVision, getVisionModelsByProvider } from "./openrouter-helper";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  admin: router({
    listUsers: adminProcedure.query(async () => {
      return await getAllUsers();
    }),

    updateUserApproval: adminProcedure
      .input(z.object({ userId: z.number(), status: z.enum(["pending", "approved", "rejected"]) }))
      .mutation(async ({ input }) => {
        return await updateUserApprovalStatus(input.userId, input.status);
      }),
    listPendingPayments: adminProcedure.query(async () => {
      return await getPendingPayments();
    }),
    confirmPayment: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return await confirmPayment(input.userId);
      }),

    // Application 관리
    listApplications: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      return await db.select().from(applications).orderBy(desc(applications.createdAt));
    }),

    updateApplicationStatus: adminProcedure
      .input(z.object({ 
        applicationId: z.number(), 
        status: z.enum(["pending", "approved", "rejected"]),
        adminNotes: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // 신청 정보 조회
        const [application] = await db
          .select()
          .from(applications)
          .where(eq(applications.id, input.applicationId));
        
        if (!application) {
          throw new Error("신청을 찾을 수 없습니다");
        }
        
        await db.update(applications)
          .set({ 
            status: input.status,
            adminNotes: input.adminNotes,
            reviewedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(applications.id, input.applicationId));
        
        // 사용자 정보 조회
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, application.userId));
        
        if (!user) {
          throw new Error("사용자를 찾을 수 없습니다");
        }
        
        // 이메일 발송
        if (input.status === "approved") {
          await sendApplicationApprovedEmail(user.email!, application.fullName);
        } else if (input.status === "rejected") {
          await sendApplicationRejectedEmail(user.email!, application.fullName, input.adminNotes || "");
        }
        
        return { success: true };
      }),

    confirmApplicationPayment: adminProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // 신청 정보 조회
        const [application] = await db
          .select()
          .from(applications)
          .where(eq(applications.id, input.applicationId));
        
        if (!application) {
          throw new Error("신청을 찾을 수 없습니다");
        }
        
        // 결제 확인
        await db.update(applications)
          .set({ 
            paymentStatus: "confirmed",
            paymentConfirmedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(applications.id, input.applicationId));
        
        // 사용자 role을 member로 변경
        await db.update(users)
          .set({ 
            role: "member",
            updatedAt: new Date()
          })
          .where(eq(users.id, application.userId));
        
        // 사용자 정보 조회
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, application.userId));
        
        if (!user) {
          throw new Error("사용자를 찾을 수 없습니다");
        }
        
        // 이메일 발송
        await sendPaymentConfirmedEmail(user.email!, application.fullName);
        
        return { success: true };
      }),

    // 통계 API
    getUserStats: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        
        // 일별 회원 가입 수
        const dailySignups = await db
          .select({
            date: sql<string>`DATE(${users.createdAt})`,
            count: sql<number>`COUNT(*)`,
          })
          .from(users)
          .where(
            and(
              gte(users.createdAt, start),
              sql`${users.createdAt} <= ${end}`
            )
          )
          .groupBy(sql`DATE(${users.createdAt})`)
          .orderBy(sql`DATE(${users.createdAt})`);
        
        return dailySignups;
      }),

    getApplicationStats: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        
        // 일별 입회 신청 수
        const dailyApplications = await db
          .select({
            date: sql<string>`DATE(${applications.createdAt})`,
            count: sql<number>`COUNT(*)`,
          })
          .from(applications)
          .where(
            and(
              gte(applications.createdAt, start),
              sql`${applications.createdAt} <= ${end}`
            )
          )
          .groupBy(sql`DATE(${applications.createdAt})`)
          .orderBy(sql`DATE(${applications.createdAt})`);
        
        return dailyApplications;
      }),

    getApprovalStats: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        
        // 상태별 신청 수
        const statusCounts = await db
          .select({
            status: applications.status,
            count: sql<number>`COUNT(*)`,
          })
          .from(applications)
          .where(
            and(
              gte(applications.createdAt, start),
              sql`${applications.createdAt} <= ${end}`
            )
          )
          .groupBy(applications.status);
        
        return statusCounts;
      }),

    getPaymentStats: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        
        // 결제 상태별 신청 수
        const paymentCounts = await db
          .select({
            paymentStatus: applications.paymentStatus,
            count: sql<number>`COUNT(*)`,
          })
          .from(applications)
          .where(
            and(
              gte(applications.createdAt, start),
              sql`${applications.createdAt} <= ${end}`
            )
          )
          .groupBy(applications.paymentStatus);
        
        return paymentCounts;
      }),

    // AI 검증
    verifyApplication: adminProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // AI 설정 검증
        const validation = await validateAiSettingsConfiguration();
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid AI settings configuration');
        }
        
        const result = await verifyApplicationWithAI(input.applicationId);
        return result;
      }),

    getAiVerifications: adminProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        return await getAiVerificationsByApplicationId(input.applicationId);
      }),

    getAiAccuracyStats: adminProcedure.query(async () => {
      return await getAiAccuracyStats();
    }),

    getOverallAiAccuracy: adminProcedure.query(async () => {
      return await getOverallAiAccuracy();
    }),

    // PostHog 분석
    getEventStats: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return await getEventStats(input.startDate, input.endDate);
      }),

    getPageViewStats: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return await getPageViewStats(input.startDate, input.endDate);
      }),

    getConversionStats: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return await getConversionStats(input.startDate, input.endDate);
      }),

    // 정리 작업
    cleanupUnpaidDocuments: adminProcedure.mutation(async () => {
      return await cleanupUnpaidDocuments();
    }),

    notifyInactiveAccounts: adminProcedure.mutation(async () => {
      return await notifyInactiveAccounts();
    }),

    deleteInactiveAccounts: adminProcedure.mutation(async () => {
      return await deleteInactiveAccounts();
    }),

    getInactiveAccounts: adminProcedure.query(async () => {
      return await getInactiveAccounts();
    }),
  }),

  emailTemplate: router({
    list: adminProcedure.query(async () => {
      return await getAllEmailTemplates();
    }),

    getByType: adminProcedure
      .input(z.object({ type: z.string() }))
      .query(async ({ input }) => {
        return await getEmailTemplate(input.type);
      }),

    update: adminProcedure
      .input(z.object({
        type: z.string(),
        subject: z.string(),
        body: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await updateEmailTemplate(input.type, input.subject, input.body);
      }),

    create: adminProcedure
      .input(z.object({
        type: z.string(),
        subject: z.string(),
        body: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await createEmailTemplate(input.type, input.subject, input.body);
      }),
  }),

  faq: router({
    list: publicProcedure.query(async () => {
      return await getAllFaqs();
    }),

    listAdmin: adminProcedure.query(async () => {
      return await getAllFaqsAdmin();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getFaqById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createFaq(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        question: z.string().optional(),
        answer: z.string().optional(),
        category: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateFaq(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteFaq(input.id);
      }),
  }),

  blog: router({
    list: publicProcedure.query(async () => {
      return await getAllBlogs();
    }),

    listAdmin: adminProcedure.query(async () => {
      return await getAllBlogsAdmin();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getBlogBySlug(input.slug);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getBlogById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        content: z.string(),
        excerpt: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createBlog(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        category: z.string().optional(),
        isPublished: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateBlog(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteBlog(input.id);
      }),
  }),

  resource: router({
    list: memberProcedure.query(async () => {
      return await getAllResources();
    }),

    listAdmin: adminProcedure.query(async () => {
      return await getAllResourcesAdmin();
    }),

    getById: memberProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getResourceById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        fileUrl: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createResource(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        fileUrl: z.string().optional(),
        fileName: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
        category: z.string().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateResource(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteResource(input.id);
      }),

    incrementDownload: memberProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await incrementDownloadCount(input.id);
      }),
  }),

  application: router({
    submit: protectedProcedure
      .input(z.object({
        fullName: z.string(),
        email: z.string().email(),
        dateOfBirth: z.string(),
        phone: z.string().optional(),
        testType: z.string(),
        testScore: z.string(),
        testDate: z.string().optional(),
        isOtherTest: z.number().optional(),
        otherTestName: z.string().optional(),
        documents: z.array(z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        
        return await createApplication({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        dateOfBirth: z.string().optional(),
        phone: z.string().optional(),
        testType: z.string().optional(),
        testScore: z.string().optional(),
        testDate: z.string().optional(),
        isOtherTest: z.number().optional(),
        otherTestName: z.string().optional(),
        documents: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateApplication(id, data);
      }),

    getUserApplication: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      return await getUserApplication(ctx.user.id);
    }),

    uploadDocument: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileData: z.string(), // Base64
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        
        // 파일 유효성 검사
        const validation = validateFileUpload(input.fileName, input.fileType);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        
        // Base64 디코딩
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // S3 업로드
        const key = `applications/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const result = await storagePut(key, buffer, input.fileType);
        
        return {
          url: result.url,
          key: result.key,
        };
      }),

    requestPayment: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        depositorName: z.string(),
        depositDate: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // 신청 정보 조회
        const [application] = await db
          .select()
          .from(applications)
          .where(eq(applications.id, input.applicationId));
        
        if (!application) {
          throw new Error("신청을 찾을 수 없습니다");
        }
        
        if (application.userId !== ctx.user.id) {
          throw new Error("권한이 없습니다");
        }
        
        // 입금 확인 요청
        await db.update(applications)
          .set({
            paymentStatus: "deposit_requested",
            depositorName: input.depositorName,
            depositDate: input.depositDate,
            updatedAt: new Date()
          })
          .where(eq(applications.id, input.applicationId));
        
        return { success: true };
      }),
  }),

  systemSettings: router({
    get: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await getSystemSetting(input.key);
      }),

    set: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        return await setSystemSetting(input.key, input.value);
      }),

    isAutopilotEnabled: adminProcedure.query(async () => {
      return await isAutopilotEnabled();
    }),
  }),

  aiSettings: router({
    list: adminProcedure.query(async () => {
      return await getAllAiSettings();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getAiSettingById(input.id);
      }),

    getByProvider: adminProcedure
      .input(z.object({ provider: z.string() }))
      .query(async ({ input }) => {
        return await getAiSettingByProvider(input.provider);
      }),

    add: adminProcedure
      .input(z.object({
        provider: z.string(),
        modelId: z.string(),
        modelName: z.string(),
        role: z.enum(['verifier', 'summarizer']),
        isEnabled: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // 검증 규칙 체크 (추가 후)
        const allSettings = await getAllAiSettings();
        const afterAdd = [...allSettings, input as any];
        
        const verifiers = afterAdd.filter(s => s.role === 'verifier' && s.isEnabled === 1);
        const summarizers = afterAdd.filter(s => s.role === 'summarizer' && s.isEnabled === 1);
        
        // Summarizer는 최대 1개
        if (input.role === 'summarizer' && input.isEnabled === 1 && summarizers.length > 1) {
          throw new Error('Only 1 Summarizer model can be enabled at a time.');
        }
        
        return await addAiSetting(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        provider: z.string().optional(),
        modelId: z.string().optional(),
        modelName: z.string().optional(),
        role: z.enum(['verifier', 'summarizer']).optional(),
        isEnabled: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // 검증 규칙 체크 (업데이트 후)
        const allSettings = await getAllAiSettings();
        const current = await getAiSettingById(id);
        if (!current) throw new Error('AI setting not found');
        
        const updated = { ...current, ...data };
        const afterUpdate = allSettings.map(s => s.id === id ? updated : s);
        
        const summarizers = afterUpdate.filter(s => s.role === 'summarizer' && s.isEnabled === 1);
        
        // Summarizer는 최대 1개
        if (updated.role === 'summarizer' && updated.isEnabled === 1 && summarizers.length > 1) {
          throw new Error('Only 1 Summarizer model can be enabled at a time.');
        }
        
        return await updateAiSetting(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAiSetting(input.id);
        
        // 삭제 후 검증 규칙 체크
        const validation = await validateAiSettingsConfiguration();
        if (!validation.valid) {
          // 경고만 표시, 삭제는 허용
          console.warn('AI settings configuration warning:', validation.error);
        }
        
        return { success: true };
      }),

    getEnabled: adminProcedure.query(async () => {
      return await getEnabledAiSettings();
    }),

    countEnabled: adminProcedure.query(async () => {
      return await countEnabledAiSettings();
    }),

    validate: adminProcedure.query(async () => {
      return await validateAiSettingsConfiguration();
    }),

    // OpenRouter 모델 목록 조회
    getOpenRouterModels: adminProcedure.query(async () => {
      const allModels = await getAllModels();
      const visionModels = filterVisionModels(allModels);
      return visionModels;
    }),

    getOpenRouterProviders: adminProcedure.query(async () => {
      return await getProvidersWithVision();
    }),

    getOpenRouterModelsByProvider: adminProcedure
      .input(z.object({ provider: z.string() }))
      .query(async ({ input }) => {
        return await getVisionModelsByProvider(input.provider);
      }),
  }),

  recognizedTest: router({
    list: publicProcedure.query(async () => {
      return await getAllRecognizedTests();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getRecognizedTestById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        category: z.string(),
        testName: z.string(),
        description: z.string().optional(),
        requiredScore: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createRecognizedTest(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        category: z.string().optional(),
        testName: z.string().optional(),
        description: z.string().optional(),
        requiredScore: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateRecognizedTest(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteRecognizedTest(input.id);
      }),
  }),

  applicationReview: router({
    create: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // 신청 정보 조회
        const [application] = await db
          .select()
          .from(applications)
          .where(eq(applications.id, input.applicationId));
        
        if (!application) {
          throw new Error("신청을 찾을 수 없습니다");
        }
        
        if (application.userId !== ctx.user.id) {
          throw new Error("권한이 없습니다");
        }
        
        // 재검토 요청 횟수 증가
        await incrementReviewRequestCount(input.applicationId);
        
        // 재검토 요청 생성
        return await createApplicationReview({
          applicationId: input.applicationId,
          userId: ctx.user.id,
          message: input.message,
        });
      }),

    getByApplicationId: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // 신청 정보 조회
        const [application] = await db
          .select()
          .from(applications)
          .where(eq(applications.id, input.applicationId));
        
        if (!application) {
          throw new Error("신청을 찾을 수 없습니다");
        }
        
        if (application.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new Error("권한이 없습니다");
        }
        
        return await getApplicationReviewsByApplicationId(input.applicationId);
      }),

    listPending: adminProcedure.query(async () => {
      return await getAllPendingReviews();
    }),

    updateStatus: adminProcedure
      .input(z.object({
        reviewId: z.number(),
        status: z.enum(['pending', 'approved', 'rejected']),
        adminResponse: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // 재검토 요청 정보 조회
        const [review] = await db
          .select()
          .from(applicationReviews)
          .where(eq(applicationReviews.id, input.reviewId));
        
        if (!review) {
          throw new Error("재검토 요청을 찾을 수 없습니다");
        }
        
        // 재검토 요청 상태 업데이트
        await updateApplicationReviewStatus(input.reviewId, input.status, input.adminResponse);
        
        // 신청 정보 조회
        const [application] = await db
          .select()
          .from(applications)
          .where(eq(applications.id, review.applicationId));
        
        if (!application) {
          throw new Error("신청을 찾을 수 없습니다");
        }
        
        // 사용자 정보 조회
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, application.userId));
        
        if (!user) {
          throw new Error("사용자를 찾을 수 없습니다");
        }
        
        // 이메일 발송
        if (input.status === 'approved') {
          // 재검토 승인 시 신청 상태를 pending으로 변경
          await db.update(applications)
            .set({
              status: 'pending',
              adminNotes: null,
              updatedAt: new Date()
            })
            .where(eq(applications.id, review.applicationId));
          
          await sendReviewApprovedEmail(user.email!, application.fullName, input.adminResponse || '');
        } else if (input.status === 'rejected') {
          await sendReviewRejectedEmail(user.email!, application.fullName, input.adminResponse || '');
        }
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

