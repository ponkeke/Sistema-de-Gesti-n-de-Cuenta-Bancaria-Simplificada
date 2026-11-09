import { useState } from 'react';
import { transferir } from '../api/cuentaApi.js';
import { useOperacion } from '../hooks/useOperacion.js';
import { enmascarar, leerMonto, moneda } from '../utils.js';
import Campo from './Campo.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import FormOperacion from './FormOperacion.jsx';
import { IconoTransferencia } from './Iconos.jsx';

export default function FormTransferencia({ numero, onExito }) {
  const [destino, setDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [errores, setErrores] = useState({});
  const [pendiente, setPendiente] = useState(null); // { destino, valor }
  const { ejecutar, enviando, mensaje, limpiar } = useOperacion(transferir, onExito);

  function pedirConfirmacion(e) {
    e.preventDefault();
    const dest = destino.trim();
    const { valor, error } = leerMonto(monto);
    const nuevos = {};
    if (!dest) nuevos.destino = 'Ingresa la cuenta de destino.';
    else if (dest === numero) nuevos.destino = 'No puedes transferir a tu propia cuenta.';
    if (error) nuevos.monto = error;
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    limpiar();
    setPendiente({ destino: dest, valor });
  }

  async function confirmar() {
    const { destino: dest, valor } = pendiente;
    const ok = await ejecutar(
      { origen: numero, destino: dest, monto: valor },
      (r) => `Transferencia de ${moneda(valor)} a la cuenta ${dest} realizada. Tu nuevo saldo es ${moneda(r.saldoOrigen)}.`,
    );
    setPendiente(null);
    if (ok) {
      setMonto('');
      setDestino('');
    }
  }

  return (
    <>
      <FormOperacion
        titulo="Transferir"
        descripcion="Envía dinero a otra cuenta de Mi Banco."
        Icono={IconoTransferencia}
        textoBoton="Transferir"
        onSubmit={pedirConfirmacion}
        mensaje={mensaje}
      >
        <Campo
          etiqueta="Cuenta de destino"
          autoComplete="off"
          placeholder="Ej. 1002"
          value={destino}
          error={errores.destino}
          onChange={(e) => { setDestino(e.target.value); setErrores((x) => ({ ...x, destino: '' })); }}
        />
        <Campo
          etiqueta="¿Qué monto?"
          prefijo="S/"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={monto}
          error={errores.monto}
          onChange={(e) => { setMonto(e.target.value); setErrores((x) => ({ ...x, monto: '' })); }}
        />
      </FormOperacion>
      <ConfirmDialog
        abierto={pendiente !== null}
        titulo="Confirmar transferencia"
        filas={[
          ['Desde', enmascarar(numero)],
          ['Hacia la cuenta', pendiente?.destino ?? ''],
          ['Monto', moneda(pendiente?.valor ?? 0)],
        ]}
        textoConfirmar="Confirmar transferencia"
        enviando={enviando}
        onConfirmar={confirmar}
        onCancelar={() => setPendiente(null)}
      />
    </>
  );
}
