// La API no almacena moneda: la interfaz presenta todos los montos en soles peruanos.
export const MONEDA = { codigo: 'PEN', simbolo: 'S/' };

const formatoMoneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: MONEDA.codigo });
export const moneda = (n) => formatoMoneda.format(n).replace(/ /g, ' '); // S/ 1,250.00

export const fecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
export const hora = (iso) =>
  new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

/** Oculta parcialmente el número de cuenta: 12345678 -> •••• 5678 */
export function enmascarar(numero) {
  const v = String(numero);
  return v.length > 4 ? `•••• ${v.slice(-4)}` : `•• ${v.slice(-2)}`;
}

export function saludo(fechaActual = new Date()) {
  const h = fechaActual.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Convierte el texto del campo a número; devuelve un mensaje claro si no es válido. */
export function leerMonto(texto) {
  let t = String(texto).replace(/\s/g, '');
  if (!t) return { error: 'Ingresa el monto.' };
  t = t.includes('.') ? t.replace(/,/g, '') : t.replace(',', '.'); // 1,250.50 o 1250,50
  if (!/^\d+(\.\d+)?$/.test(t)) return { error: 'Escribe solo números, por ejemplo 150.00.' };
  const valor = Number(t);
  if (valor <= 0) return { error: 'El monto debe ser mayor a cero.' };
  if (Math.abs(valor * 100 - Math.round(valor * 100)) > 1e-6) return { error: 'Usa como máximo 2 decimales.' };
  if (valor > 1_000_000_000) return { error: 'El monto supera el máximo permitido.' };
  return { valor };
}
