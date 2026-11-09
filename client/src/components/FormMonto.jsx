import { useState } from 'react';
import { useOperacion } from '../hooks/useOperacion.js';
import { enmascarar, leerMonto, moneda } from '../utils.js';
import Campo from './Campo.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import FormOperacion from './FormOperacion.jsx';

/** Formulario compartido por depósito y retiro (un monto sobre la cuenta activa). */
export default function FormMonto({ titulo, descripcion, Icono, textoBoton, tituloConfirmar, apiFn, numero, onExito, textoExito, ayuda }) {
  const [monto, setMonto] = useState('');
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(null); // monto a confirmar
  const { ejecutar, enviando, mensaje, limpiar } = useOperacion(apiFn, onExito);

  function pedirConfirmacion(e) {
    e.preventDefault();
    const { valor, error: err } = leerMonto(monto);
    setError(err || '');
    if (err) return;
    limpiar();
    setPendiente(valor);
  }

  async function confirmar() {
    const valor = pendiente;
    const ok = await ejecutar({ cuenta: numero, monto: valor }, (r) => textoExito(valor, r.saldo));
    setPendiente(null);
    if (ok) setMonto('');
  }

  return (
    <>
      <FormOperacion titulo={titulo} descripcion={descripcion} Icono={Icono} textoBoton={textoBoton} onSubmit={pedirConfirmacion} mensaje={mensaje}>
        <Campo
          etiqueta="¿Qué monto?"
          prefijo="S/"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={monto}
          error={error}
          ayuda={ayuda}
          onChange={(e) => { setMonto(e.target.value); setError(''); }}
        />
      </FormOperacion>
      <ConfirmDialog
        abierto={pendiente !== null}
        titulo={tituloConfirmar}
        filas={[['Cuenta', enmascarar(numero)], ['Monto', moneda(pendiente ?? 0)]]}
        textoConfirmar={tituloConfirmar}
        enviando={enviando}
        onConfirmar={confirmar}
        onCancelar={() => setPendiente(null)}
      />
    </>
  );
}
