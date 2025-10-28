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
import { getAllAiSettings, getAiSettingByPlatform, upsertAiSetting, getEnabledAiSettings, countEnabledAiSettings } from "./db-ai-settings";
import { isAutopilotEnabled, getSystemSetting, setSystemSetting } from "./db-system-settings";
import { saveMultipleAiVerifications, getAiVerificationsByApplicationId } from "./db-ai-verifications";
import { verifyApplicationWithAI } from "./ai-verification";
import { getFirstDocumentAsBase64 } from "./s3-helper";
import { getModelsByPlatform } from "./ai-models";
import { createApplicationReview, getApplicationReviewsByApplicationId, getAllPendingReviews, updateApplicationReviewStatus, incrementReviewRequestCount } from "./db-application-reviews";
import { getDb } from "./db";
import { applications, users, applicationReviews } from "../drizzle/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "./storage";
import { sendEmail } from "./_core/email";
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail, sendReviewApprovedEmail, sendReviewRejectedEmail, sendPaymentConfirmedEmail } from "./email";

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
        
        // 이메일 발송
        try {
          if (input.status === "approved") {
            await sendApplicationApprovedEmail(application.email, application.fullName);
          } else if (input.status === "rejected" && input.adminNotes) {
            await sendApplicationRejectedEmail(application.email, application.fullName, input.adminNotes);
          }
        } catch (error) {
          console.error('Failed to send email:', error);
          // 이메일 발송 실패해도 상태 업데이트는 성공
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
        
        await db.update(applications)
          .set({ 
            paymentStatus: "confirmed",
            paymentConfirmedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(applications.id, input.applicationId));
        
        // 이메일 발송
        try {
          await sendPaymentConfirmedEmail(application.email, application.fullName);
        } catch (error) {
          console.error('Failed to send email:', error);
        }
        
        return { success: true };
      }),

    // 통계 데이터
    getStatistics: adminProcedure
      .input(z.object({ 
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const startDate = input.startDate ? new Date(input.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = input.endDate ? new Date(input.endDate) : new Date();
        
        // 그룹화 형식 결정
        const dateFormat = 
          input.groupBy === 'month' ? sql<string>`DATE_FORMAT(${users.createdAt}, '%Y-%m')` :
          input.groupBy === 'week' ? sql<string>`DATE_FORMAT(${users.createdAt}, '%Y-%u')` :
          sql<string>`DATE(${users.createdAt})`;
        
        const appDateFormat = 
          input.groupBy === 'month' ? sql<string>`DATE_FORMAT(${applications.createdAt}, '%Y-%m')` :
          input.groupBy === 'week' ? sql<string>`DATE_FORMAT(${applications.createdAt}, '%Y-%u')` :
          sql<string>`DATE(${applications.createdAt})`;
        
        // 회원 가입 추이
        const userRegistrations = await db.select({
          date: dateFormat,
          count: sql<number>`COUNT(*)`
        })
        .from(users)
        .where(and(
          gte(users.createdAt, startDate),
          sql`${users.createdAt} <= ${endDate}`
        ))
        .groupBy(dateFormat)
        .orderBy(dateFormat);
        
        // 입회 신청 추이
        const applicationSubmissions = await db.select({
          date: appDateFormat,
          count: sql<number>`COUNT(*)`
        })
        .from(applications)
        .where(and(
          gte(applications.createdAt, startDate),
          sql`${applications.createdAt} <= ${endDate}`
        ))
        .groupBy(appDateFormat)
        .orderBy(appDateFormat);
        
        // 상태별 통계
        const statusStats = await db.select({
          status: applications.status,
          count: sql<number>`COUNT(*)`
        })
        .from(applications)
        .groupBy(applications.status);
        
        // 결제 상태별 통계
        const paymentStats = await db.select({
          paymentStatus: applications.paymentStatus,
          count: sql<number>`COUNT(*)`
        })
        .from(applications)
        .where(eq(applications.status, "approved"))
        .groupBy(applications.paymentStatus);
        
        // 전환율 계산
        const totalUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(and(
          gte(users.createdAt, startDate),
          sql`${users.createdAt} <= ${endDate}`
        ));
        const totalApplications = await db.select({ count: sql<number>`COUNT(*)` }).from(applications).where(and(
          gte(applications.createdAt, startDate),
          sql`${applications.createdAt} <= ${endDate}`
        ));
        const approvedApplications = await db.select({ count: sql<number>`COUNT(*)` }).from(applications).where(and(
          eq(applications.status, 'approved'),
          gte(applications.createdAt, startDate),
          sql`${applications.createdAt} <= ${endDate}`
        ));
        
        const conversionRate = {
          applicationRate: totalUsers[0]?.count > 0 ? (totalApplications[0]?.count / totalUsers[0]?.count * 100).toFixed(2) : '0',
          approvalRate: totalApplications[0]?.count > 0 ? (approvedApplications[0]?.count / totalApplications[0]?.count * 100).toFixed(2) : '0',
        };
        
        return {
          userRegistrations,
          applicationSubmissions,
          statusStats,
          paymentStats,
          conversionRate
        };
      }),

    // 이메일 템플릿 관리
    listEmailTemplates: adminProcedure.query(async () => {
      return await getAllEmailTemplates();
    }),

    getEmailTemplate: adminProcedure
      .input(z.object({ templateKey: z.string() }))
      .query(async ({ input }) => {
        return await getEmailTemplate(input.templateKey);
      }),

    updateEmailTemplate: adminProcedure
      .input(z.object({ 
        templateKey: z.string(),
        subject: z.string(),
        body: z.string()
      }))
      .mutation(async ({ input }) => {
        return await updateEmailTemplate(input.templateKey, input.subject, input.body);
      }),

    createEmailTemplate: adminProcedure
      .input(z.object({ 
        templateKey: z.string(),
        subject: z.string(),
        body: z.string(),
        description: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        return await createEmailTemplate(input.templateKey, input.subject, input.body, input.description);
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
        isPublished: z.number().optional(),
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

    getById: adminProcedure
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
      .mutation(async ({ ctx, input }) => {
        return await createBlog({ ...input, authorId: ctx.user.id });
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
        publishedAt: z.date().optional(),
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

  systemSettings: router({
    get: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await getSystemSetting(input.key);
      }),

    set: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        await setSystemSetting(input.key, input.value);
        return { success: true };
      }),

    isAutopilotEnabled: adminProcedure.query(async () => {
      return await isAutopilotEnabled();
    }),
  }),

  aiSettings: router({
    list: adminProcedure.query(async () => {
      return await getAllAiSettings();
    }),

    getByPlatform: adminProcedure
      .input(z.object({ platform: z.string() }))
      .query(async ({ input }) => {
        return await getAiSettingByPlatform(input.platform);
      }),

    upsert: adminProcedure
      .input(z.object({
        platform: z.string(),
        apiKey: z.string().optional(),
        selectedModel: z.string().optional(),
        isEnabled: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await upsertAiSetting(input);
      }),

    getEnabled: adminProcedure.query(async () => {
      return await getEnabledAiSettings();
    }),

    countEnabled: adminProcedure.query(async () => {
      return await countEnabledAiSettings();
    }),

    getAvailableModels: adminProcedure
      .input(z.object({ platform: z.string(), apiKey: z.string().optional() }))
      .query(async ({ input }) => {
        return await getModelsByPlatform(input.platform, input.apiKey);
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
        fileName: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
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
        isPublished: z.number().optional(),
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

    incrementDownload: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await incrementDownloadCount(input.id);
      }),
  }),

  aiVerification: router({
    getByApplicationId: adminProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        return await getAiVerificationsByApplicationId(input.applicationId);
      }),
  }),

  application: router({
    getMyApplication: protectedProcedure.query(async ({ ctx }) => {
      return await getUserApplication(ctx.user.id);
    }),

    submit: protectedProcedure
      .input(
        z.object({
          fullName: z.string(),
          email: z.string().email(),
          dateOfBirth: z.string(),
          phone: z.string().optional(),
          testType: z.string(),
          testScore: z.string(),
          testDate: z.string().optional(),
          documentUrls: z.string(),
          isOtherTest: z.number().optional(),
          otherTestName: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getUserApplication(ctx.user.id);
        
        let application;
        if (existing) {
          application = await updateApplication(existing.id, {
            ...input,
            isDraft: 0,
          });
        } else {
          application = await createApplication({
            userId: ctx.user.id,
            ...input,
            isDraft: 0,
          });
        }
        
        // AI 자동 검증 (오토 파일럿 모드 활성화 시)
        const autopilotEnabled = await isAutopilotEnabled();
        const isOtherTest = input.isOtherTest === 1;
        
        // "기타 시험"은 AI 검증 건너뛰기
        if (autopilotEnabled && !isOtherTest) {
          try {
            // S3에서 서류 다운로드 후 Base64 변환
            const documentBase64 = await getFirstDocumentAsBase64(input.documentUrls);
            
            if (documentBase64) {
              const verificationResult = await verifyApplicationWithAI(
                input.testType,
                input.testScore,
                documentBase64
              );
              
              // 검증 결과 저장
              const verificationsToSave = verificationResult.verifications.map((v) => ({
                applicationId: application.id,
                platform: v.platform,
                model: v.model,
                result: (v.result.approved ? 'approved' : 'rejected') as 'approved' | 'rejected' | 'uncertain',
                confidence: v.result.confidence,
                reasoning: v.result.reason,
                rawResponse: v.rawResponse,
              }));
              
              await saveMultipleAiVerifications(verificationsToSave);
              
              // 모든 AI가 승인하면 자동 승인
              if (verificationResult.approved) {
                await updateApplicationStatus(application.id, 'approved', 'AI 자동 검증 통과');
              } else {
                // 거절 시 거절 사유 저장
                await updateApplicationStatus(application.id, 'rejected', verificationResult.reason);
              }
            }
          } catch (error: any) {
            console.error('AI verification failed:', error);
            // AI 검증 실패 시 관리자 수동 검토로 남겨둔
          }
        }
        
        return application;
      }),

    uploadDocument: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileType: z.string(),
          fileData: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `applications/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.fileType);
        
        return { url };
      }),

    listAll: adminProcedure.query(async () => {
      return await getAllApplications();
    }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected"]),
          adminNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateApplicationStatus(input.id, input.status, input.adminNotes);
      }),
    requestPayment: protectedProcedure
      .input(
        z.object({
          depositorName: z.string(),
          depositDate: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const application = await getUserApplication(ctx.user!.id);
        
        if (!application) {
          throw new Error("신청 내역을 찾을 수 없습니다");
        }
        
        if (application.status !== "approved") {
          throw new Error("승인된 신청만 결제할 수 있습니다");
        }
        
        await db.update(applications).set({
          paymentStatus: "deposit_requested",
          depositorName: input.depositorName,
          depositDate: input.depositDate,
        }).where(eq(applications.id, application.id));
        
        return { success: true };
      }),
  }),

  applicationReview: router({
    requestReview: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          requestReason: z.string(),
          additionalDocuments: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // 신청 확인
        const [application] = await db
          .select()
          .from(applications)
          .where(eq(applications.id, input.applicationId));
        
        if (!application) {
          throw new Error("신청 내역을 찾을 수 없습니다");
        }
        
        if (application.userId !== ctx.user.id) {
          throw new Error("권한이 없습니다");
        }
        
        if (application.status !== "rejected") {
          throw new Error("거부된 신청만 재검토를 요청할 수 있습니다");
        }
        
        // 재검토 요청 횟수 확인 (최대 1회)
        if ((application.reviewRequestCount || 0) >= 1) {
          throw new Error("재검토는 최대 1회만 요청할 수 있습니다");
        }
        
        // 재검토 요청 생성
        await createApplicationReview({
          applicationId: input.applicationId,
          requestReason: input.requestReason,
          additionalDocuments: input.additionalDocuments,
        });
        
        // 재검토 요청 횟수 증가
        await incrementReviewRequestCount(input.applicationId);
        
        return { success: true };
      }),

    getMyReviews: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        // 신청 확인
        const [application] = await db
          .select()
          .from(applications)
          .where(eq(applications.id, input.applicationId));
        
        if (!application || application.userId !== ctx.user.id) {
          throw new Error("권한이 없습니다");
        }
        
        return await getApplicationReviewsByApplicationId(input.applicationId);
      }),

    listPending: adminProcedure.query(async () => {
      return await getAllPendingReviews();
    }),

    updateStatus: adminProcedure
      .input(
        z.object({
          reviewId: z.number(),
          status: z.enum(["approved", "rejected"]),
          adminNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateApplicationReviewStatus(input.reviewId, input.status, ctx.user!.id);
        
        // 재검토 승인 시 원래 신청도 승인 처리
        if (input.status === "approved") {
          const db = await getDb();
          if (!db) throw new Error("Database connection failed");
          
          const [review] = await db
            .select()
            .from(applicationReviews)
            .where(eq(applicationReviews.id, input.reviewId));
          
          if (review) {
            await updateApplicationStatus(review.applicationId, "approved");
            
            // 신청 정보 조회
            const [application] = await db
              .select()
              .from(applications)
              .where(eq(applications.id, review.applicationId));
            
            // 이메일 발송
            if (application) {
              try {
                await sendReviewApprovedEmail(application.email, application.fullName);
              } catch (error) {
                console.error('Failed to send email:', error);
              }
            }
          }
        } else if (input.status === "rejected") {
          // 재검토 거부 시 이메일 발송
          const db = await getDb();
          if (!db) throw new Error("Database connection failed");
          
          const [review] = await db
            .select()
            .from(applicationReviews)
            .where(eq(applicationReviews.id, input.reviewId));
          
          if (review) {
            const [application] = await db
              .select()
              .from(applications)
              .where(eq(applications.id, review.applicationId));
            
            if (application) {
              try {
                await sendReviewRejectedEmail(application.email, application.fullName);
              } catch (error) {
                console.error('Failed to send email:', error);
              }
            }
          }
        }
        
        return { success: true };   }),
  }),
});

export type AppRouter = typeof appRouter;
