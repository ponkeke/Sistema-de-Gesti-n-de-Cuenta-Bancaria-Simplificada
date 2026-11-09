import { useCallback, useEffect, useState } from 'react';
import { consultarCuenta, obtenerHistorial } from '../api/cuentaApi.js';

const LIMITE = 8;

/** Carga saldo e historial de una cuenta y expone `recargar` tras cada operación. */
export function useCuenta(numero) {
  const [cuenta, setCuenta] = useState(null);
  const [historial, setHistorial] = useState({ movimientos: [], total: 0 });
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [actualizadoEn, setActualizadoEn] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError('');
    Promise.all([consultarCuenta(numero), obtenerHistorial(numero, pagina, LIMITE)])
      .then(([c, h]) => {
        if (cancelado) return;
        setCuenta(c);
        setHistorial(h);
        setActualizadoEn(new Date());
      })
      .catch((e) => {
        if (cancelado) return;
        setCuenta(null);
        setHistorial({ movimientos: [], total: 0 });
        setError(e.message);
      })
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [numero, pagina, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { cuenta, historial, pagina, setPagina, limite: LIMITE, cargando, error, actualizadoEn, recargar };
}
