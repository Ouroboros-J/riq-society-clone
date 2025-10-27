import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { confirmPayment, createCertificate, getAllCertificates, getAllUsers, getCertificateById, getPendingPayments, getUserByOpenId, getUserCertificates, requestDepositConfirmation, updateCertificateStatus, updateUserApprovalStatus } from "./db";
import { createApplication, updateApplication, getUserApplication, getAllApplications, updateApplicationStatus } from "./db-applications";
import { z } from "zod";
import { storagePut } from "./storage";
import { generateCertificateApprovedEmail, generateCertificateRejectedEmail, generatePaymentRequestEmail, sendEmail } from "./_core/email";

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
    listAllCertificates: adminProcedure.query(async () => {
      return await getAllCertificates();
    }),
    approveCertificate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const result = await updateCertificateStatus(input.id, "approved");
        
        // Get certificate and user info to send email
        const certificate = await getCertificateById(input.id);
        if (certificate) {
          const users = await getAllUsers();
          const user = users.find(u => u.id === certificate.userId);
          
          if (user && user.email) {
            const tossLink = process.env.TOSS_PAYMENT_LINK || 'https://toss.me/riqsociety';
            const kakaoPayLink = 'https://open.kakao.com/o/g7mjmhGg';
            
            const emailHtml = generatePaymentRequestEmail(user.name || '회원', tossLink, kakaoPayLink);
            await sendEmail({
              to: user.email,
              subject: '[RIQ Society] 증명서 승인 완료 - 입회비 납부 안내',
              html: emailHtml,
            });
          }
        }
        
        return result;
      }),
    rejectCertificate: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const result = await updateCertificateStatus(input.id, "rejected", input.reason);
        
        // Get certificate and user info to send email
        const certificate = await getCertificateById(input.id);
        if (certificate) {
          const users = await getAllUsers();
          const user = users.find(u => u.id === certificate.userId);
          
          if (user && user.email) {
            const emailHtml = generateCertificateRejectedEmail(user.name || '회원', input.reason);
            await sendEmail({
              to: user.email,
              subject: '[RIQ Society] 증명서 검토 결과',
              html: emailHtml,
            });
          }
        }
        
        return result;
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

  certificate: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCertificates(ctx.user.id);
    }),
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileType: z.string(),
          fileData: z.string(),
          testName: z.string().optional(),
          score: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `certificates/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.fileType);

        return await createCertificate({
          userId: ctx.user.id,
          fileUrl: url,
          fileName: input.fileName,
          fileType: input.fileType,
          testName: input.testName,
          score: input.score,
        });
      }),
    requestDeposit: protectedProcedure
      .input(z.object({ depositorName: z.string(), depositDate: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await requestDepositConfirmation(ctx.user.id, input.depositorName, input.depositDate);
      }),
  }),

  payment: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const users = await getAllUsers();
      const user = users.find(u => u.id === ctx.user.id);
      return {
        paymentStatus: user?.paymentStatus || 'pending',
        depositorName: user?.depositorName,
        depositDate: user?.depositDate,
      };
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
  }),
});

export type AppRouter = typeof appRouter;
