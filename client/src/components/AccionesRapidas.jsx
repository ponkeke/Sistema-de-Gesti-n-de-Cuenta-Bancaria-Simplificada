import { foco } from '../estilos.js';
import { IconoDeposito, IconoRetiro, IconoTransferencia } from './Iconos.jsx';

const ACCIONES = [
  { id: 'deposito', titulo: 'Depositar', descripcion: 'Agrega dinero a tu cuenta', Icono: IconoDeposito },
  { id: 'retiro', titulo: 'Retirar', descripcion: 'Saca dinero de tu saldo', Icono: IconoRetiro },
  { id: 'transferencia', titulo: 'Transferir', descripcion: 'Envía dinero a otra cuenta', Icono: IconoTransferencia },
];

/** Accesos directos a las operaciones; el elegido queda marcado con aria-pressed. */
export default function AccionesRapidas({ activa, onSeleccionar }) {
  return (
    <section aria-labelledby="titulo-acciones">
      <h2 id="titulo-acciones" className="mb-4 text-2xl font-bold text-brand-dark sm:text-3xl">¿Qué quieres hacer?</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {ACCIONES.map(({ id, titulo, descripcion, Icono }) => {
          const seleccionada = activa === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={seleccionada}
              aria-controls="panel-operacion"
              onClick={() => onSeleccionar(id)}
              className={`flex min-h-28 items-center gap-4 rounded-2xl border-2 p-5 text-left motion-safe:transition-colors sm:flex-col sm:items-start sm:gap-3 ${foco} ${
                seleccionada
                  ? 'border-brand-dark bg-brand text-white shadow-lg'
                  : 'border-brand bg-white text-brand-dark hover:bg-blue-50'
              }`}
            >
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${seleccionada ? 'bg-white text-brand' : 'bg-brand text-white'}`}>
                <Icono className="h-8 w-8" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-bold">{titulo}</span>
                <span className={`mt-1 block text-lg ${seleccionada ? 'text-blue-50' : 'text-slate-700'}`}>{descripcion}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
