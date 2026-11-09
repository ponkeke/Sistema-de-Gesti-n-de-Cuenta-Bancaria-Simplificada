import mongoose from 'mongoose';

// Journal de operaciones: permite idempotencia y recuperación ante fallos
// (MongoDB standalone no ofrece transacciones multi-documento).
const operacionSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: ['deposito', 'retiro', 'transferencia'], required: true },
    datos: { type: mongoose.Schema.Types.Mixed, required: true },
    estado: { type: String, enum: ['pendiente', 'completada', 'fallida'], default: 'pendiente' },
    paso: { type: String, default: 'iniciada' },
    idempotencyKey: { type: String },
    resultado: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
  },
  { timestamps: true },
);

operacionSchema.index(
  { idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
);
operacionSchema.index({ estado: 1, createdAt: 1 });

export const Operacion = mongoose.model('Operacion', operacionSchema);
