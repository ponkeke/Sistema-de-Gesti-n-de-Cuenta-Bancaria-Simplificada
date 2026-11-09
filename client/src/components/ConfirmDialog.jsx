import { useEffect, useId, useRef } from 'react';
import { botonPrimario, botonSecundario } from '../estilos.js';
import Spinner from './Spinner.jsx';

/**
 * Confirmación previa a una operación sensible. Usa <dialog> modal nativo:
 * atrapa el foco, cierra con Escape y devuelve el foco al elemento que lo abrió.
 */
export default function ConfirmDialog({ abierto, titulo, filas, textoConfirmar, enviando, onConfirmar, onCancelar }) {
  const ref = useRef(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault(); // evita cierre mientras se procesa
        if (!enviando) onCancelar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl p-0 text-slate-900 shadow-2xl backdrop:bg-brand-dark/70"
    >
      <div className="p-6 sm:p-8">
        <h2 id={idTitulo} className="text-2xl font-bold text-brand-dark">{titulo}</h2>
        <p className="mt-2 text-lg text-slate-700">Revisa los datos antes de continuar.</p>
        <dl className="mt-5 divide-y divide-slate-300 rounded-2xl border-2 border-slate-300 bg-surface">
          {filas.map(([etiqueta, valor]) => (
            <div key={etiqueta} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
              <dt className="text-lg text-slate-700">{etiqueta}</dt>
              <dd className="text-xl font-bold break-words">{valor}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button type="button" onClick={onCancelar} disabled={enviando} className={botonSecundario}>
            Cancelar
          </button>
          <button type="button" onClick={onConfirmar} disabled={enviando} className={botonPrimario}>
            {enviando ? (<><Spinner texto="Procesando operación" /> Procesando…</>) : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
