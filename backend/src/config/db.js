// Connects to MongoDB using Mongoose.
// If it fails we print hints for the most common workshop mistakes.
import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    throw new Error(
      'MONGODB_URI is missing. Create backend/.env (copy .env.example) ' +
        'or add MONGODB_URI in the Render "Environment" tab.'
    );
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✅ MongoDB connected (database: ${mongoose.connection.name})`);
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
    console.error(
      [
        'Common fixes:',
        '  1. Atlas > Network Access: allow 0.0.0.0/0 (Render has no fixed IP).',
        '  2. Check the username and password in the connection string.',
        '  3. If the password has @ # / : characters, URL-encode them or pick a simpler password.',
      ].join('\n')
    );
    throw err;
  }
}

// Small helper the health route uses to report database status.
export function dbStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}
