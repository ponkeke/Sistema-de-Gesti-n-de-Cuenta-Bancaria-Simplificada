import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import cuentaRoutes from './routes/cuentaRoutes.js';
import { manejarErrores, noEncontrado } from './middlewares/errorHandler.js';

export function crearApp() {
  const app = express();
  app.use(cors({ origin: env.corsOrigin, exposedHeaders: ['Idempotent-Replayed'] }));
  app.use(express.json({ limit: '10kb' }));
  app.get('/api/salud', (req, res) => res.status(200).json({ estado: 'ok' }));
  app.use('/api/cuenta', cuentaRoutes);
  app.use(noEncontrado);
  app.use(manejarErrores);
  return app;
}
