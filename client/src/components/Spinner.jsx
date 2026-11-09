/** Indicador de carga accesible; `texto` se anuncia a lectores de pantalla. */
export default function Spinner({ texto = 'Cargando', className = 'h-6 w-6' }) {
  return (
    <span role="status" className="inline-flex items-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} animate-spin motion-reduce:animate-none`}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{texto}</span>
    </span>
  );
}
