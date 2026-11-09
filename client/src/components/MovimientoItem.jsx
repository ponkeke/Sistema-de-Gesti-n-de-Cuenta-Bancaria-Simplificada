import { fecha, hora, moneda } from '../utils.js';
import { IconoIngreso, IconoSalida } from './Iconos.jsx';

const TIPOS = {
  deposito: { titulo: 'Depósito', ingreso: true },
  retiro: { titulo: 'Retiro', ingreso: false },
  transferencia_enviada: { titulo: 'Transferencia enviada', ingreso: false, relacion: 'Hacia la cuenta' },
  transferencia_recibida: { titulo: 'Transferencia recibida', ingreso: true, relacion: 'Desde la cuenta' },
};

/** Una fila del historial. Ingreso/salida se indican con icono, signo y texto además del color. */
export default function MovimientoItem({ movimiento }) {
  const t = TIPOS[movimiento.tipo];
  const Icono = t.ingreso ? IconoIngreso : IconoSalida;
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-5">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          t.ingreso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        <Icono className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="text-xl font-semibold text-slate-900">{t.titulo}</p>
        <p className="text-base text-slate-700">
          <time dateTime={movimiento.fecha}>{fecha(movimiento.fecha)} · {hora(movimiento.fecha)}</time>
        </p>
        {movimiento.contraparte && (
          <p className="text-base text-slate-700">{t.relacion} <span className="font-semibold">{movimiento.contraparte}</span></p>
        )}
      </div>
      <p className={`text-xl font-bold tabular-nums ${t.ingreso ? 'text-green-800' : 'text-red-800'}`}>
        <span className="sr-only">{t.ingreso ? 'Ingreso de ' : 'Salida de '}</span>
        <span aria-hidden="true">{t.ingreso ? '+ ' : '− '}</span>
        {moneda(movimiento.monto)}
      </p>
    </li>
  );
}
