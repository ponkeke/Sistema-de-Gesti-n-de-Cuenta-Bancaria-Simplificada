import { focoClaro } from '../estilos.js';
import { MONEDA, enmascarar, fecha, hora, moneda } from '../utils.js';
import { IconoOjo, IconoOjoCerrado } from './Iconos.jsx';
import Spinner from './Spinner.jsx';

export default function SaldoCard({ cuenta, actualizadoEn, cargando, oculto, onAlternar }) {
  const Icono = oculto ? IconoOjoCerrado : IconoOjo;
  return (
    <section aria-labelledby="titulo-saldo" className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-lg sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h2 id="titulo-saldo" className="text-2xl font-semibold">Saldo disponible</h2>
        <button
          type="button"
          aria-pressed={oculto}
          onClick={onAlternar}
          className={`flex min-h-12 shrink-0 items-center gap-2 rounded-full border-2 border-white/70 px-4 text-lg font-semibold hover:bg-white/10 ${focoClaro}`}
        >
          <Icono className="h-6 w-6" />
          {oculto ? 'Mostrar saldo' : 'Ocultar saldo'}
        </button>
      </div>

      <p className="mt-4 break-words text-5xl font-extrabold tabular-nums tracking-tight sm:text-6xl" data-testid="saldo">
        {oculto ? <><span aria-hidden="true">{MONEDA.simbolo} ••••••</span><span className="sr-only">Saldo oculto</span></> : moneda(cuenta.saldo)}
      </p>

      <dl className="mt-6 grid gap-x-8 gap-y-3 text-lg sm:grid-cols-2">
        <div>
          <dt className="text-blue-100">Cuenta</dt>
          <dd className="font-semibold">{enmascarar(cuenta.numero)} · {MONEDA.codigo} ({MONEDA.simbolo})</dd>
        </div>
        <div>
          <dt className="text-blue-100">Última actualización</dt>
          <dd className="flex items-center gap-2 font-semibold">
            {actualizadoEn ? `${fecha(actualizadoEn)}, ${hora(actualizadoEn)}` : '—'}
            {cargando && <Spinner texto="Actualizando saldo" className="h-5 w-5" />}
          </dd>
        </div>
      </dl>
    </section>
  );
}
