// Los montos se almacenan como enteros en centavos para evitar errores de coma flotante.
export const MONTO_MAXIMO = 1_000_000_000; // 1.000 millones

export function aCentavos(pesos) {
  return Math.round(pesos * 100);
}

export function aPesos(centavos) {
  return centavos / 100;
}
