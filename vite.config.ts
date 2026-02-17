import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    openAiProxy(),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));

/** Proxies chat requests to OpenAI from the dev server so the API key stays server-side and CORS is avoided. */
function openAiProxy() {
  return {
    name: 'openai-proxy',
    configureServer(server: { config: { mode: string; envDir: string }; middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || req.url !== '/api/chat') {
          next();
          return;
        }
        const env = loadEnv(server.config.mode, server.config.envDir || process.cwd(), '');
        const apiKey = env.VITE_OPENAI_API_KEY;
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'OpenAI API key not configured in .env' }));
          return;
        }
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk; });
        req.on('end', async () => {
          try {
            const out = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body,
            });
            const data = await out.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(e) }));
          }
        });
      });
    },
  };
}
