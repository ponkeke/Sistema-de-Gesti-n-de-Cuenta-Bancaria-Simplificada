import { useEffect, useId, useRef, useState } from 'react';
import { focoClaro } from '../estilos.js';
import { enmascarar } from '../utils.js';
import { IconoUsuario } from './Iconos.jsx';
import SelectorCuenta from './SelectorCuenta.jsx';

export default function Navbar({ cuenta, numero, onCambiarCuenta }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const idMenu = useId();

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => !contenedor.current?.contains(e.target) && setAbierto(false);
    const tecla = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [abierto]);

  return (
    <header className="sticky top-0 z-30 bg-brand-dark text-white shadow-md">
      <nav aria-label="Principal" className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-extrabold text-brand">
            M<span className="text-accent">B</span>
          </span>
          <span className="text-2xl font-bold tracking-tight">Mi Banco</span>
        </div>

        <div ref={contenedor} className="relative">
          <button
            type="button"
            aria-expanded={abierto}
            aria-controls={idMenu}
            onClick={() => setAbierto((a) => !a)}
            className={`flex min-h-12 items-center gap-3 rounded-full border-2 border-white/60 py-1 pl-2 pr-4 text-lg font-semibold hover:bg-white/10 ${focoClaro}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand">
              <IconoUsuario className="h-6 w-6" />
            </span>
            Perfil
          </button>

          {abierto && (
            <div id={idMenu} className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
              <p className="text-xl font-bold">{cuenta ? cuenta.titular : 'Sin cuenta cargada'}</p>
              <p className="mb-4 mt-1 text-lg text-slate-700">Cuenta {enmascarar(numero)}</p>
              <SelectorCuenta
                numero={numero}
                onCambiar={(n) => {
                  onCambiarCuenta(n);
                  setAbierto(false);
                }}
              />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
