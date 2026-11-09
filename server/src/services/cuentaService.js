import { Cuenta } from '../models/Cuenta.js';
import { Movimiento } from '../models/Movimiento.js';
import { AppError } from '../utils/AppError.js';
import { aPesos } from '../utils/dinero.js';

export function presentarCuenta(c) {
  return { numero: c.numero, titular: c.titular, saldo: aPesos(c.saldo) };
}

function presentarMovimiento(m) {
  return {
    id: m._id,
    tipo: m.tipo,
    monto: aPesos(m.monto),
    saldoResultante: aPesos(m.saldoResultante),
    contraparte: m.contraparte ?? null,
    operacionId: m.operacionId,
    fecha: m.fecha,
  };
}

export async function obtenerCuenta(numero) {
  const cuenta = await Cuenta.findOne({ numero });
  if (!cuenta) throw new AppError(404, `La cuenta ${numero} no existe`);
  return presentarCuenta(cuenta);
}

export async function obtenerHistorial(numero, { pagina = 1, limite = 20 } = {}) {
  const cuenta = await Cuenta.findOne({ numero });
  if (!cuenta) throw new AppError(404, `La cuenta ${numero} no existe`);
  const filtro = { cuenta: numero };
  const [total, movimientos] = await Promise.all([
    Movimiento.countDocuments(filtro),
    Movimiento.find(filtro)
      .sort({ fecha: -1, _id: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
  ]);
  return {
    cuenta: presentarCuenta(cuenta),
    pagina,
    limite,
    total,
    movimientos: movimientos.map(presentarMovimiento),
  };
}
