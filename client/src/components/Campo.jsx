import { useId } from 'react';
import { IconoAlerta } from './Iconos.jsx';

/** Campo de formulario con etiqueta asociada, error visible y descripción accesible. */
export default function Campo({ etiqueta, error, ayuda, prefijo, ...props }) {
  const id = useId();
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const descritoPor = [error && idError, ayuda && idAyuda].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-lg font-semibold text-slate-900">
        {etiqueta}
      </label>
      <div className="relative">
        {prefijo && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xl font-semibold text-slate-700">
            {prefijo}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={descritoPor}
          className={`h-14 w-full rounded-xl border-2 bg-white text-xl text-slate-900 placeholder:text-slate-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${
            prefijo ? 'pl-14 pr-4' : 'px-4'
          } ${error ? 'border-red-700' : 'border-slate-600 focus:border-brand'}`}
          {...props}
        />
      </div>
      {ayuda && !error && <p id={idAyuda} className="mt-2 text-base text-slate-700">{ayuda}</p>}
      {error && (
        <p id={idError} role="alert" className="mt-2 flex items-start gap-2 text-base font-semibold text-red-800">
          <IconoAlerta className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
