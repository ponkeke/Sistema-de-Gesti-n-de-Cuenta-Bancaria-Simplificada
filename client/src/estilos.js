// Clases Tailwind compartidas (anillo de foco visible, WCAG 2.4.7 / 2.4.11).
export const foco =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-dark';
export const focoClaro =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white';

export const botonPrimario =
  `inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-accent px-6 text-lg font-bold text-brand-dark shadow-sm motion-safe:transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70 ${foco}`;

export const botonSecundario =
  `inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border-2 border-brand bg-white px-6 text-lg font-semibold text-brand-dark motion-safe:transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70 ${foco}`;
