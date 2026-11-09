const BASE = '/api/cuenta';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status; // 0 = sin conexión
  }
}

async function pedir(url, opciones = {}) {
  let res;
  try {
    res = await fetch(url, opciones);
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(datos.error || 'Error inesperado', res.status);
  return datos;
}

function post(ruta, cuerpo, claveIdempotencia) {
  return pedir(`${BASE}/${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': claveIdempotencia },
    body: JSON.stringify(cuerpo),
  });
}

export const consultarCuenta = (numero) => pedir(`${BASE}/${encodeURIComponent(numero)}`);
export const obtenerHistorial = (numero, pagina = 1, limite = 10) =>
  pedir(`${BASE}/${encodeURIComponent(numero)}/historial?pagina=${pagina}&limite=${limite}`);
export const depositar = (datos, clave) => post('deposito', datos, clave);
export const retirar = (datos, clave) => post('retiro', datos, clave);
export const transferir = (datos, clave) => post('transferencia', datos, clave);
