import { IconoAlerta, IconoCheck } from './Iconos.jsx';

/** Mensaje de éxito o error. Usa icono + texto, no solo color. */
export default function Alertas({ mensaje }) {
  if (!mensaje) return null;
  const ok = mensaje.tipo === 'ok';
  const Icono = ok ? IconoCheck : IconoAlerta;
  return (
    <div
      role={ok ? 'status' : 'alert'}
      className={`flex items-start gap-3 rounded-xl border-2 p-4 text-lg font-medium ${
        ok ? 'border-green-700 bg-green-50 text-green-900' : 'border-red-700 bg-red-50 text-red-900'
      }`}
    >
      <Icono className="mt-0.5 h-7 w-7 shrink-0" />
      <p className="min-w-0 break-words">{mensaje.texto}</p>
    </div>
  );
}
