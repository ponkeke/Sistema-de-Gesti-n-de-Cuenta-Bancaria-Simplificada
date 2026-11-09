import { Cuenta } from '../models/Cuenta.js';
import { Movimiento } from '../models/Movimiento.js';
import { Operacion } from '../models/Operacion.js';
import { AppError } from '../utils/AppError.js';
import { aPesos } from '../utils/dinero.js';

/**
 * Modifica el saldo de forma atómica (un único findOneAndUpdate sobre un documento):
 *  - débitos: solo si saldo >= monto (nunca queda negativo);
 *  - idempotente por operación: si opId ya fue aplicado, no vuelve a aplicarse.
 */
async function aplicar(numero, delta, opId) {
  const filtro = { numero, aplicadas: { $ne: opId } };
  if (delta < 0) filtro.saldo = { $gte: -delta };
  const cuenta = await Cuenta.findOneAndUpdate(
    filtro,
    { $inc: { saldo: delta }, $push: { aplicadas: { $each: [opId], $slice: -200 } } },
    { returnDocument: 'after' },
  );
  if (cuenta) return cuenta;

  const actual = await Cuenta.findOne({ numero }).select('+aplicadas');
  if (!actual) throw new AppError(404, `La cuenta ${numero} no existe`);
  if (actual.aplicadas.includes(opId)) return actual; // ya aplicado (recuperación)
  throw new AppError(400, 'Saldo insuficiente');
}

function registrarMovimiento(opId, datos) {
  // upsert + $setOnInsert: idempotente frente a reintentos/recuperaciones.
  return Movimiento.updateOne(
    { operacionId: opId, tipo: datos.tipo },
    { $setOnInsert: { ...datos, operacionId: opId } },
    { upsert: true },
  );
}

async function ejecutarPasos(op) {
  const opId = String(op._id);
  const d = op.datos;

  if (op.tipo === 'deposito' || op.tipo === 'retiro') {
    const delta = op.tipo === 'deposito' ? d.monto : -d.monto;
    const cuenta = await aplicar(d.cuenta, delta, opId);
    await registrarMovimiento(opId, {
      cuenta: d.cuenta,
      tipo: op.tipo,
      monto: d.monto,
      saldoResultante: cuenta.saldo,
    });
    return {
      operacionId: opId,
      tipo: op.tipo,
      monto: aPesos(d.monto),
      cuenta: d.cuenta,
      saldo: aPesos(cuenta.saldo),
    };
  }

  // transferencia
  const destino = await Cuenta.exists({ numero: d.destino });
  if (!destino) throw new AppError(404, `La cuenta destino ${d.destino} no existe`);

  const origen = await aplicar(d.origen, -d.monto, opId); // débito (falla sin efectos si no hay saldo)
  await Operacion.updateOne({ _id: op._id }, { paso: 'debitada' });
  let dest;
  try {
    dest = await aplicar(d.destino, d.monto, opId); // crédito
  } catch (err) {
    await aplicar(d.origen, d.monto, `${opId}:reverso`); // compensación
    throw err;
  }
  await registrarMovimiento(opId, {
    cuenta: d.origen,
    tipo: 'transferencia_enviada',
    monto: d.monto,
    saldoResultante: origen.saldo,
    contraparte: d.destino,
  });
  await registrarMovimiento(opId, {
    cuenta: d.destino,
    tipo: 'transferencia_recibida',
    monto: d.monto,
    saldoResultante: dest.saldo,
    contraparte: d.origen,
  });
  return {
    operacionId: opId,
    tipo: 'transferencia',
    monto: aPesos(d.monto),
    origen: d.origen,
    destino: d.destino,
    saldoOrigen: aPesos(origen.saldo),
  };
}

async function procesar(op) {
  try {
    const resultado = await ejecutarPasos(op);
    await Operacion.updateOne({ _id: op._id }, { estado: 'completada', paso: 'completada', resultado });
    return resultado;
  } catch (err) {
    if (err instanceof AppError) {
      // Fallo de negocio sin efectos: se libera la clave para permitir un nuevo intento.
      await Operacion.updateOne(
        { _id: op._id },
        { $set: { estado: 'fallida', error: err.message }, $unset: { idempotencyKey: '' } },
      );
    }
    // Error inesperado: la operación queda pendiente y la recupera recuperarPendientes().
    throw err;
  }
}

/**
 * Punto de entrada común. Devuelve { resultado, repetida }.
 * Con Idempotency-Key, un reintento devuelve el resultado original sin volver a operar.
 */
export async function ejecutar(tipo, datos, idempotencyKey) {
  let op;
  try {
    op = await Operacion.create({ tipo, datos, idempotencyKey });
  } catch (err) {
    if (err.code === 11000 && idempotencyKey) {
      const previa = await Operacion.findOne({ idempotencyKey });
      if (!previa) throw new AppError(409, 'Conflicto de idempotencia, reintente');
      if (previa.tipo !== tipo || JSON.stringify(previa.datos) !== JSON.stringify(datos)) {
        throw new AppError(409, 'Idempotency-Key ya utilizada con una petición distinta');
      }
      if (previa.estado === 'completada') return { resultado: previa.resultado, repetida: true };
      throw new AppError(409, 'La operación original aún se está procesando');
    }
    throw err;
  }
  return { resultado: await procesar(op), repetida: false };
}

/** Al arrancar: completa de forma idempotente las operaciones que quedaron pendientes. */
export async function recuperarPendientes() {
  const pendientes = await Operacion.find({ estado: 'pendiente' });
  let recuperadas = 0;
  for (const op of pendientes) {
    try {
      await procesar(op);
      recuperadas += 1;
    } catch (err) {
      console.error(`No se pudo recuperar la operación ${op._id}: ${err.message}`);
    }
  }
  return recuperadas;
}
