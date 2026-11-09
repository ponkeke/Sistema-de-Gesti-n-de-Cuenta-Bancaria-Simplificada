import mongoose from 'mongoose';

const cuentaSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true, trim: true },
    titular: { type: String, required: true, trim: true },
    // Saldo en centavos (entero >= 0). Nunca puede ser negativo.
    saldo: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: { validator: Number.isInteger, message: 'El saldo debe ser un entero (centavos)' },
    },
    // Últimas operaciones aplicadas: hace idempotente cada modificación de saldo.
    aplicadas: { type: [String], default: [], select: false },
  },
  { timestamps: true },
);

export const Cuenta = mongoose.model('Cuenta', cuentaSchema);
