import { env } from './config/env.js';
import { conectarDB } from './config/db.js';
import { crearApp } from './app.js';
import { recuperarPendientes } from './services/operacionService.js';

try {
  await conectarDB();
  console.log(`MongoDB conectado: ${env.mongoUri}`);
  const n = await recuperarPendientes();
  if (n) console.log(`Operaciones pendientes recuperadas: ${n}`);
  crearApp().listen(env.port, () => console.log(`API escuchando en http://localhost:${env.port}`));
} catch (err) {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
}
