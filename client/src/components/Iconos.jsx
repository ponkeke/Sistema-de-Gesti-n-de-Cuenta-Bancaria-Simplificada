// Iconos SVG propios (decorativos: el significado siempre se comunica también con texto).
function Base({ className = 'h-6 w-6', children }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconoDeposito = (p) => (
  <Base {...p}><path d="M12 3v12m0 0-4-4m4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></Base>
);
export const IconoRetiro = (p) => (
  <Base {...p}><path d="M12 15V3m0 0L8 7m4-4 4 4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></Base>
);
export const IconoTransferencia = (p) => (
  <Base {...p}><path d="M4 8h14m0 0-4-4m4 4-4 4" /><path d="M20 16H6m0 0 4-4m-4 4 4 4" /></Base>
);
export const IconoOjo = (p) => (
  <Base {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Base>
);
export const IconoOjoCerrado = (p) => (
  <Base {...p}><path d="M3 3l18 18" /><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.4-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></Base>
);
export const IconoUsuario = (p) => (
  <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Base>
);
export const IconoCheck = (p) => (
  <Base {...p}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></Base>
);
export const IconoAlerta = (p) => (
  <Base {...p}><path d="M12 3 2 21h20L12 3Z" /><path d="M12 10v5m0 3v.01" /></Base>
);
export const IconoIngreso = (p) => (
  <Base {...p}><path d="M17 7 7 17m0 0h8m-8 0V9" /></Base>
);
export const IconoSalida = (p) => (
  <Base {...p}><path d="M7 17 17 7m0 0H9m8 0v8" /></Base>
);
export const IconoVacio = (p) => (
  <Base {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></Base>
);
