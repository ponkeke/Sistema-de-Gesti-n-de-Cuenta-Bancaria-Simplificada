import { AppError } from '../utils/AppError.js';
import { MONTO_MAXIMO, aCentavos } from '../utils/dinero.js';

const RE_NUMERO = /^[A-Za-z0-9-]{4,24}$/;

export function validarNumeroCuenta(valor, campo = 'cuenta') {
  if (typeof valor !== 'string' || !RE_NUMERO.test(valor.trim())) {
    throw new AppError(400, `El campo "${campo}" es inválido (4-24 caracteres alfanuméricos o guiones)`);
  }
  return valor.trim();
}

export function validarMonto(valor) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new AppError(400, 'El monto debe ser un número');
  }
  if (valor <= 0) throw new AppError(400, 'El monto debe ser mayor a cero');
  if (valor > MONTO_MAXIMO) throw new AppError(400, `El monto no puede superar ${MONTO_MAXIMO}`);
  const centavos = aCentavos(valor);
  if (Math.abs(valor * 100 - centavos) > 1e-6) {
    throw new AppError(400, 'El monto admite como máximo 2 decimales');
  }
  if (centavos < 1) throw new AppError(400, 'El monto debe ser mayor a cero');
  return centavos;
}

function cuerpo(req) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new AppError(400, 'El cuerpo de la petición debe ser un objeto JSON');
  }
  return req.body;
}

export function validarClaveIdempotencia(req) {
  const clave = req.get('Idempotency-Key');
  if (clave === undefined) return undefined;
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(clave)) {
    throw new AppError(400, 'Idempotency-Key inválida (8-100 caracteres alfanuméricos, _ o -)');
  }
  return clave;
}

export function validarDeposito(req) {
  const b = cuerpo(req);
  return { cuenta: validarNumeroCuenta(b.cuenta), monto: validarMonto(b.monto) };
}

export const validarRetiro = validarDeposito;

export function validarTransferencia(req) {
  const b = cuerpo(req);
  const origen = validarNumeroCuenta(b.origen, 'origen');
  const destino = validarNumeroCuenta(b.destino, 'destino');
  const monto = validarMonto(b.monto);
  if (origen === destino) throw new AppError(400, 'No se puede transferir a la misma cuenta');
  return { origen, destino, monto };
}
