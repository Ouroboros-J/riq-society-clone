import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { confirmPayment, getAllUsers, getPendingPayments, getUserByOpenId, updateUserApprovalStatus } from "./db";
import { createApplication, updateApplication, getUserApplication, getAllApplications, updateApplicationStatus } from "./db-applications";
import { getDb } from "./db";
import { applications } from "../drizzle/schema";
import { eq } from "drizzle-orm";
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
