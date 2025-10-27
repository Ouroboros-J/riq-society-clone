import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { confirmPayment, getAllUsers, getPendingPayments, getUserByOpenId, updateUserApprovalStatus, getAllEmailTemplates, getEmailTemplate, updateEmailTemplate, createEmailTemplate } from "./db";
import { createApplication, updateApplication, getUserApplication, getAllApplications, updateApplicationStatus } from "./db-applications";
import { getDb } from "./db";
import { applications, users } from "../drizzle/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "./storage";
import { sendEmail } from "./_core/email";

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
        await db.update(applications)
          .set({ 
            status: input.status,
            adminNotes: input.adminNotes,
            updatedAt: new Date()
          })
          .where(eq(applications.id, input.applicationId));
        return { success: true };
      }),

    confirmApplicationPayment: adminProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        await db.update(applications)
          .set({ 
            paymentStatus: "confirmed",
            paymentConfirmedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(applications.id, input.applicationId));
        return { success: true };
      }),

    // 통계 데이터
    getStatistics: adminProcedure
      .input(z.object({ 
        startDate: z.string().optional(),
        endDate: z.string().optional()
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const startDate = input.startDate ? new Date(input.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = input.endDate ? new Date(input.endDate) : new Date();
        
        // 회원 가입 추이
        const userRegistrations = await db.select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: sql<number>`COUNT(*)`
        })
        .from(users)
        .where(and(
          gte(users.createdAt, startDate),
          sql`${users.createdAt} <= ${endDate}`
        ))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);
        
        // 입회 신청 추이
        const applicationSubmissions = await db.select({
          date: sql<string>`DATE(${applications.createdAt})`,
          count: sql<number>`COUNT(*)`
        })
        .from(applications)
        .where(and(
          gte(applications.createdAt, startDate),
          sql`${applications.createdAt} <= ${endDate}`
        ))
        .groupBy(sql`DATE(${applications.createdAt})`)
        .orderBy(sql`DATE(${applications.createdAt})`);
        
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
        
        return {
          userRegistrations,
          applicationSubmissions,
          statusStats,
          paymentStats
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
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getUserApplication(ctx.user.id);
        
        if (existing) {
          return await updateApplication(existing.id, {
            ...input,
            isDraft: 0,
          });
        }
        
        return await createApplication({
          userId: ctx.user.id,
          ...input,
          isDraft: 0,
        });
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
});

export type AppRouter = typeof appRouter;
