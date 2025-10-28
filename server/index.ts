import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { setupWebSocket } from "./websocket.js";
import { apiLimiter } from "./rate-limit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Rate limiting 미들웨어 적용
  app.use('/api/', apiLimiter);
  console.log('[Rate Limit] API rate limiting enabled');

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // Setup WebSocket
  setupWebSocket(server);
  console.log('[WebSocket] WebSocket server initialized');

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`WebSocket available at ws://localhost:${port}/ws`);
  });
}

startServer().catch(console.error);
