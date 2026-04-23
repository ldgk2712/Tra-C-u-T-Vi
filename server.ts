import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Override GEMINI_API_KEY if .env.override exists
const overridePath = path.join(__dirname, ".env.override");
if (fs.existsSync(overridePath)) {
  const overrideContent = fs.readFileSync(overridePath, "utf-8");
  const match = overrideContent.match(/GEMINI_API_KEY=(.*)/);
  if (match && match[1]) {
    process.env.GEMINI_API_KEY = match[1].trim();
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const apiKey = process.env.API_KEY;
    const viteKey = process.env.VITE_GEMINI_API_KEY;
    
    res.json({ 
      status: "ok", 
      geminiKey: geminiKey ? `EXISTS (len: ${geminiKey.length}, prefix: ${geminiKey.substring(0, 4)})` : "MISSING",
      apiKey: apiKey ? `EXISTS (len: ${apiKey.length}, prefix: ${apiKey.substring(0, 4)})` : "MISSING",
      viteKey: viteKey ? `EXISTS (len: ${viteKey.length}, prefix: ${viteKey.substring(0, 4)})` : "MISSING",
      env: process.env.NODE_ENV
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files
    app.use(express.static(path.join(__dirname, "dist"), { index: false }));
    
    // Inject GEMINI_API_KEY into index.html
    app.get("*", (req, res) => {
      const indexPath = path.join(__dirname, "dist", "index.html");
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, "utf-8");
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY || "";
        
        console.log(`[Server] Serving index.html. API Key found: ${!!apiKey}`);
        
        if (apiKey) {
          // Escape the API key to prevent XSS or broken script tags
          const escapedKey = apiKey.replace(/"/g, '\\"');
          const scriptTag = `<script>window.process = window.process || {}; window.process.env = window.process.env || {}; window.process.env.GEMINI_API_KEY = "${escapedKey}";</script>`;
          html = html.replace("</head>", `${scriptTag}</head>`);
        }
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.send(html);
      } else {
        res.status(404).send("Not found");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
