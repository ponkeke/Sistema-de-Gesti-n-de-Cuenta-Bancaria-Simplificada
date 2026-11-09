import { botonPrimario } from '../estilos.js';
import Alertas from './Alertas.jsx';

/** Estructura común de cada operación: encabezado, campos, mensajes y botón de acción. */
export default function FormOperacion({ titulo, descripcion, Icono, textoBoton, onSubmit, mensaje, children }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
          <Icono className="h-8 w-8" />
        </span>
        <div>
          <h2 id="titulo-operacion" className="text-2xl font-bold text-brand-dark sm:text-3xl">{titulo}</h2>
          <p className="mt-1 text-lg text-slate-700">{descripcion}</p>
        </div>
      </div>
      {children}
      <Alertas mensaje={mensaje} />
      <button type="submit" className={botonPrimario}>{textoBoton}</button>
    </form>
  );
}
