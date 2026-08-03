// server.js — Custom entry point for Hostinger Node.js Web App
// Captures all errors and logs them explicitly to stderr/stdout

process.on('uncaughtException', (err) => {
  console.error('═══════════════════════════════════════════');
  console.error('[FATAL UNCAUGHT EXCEPTION]:', err);
  console.error('═══════════════════════════════════════════');
});

process.on('unhandledRejection', (reason) => {
  console.error('═══════════════════════════════════════════');
  console.error('[FATAL UNHANDLED REJECTION]:', reason);
  console.error('═══════════════════════════════════════════');
});

console.log('[STARTUP] Starting Msari Web App...');
console.log('[STARTUP] Node.js Version:', process.version);
console.log('[STARTUP] NODE_ENV:', process.env.NODE_ENV);
console.log('[STARTUP] PORT:', process.env.PORT || '3000');

const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    console.log('[STARTUP] Next.js prepared successfully.');

    createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        console.error('[REQUEST ERROR]', req.url, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }
    }).listen(port, hostname, () => {
      console.log(`[STARTUP] ✅ Server listening on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('[STARTUP ERROR] Failed to prepare Next.js app:', err);
    process.exit(1);
  });
