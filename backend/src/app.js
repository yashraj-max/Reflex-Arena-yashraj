// Builds the Express app (but does not start it - server.js does that).
// Keeping them separate lets tests use the app without opening a port.
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import apiRoutes from './routes/api.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

const app = express();

// CORS: lets the frontend on Vercel (a different website) call this API.
const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim().replace(/\/+$/, ''));
app.use(cors({ origin: origins.includes('*') ? '*' : origins }));

app.use(express.json({ limit: '10kb' })); // read JSON bodies (small ones only)
app.use(requestLogger);

// A friendly page when someone opens the backend URL in a browser.
app.get('/', (_req, res) => {
  res.json({
    message: '⚡ Reflex Arena API is running. The game itself lives on the frontend.',
    try: ['/api/health', '/api/leaderboard'],
  });
});

app.use('/api', apiRoutes);
app.use('/api', notFound);
app.use(errorHandler);

export default app;
