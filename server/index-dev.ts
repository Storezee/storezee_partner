// ---------------------------------------------
// 🔥 VERY FIRST LOG — proves file is running
// ---------------------------------------------
console.log("🔥 [index-dev.ts] File loaded at top");

import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { type Server } from "node:http";
import { type Express, Request, Response, NextFunction } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import dotenv from "dotenv";
dotenv.config();
console.log("📦 Loaded env:", process.env.DB_HOST);

import viteConfig from "../vite.config";
import runApp from "./app";

// ---------------------------------------------
// 🔧 setupVite()
// ---------------------------------------------
export async function setupVite(app: Express, server: Server) {
  console.log("⚙️ [index-dev.ts] setupVite() called");

  const viteLogger = createLogger();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  console.log("📦 [index-dev.ts] Creating Vite server...");
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  console.log("🧩 [index-dev.ts] Registering Vite middlewares...");
  app.use(vite.middlewares);

  // Return renderer that will be added LAST
  return {
    async renderIndex(req: Request, res: Response, next: NextFunction) {
      console.log("📄 [index-dev.ts] renderIndex() triggered:", req.originalUrl);

      try {
        const clientTemplate = path.resolve(
          import.meta.dirname,
          "..",
          "client",
          "index.html",
        );

        console.log("📁 [index-dev.ts] Loading client index.html");

        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );

        console.log("✨ [index-dev.ts] Transforming index.html with Vite");

        const page = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        console.error("🔥 [index-dev.ts] Error in renderIndex()", e);
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    },
  };
}

// ---------------------------------------------
// 🚀 Boot the application
// ---------------------------------------------
(async () => {
  console.log("🚀 [index-dev.ts] Starting runApp()");

  await runApp(async (app, server) => {
    console.log("🟩 [index-dev.ts] Inside runApp() callback");

    const context = await setupVite(app, server);

    console.log("🔚 [index-dev.ts] Adding final catch-all route...");

    if (context?.renderIndex) {
      app.use("*", context.renderIndex);
      console.log("✅ [index-dev.ts] Catch-all renderIndex registered");
    }
  });
})();
