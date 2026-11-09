import { botonSecundario } from '../estilos.js';
import { IconoVacio } from './Iconos.jsx';
import MovimientoItem from './MovimientoItem.jsx';
import Spinner from './Spinner.jsx';

export default function HistorialTransacciones({ historial, pagina, limite, cargando, onPagina }) {
  const { movimientos, total } = historial;
  const paginas = Math.max(1, Math.ceil(total / limite));

  return (
    <section aria-labelledby="titulo-historial" aria-busy={cargando} className="rounded-3xl bg-white p-6 shadow sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 id="titulo-historial" className="text-2xl font-bold text-brand-dark sm:text-3xl">Últimos movimientos</h2>
        {cargando && <Spinner texto="Actualizando movimientos" />}
      </div>

      {movimientos.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-surface px-4 py-10 text-center">
          <IconoVacio className="h-12 w-12 text-brand" />
          <p className="text-xl font-semibold">Aún no tienes movimientos</p>
          <p className="text-lg text-slate-700">Cuando deposites, retires o transfieras dinero, lo verás aquí.</p>
        </div>
      ) : (
        <ul className="mt-2 divide-y-2 divide-slate-200">
          {movimientos.map((m) => <MovimientoItem key={m.id} movimiento={m} />)}
        </ul>
      )}

      {paginas > 1 && (
        <nav aria-label="Paginación del historial" className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" disabled={pagina <= 1} onClick={() => onPagina(pagina - 1)} className={`${botonSecundario} sm:w-auto`}>
            Anterior
          </button>
          <p className="text-center text-lg font-semibold">Página {pagina} de {paginas}</p>
          <button type="button" disabled={pagina >= paginas} onClick={() => onPagina(pagina + 1)} className={`${botonSecundario} sm:w-auto`}>
            Siguiente
          </button>
        </nav>
      )}
    </section>
  );
}
