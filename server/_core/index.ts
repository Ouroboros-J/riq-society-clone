import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cron from "node-cron";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import sitemapRouter from "../routes/sitemap";
import { checkAndDowngradeExpiredMembers, notifyExpiringMembers } from "../cron-membership";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Sitemap
  app.use(sitemapRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Cron Jobs 설정
    // 매일 자정(00:00)에 만료된 회원 자동 등급 하락
    cron.schedule('0 0 * * *', async () => {
      console.log('[Cron] Running daily membership expiry check...');
      try {
        await checkAndDowngradeExpiredMembers();
      } catch (error) {
        console.error('[Cron] Error in membership expiry check:', error);
      }
    });
    
    // 매일 오전 9시에 만료 임박 회원 알림
    cron.schedule('0 9 * * *', async () => {
      console.log('[Cron] Running daily membership expiry notification...');
      try {
        await notifyExpiringMembers();
      } catch (error) {
        console.error('[Cron] Error in membership expiry notification:', error);
      }
    });
    
    console.log('[Cron] Scheduled jobs initialized');
  });
}

startServer().catch(console.error);
