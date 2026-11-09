import * as cuentas from '../services/cuentaService.js';
import { ejecutar } from '../services/operacionService.js';
import {
  validarClaveIdempotencia,
  validarDeposito,
  validarNumeroCuenta,
  validarRetiro,
  validarTransferencia,
} from '../validators/operaciones.js';

function responder(res, { resultado, repetida }) {
  if (repetida) res.set('Idempotent-Replayed', 'true');
  res.status(repetida ? 200 : 201).json(resultado);
}

export async function consultar(req, res) {
  const numero = validarNumeroCuenta(req.params.numero, 'numero');
  res.status(200).json(await cuentas.obtenerCuenta(numero));
}

export async function historial(req, res) {
  const numero = validarNumeroCuenta(req.params.numero, 'numero');
  const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
  const limite = Math.min(100, Math.max(1, parseInt(req.query.limite, 10) || 20));
  res.status(200).json(await cuentas.obtenerHistorial(numero, { pagina, limite }));
}

export async function deposito(req, res) {
  const clave = validarClaveIdempotencia(req);
  responder(res, await ejecutar('deposito', validarDeposito(req), clave));
}

export async function retiro(req, res) {
  const clave = validarClaveIdempotencia(req);
  responder(res, await ejecutar('retiro', validarRetiro(req), clave));
}

export async function transferencia(req, res) {
  const clave = validarClaveIdempotencia(req);
  responder(res, await ejecutar('transferencia', validarTransferencia(req), clave));
}
