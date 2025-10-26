import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addPoints, createBadge, createCertificate, getAllBadges, getAllCertificates, getAllTimeRanking, getAllUsers, getCertificateById, getMonthlyRanking, getUserBadges, getUserByOpenId, getUserCertificates, getUserPointHistory, getUserPoints, getWeeklyRanking, purchaseBadge, updateCertificateStatus, updateUserApprovalStatus } from "./db";
import { z } from "zod";
import { storagePut } from "./storage";
import { generateCertificateApprovedEmail, generateCertificateRejectedEmail, sendEmail } from "./_core/email";

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
            const emailHtml = generateCertificateApprovedEmail(user.name || '회원');
            await sendEmail({
              to: user.email,
              subject: '[RIQ Society] 증명서 승인 완료',
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
  }),

  // Post and comment routers removed - moved to community site

  // Points, badge, and ranking routers removed - moved to community site

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
