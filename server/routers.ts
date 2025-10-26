import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addPoints, createBadge, createCertificate, createComment, createPost, createPostLike, decrementPostLikeCount, deleteComment, deletePost, deletePostLike, getAllBadges, getAllCertificates, getAllPosts, getAllUsers, getCertificateById, getCommentsByPostId, getPostById, getPostLike, getUserBadges, getUserByOpenId, getUserCertificates, getUserPointHistory, getUserPoints, incrementPostLikeCount, incrementPostViewCount, purchaseBadge, updateCertificateStatus, updateComment, updatePost, updateUserApprovalStatus } from "./db";
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

  post: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getAllPosts(input.limit, input.offset, input.search);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        await incrementPostViewCount(input.id);
        return await getPostById(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          isNotice: z.boolean().optional(),
          attachmentData: z.string().optional(),
          attachmentName: z.string().optional(),
          attachmentType: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let attachmentUrl: string | undefined;
        
        // Check if user is admin for notice posts
        if (input.isNotice && ctx.user.role !== 'admin') {
          throw new Error("공지사항은 관리자만 작성할 수 있습니다.");
        }
        
        // Upload attachment if provided
        if (input.attachmentData && input.attachmentName && input.attachmentType) {
          const buffer = Buffer.from(input.attachmentData, "base64");
          const fileKey = `posts/${ctx.user.id}/${Date.now()}-${input.attachmentName}`;
          const { url } = await storagePut(fileKey, buffer, input.attachmentType);
          attachmentUrl = url;
        }
        
        const result = await createPost({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          isNotice: input.isNotice ? "true" : "false",
          attachmentUrl,
          attachmentName: input.attachmentName,
        });
        
        // Award points for creating a post (10 points)
        if (result && ctx.user?.id) {
          await addPoints(ctx.user.id, 10, 'post_create');
        }
        
        return result;
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const post = await getPostById(input.id);
        if (!post || (post.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new Error("권한이 없습니다.");
        }
        return await updatePost(input.id, input.title, input.content);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const post = await getPostById(input.id);
        if (!post || (post.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new Error("권한이 없습니다.");
        }
        return await deletePost(input.id);
      }),
    like: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const existingLike = await getPostLike(input.postId, ctx.user.id);
        
                if (existingLike) {
          // Unlike
          await deletePostLike(input.postId, ctx.user.id);
          await decrementPostLikeCount(input.postId);
          return { liked: false };
        } else {
          // Like
          await createPostLike({ postId: input.postId, userId: ctx.user.id });
          await incrementPostLikeCount(input.postId);
          
          // Award points to the post author (2 points)
          const post = await getPostById(input.postId);
          if (post && post.userId !== ctx.user.id) {
            await addPoints(post.userId, 2, 'post_liked', input.postId);
          }
          
          return { liked: true };
        }
      }),
    checkLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ ctx, input }) => {
        const like = await getPostLike(input.postId, ctx.user.id);
        return { liked: !!like };
      }),
  }),

  comment: router({
    list: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await getCommentsByPostId(input.postId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          postId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await createComment({
          postId: input.postId,
          userId: ctx.user.id,
          content: input.content,
        });
        
        // Award points for creating a comment (5 points)
        if (result && ctx.user?.id) {
          await addPoints(ctx.user.id, 5, 'comment_create', input.postId);
        }
        
        return result;
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: Check if user owns the comment
        return await updateComment(input.id, input.content);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Check if user owns the comment or is admin
        return await deleteComment(input.id);
      }),
  }),

  points: router({
    getMyPoints: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPoints(ctx.user.id);
    }),
    getMyHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPointHistory(ctx.user.id);
    }),
  }),

  badge: router({
    list: publicProcedure.query(async () => {
      return await getAllBadges();
    }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string(),
          icon: z.string(),
          price: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return await createBadge(input);
      }),
    purchase: protectedProcedure
      .input(z.object({ badgeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await purchaseBadge(ctx.user.id, input.badgeId);
      }),
    getMyBadges: protectedProcedure.query(async ({ ctx }) => {
      return await getUserBadges(ctx.user.id);
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
