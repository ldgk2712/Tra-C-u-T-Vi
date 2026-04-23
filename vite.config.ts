import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

// Override GEMINI_API_KEY if .env.override exists
const overridePath = path.join(process.cwd(), ".env.override");
if (fs.existsSync(overridePath)) {
  const overrideContent = fs.readFileSync(overridePath, "utf-8");
  const match = overrideContent.match(/GEMINI_API_KEY=(.*)/);
  if (match && match[1]) {
    process.env.GEMINI_API_KEY = match[1].trim();
  }
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'inject-env',
        transformIndexHtml(html) {
          const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || '';
          const escapedKey = apiKey.replace(/"/g, '\\"');
          return html.replace(
            '</head>',
            `<script>window.process = window.process || {}; window.process.env = window.process.env || {}; window.process.env.GEMINI_API_KEY = "${escapedKey}";</script></head>`
          );
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
    },
  };
});
