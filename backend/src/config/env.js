// Reads settings from environment variables (or the local .env file)
// so that secrets never live inside the code.
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || '',
  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
  ENABLE_STRETCH: process.env.ENABLE_STRETCH === 'true',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
