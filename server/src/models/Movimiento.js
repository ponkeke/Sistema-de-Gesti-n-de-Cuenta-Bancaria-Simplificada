import mongoose from 'mongoose';

export const TIPOS_MOVIMIENTO = [
  'deposito',
  'retiro',
  'transferencia_enviada',
  'transferencia_recibida',
];

const movimientoSchema = new mongoose.Schema(
  {
    cuenta: { type: String, required: true },
    tipo: { type: String, enum: TIPOS_MOVIMIENTO, required: true },
    monto: { type: Number, required: true, min: 1 }, // centavos
    saldoResultante: { type: Number, required: true, min: 0 }, // centavos
    contraparte: { type: String }, // número de la otra cuenta en transferencias
    operacionId: { type: String, required: true },
  },
  { timestamps: { createdAt: 'fecha', updatedAt: false } },
);

movimientoSchema.index({ cuenta: 1, fecha: -1 });
// Un movimiento por (operación, tipo): reintentos/recuperaciones no duplican registros.
movimientoSchema.index({ operacionId: 1, tipo: 1 }, { unique: true });

export const Movimiento = mongoose.model('Movimiento', movimientoSchema);
