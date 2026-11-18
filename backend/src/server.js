// Entry point: connect to the database first, then start listening.
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

try {
  await connectDB(env.MONGODB_URI);
  app.listen(env.PORT, () => {
    console.log(`🚀 Reflex Arena API listening on port ${env.PORT}`);
    console.log(`   Health check: http://localhost:${env.PORT}/api/health`);
  });
} catch (err) {
  console.error('Server not started:', err.message);
  process.exit(1);
}
