import { useRef, useState } from 'react';

/**
 * Ejecuta una operación con clave de idempotencia y protección contra doble envío.
 * La clave se conserva si el fallo fue de red o del servidor (reintento seguro) y se
 * renueva tras un éxito o un error de validación (4xx).
 */
export function useOperacion(funcionApi, alExito) {
  const clave = useRef(crypto.randomUUID());
  const enCurso = useRef(false); // bloqueo síncrono: el estado de React se actualiza tarde
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'ok' | 'error', texto }

  async function ejecutar(datos, textoExito) {
    if (enCurso.current) return false;
    enCurso.current = true;
    setEnviando(true);
    setMensaje(null);
    try {
      const respuesta = await funcionApi(datos, clave.current);
      clave.current = crypto.randomUUID();
      const texto = typeof textoExito === 'function' ? textoExito(respuesta) : textoExito;
      setMensaje({ tipo: 'ok', texto });
      alExito?.();
      return true;
    } catch (e) {
      if (e.status >= 400 && e.status < 500) clave.current = crypto.randomUUID();
      setMensaje({ tipo: 'error', texto: e.message });
      return false;
    } finally {
      enCurso.current = false;
      setEnviando(false);
    }
  }

  return { ejecutar, enviando, mensaje, limpiar: () => setMensaje(null) };
}
