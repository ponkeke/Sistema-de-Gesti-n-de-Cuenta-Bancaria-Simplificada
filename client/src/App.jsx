import { useEffect, useRef, useState } from 'react';
import { useCuenta } from './hooks/useCuenta.js';
import { saludo } from './utils.js';
import AccionesRapidas from './components/AccionesRapidas.jsx';
import Alertas from './components/Alertas.jsx';
import FormDeposito from './components/FormDeposito.jsx';
import FormRetiro from './components/FormRetiro.jsx';
import FormTransferencia from './components/FormTransferencia.jsx';
import HistorialTransacciones from './components/HistorialTransacciones.jsx';
import Navbar from './components/Navbar.jsx';
import SaldoCard from './components/SaldoCard.jsx';
import SelectorCuenta from './components/SelectorCuenta.jsx';
import Spinner from './components/Spinner.jsx';

export default function App() {
  const [numero, setNumero] = useState('1001');
  const [operacion, setOperacion] = useState(null);
  const [oculto, setOculto] = useState(false);
  const panel = useRef(null);
  const { cuenta, historial, pagina, setPagina, limite, cargando, error, actualizadoEn, recargar } = useCuenta(numero);

  // Al elegir una operación, lleva el foco al formulario (teclado y lectores de pantalla).
  useEffect(() => {
    if (operacion) panel.current?.focus({ preventScroll: false });
  }, [operacion]);

  function cambiarCuenta(nuevo) {
    if (nuevo === numero) return recargar();
    setPagina(1);
    setOperacion(null);
    setNumero(nuevo);
  }

  const primerNombre = cuenta?.titular.split(' ')[0];

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-lg focus:font-semibold focus:text-brand-dark">
        Saltar al contenido
      </a>
      <Navbar cuenta={cuenta} numero={numero} onCambiarCuenta={cambiarCuenta} />

      <main id="contenido" className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {cuenta ? (
          <>
            <h1 className="text-4xl font-bold text-brand-dark">
              {saludo()}, {primerNombre}
            </h1>
            <SaldoCard cuenta={cuenta} actualizadoEn={actualizadoEn} cargando={cargando} oculto={oculto} onAlternar={() => setOculto((o) => !o)} />
            <AccionesRapidas activa={operacion} onSeleccionar={setOperacion} />

            {operacion && (
              <div
                id="panel-operacion"
                ref={panel}
                tabIndex={-1}
                role="region"
                aria-labelledby="titulo-operacion"
                className="scroll-mt-28 rounded-3xl border-2 border-brand bg-white p-6 shadow outline-none sm:p-8"
              >
                {operacion === 'deposito' && <FormDeposito key="d" numero={numero} onExito={recargar} />}
                {operacion === 'retiro' && <FormRetiro key="r" numero={numero} onExito={recargar} />}
                {operacion === 'transferencia' && <FormTransferencia key="t" numero={numero} onExito={recargar} />}
              </div>
            )}

            <HistorialTransacciones historial={historial} pagina={pagina} limite={limite} cargando={cargando} onPagina={setPagina} />
          </>
        ) : cargando ? (
          <div className="flex items-center justify-center gap-3 py-20 text-xl text-slate-700">
            <Spinner texto="Cargando tu cuenta" className="h-8 w-8" /> Cargando tu cuenta…
          </div>
        ) : (
          <section aria-labelledby="titulo-error" className="space-y-5 rounded-3xl bg-white p-6 shadow sm:p-8">
            <h1 id="titulo-error" className="text-4xl font-bold text-brand-dark">No pudimos mostrar tu cuenta</h1>
            <Alertas mensaje={{ tipo: 'error', texto: error }} />
            <p className="text-lg text-slate-700">Verifica el número e inténtalo nuevamente.</p>
            <SelectorCuenta numero={numero} onCambiar={cambiarCuenta} />
          </section>
        )}
      </main>
    </>
  );
}
