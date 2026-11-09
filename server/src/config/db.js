import mongoose from 'mongoose';
import { env } from './env.js';

export async function conectarDB(uri = env.mongoUri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  // Garantiza que los índices únicos (cuenta, idempotencia) existan antes de operar.
  await mongoose.syncIndexes();
  return mongoose.connection;
}

export async function desconectarDB() {
  await mongoose.disconnect();
}
