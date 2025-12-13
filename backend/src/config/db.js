import mongoose from 'mongoose';

const { connection } = mongoose;

export async function connectToDatabase(uri) {
  if (!uri) {
    console.warn('MONGODB_URI not set; running without a database. Some endpoints will be limited.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn('MongoDB connection failed:', err?.message || err);
    console.warn('Continuing to run API without DB. Endpoints that require DB will be limited.');
  }
}

connection.on('error', (err) => {
  console.warn('MongoDB connection error (non-fatal):', err?.message || err);
});

export function isDbConnected() {
  return connection && connection.readyState === 1;
}

export { mongoose };
