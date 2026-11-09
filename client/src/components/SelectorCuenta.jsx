import { useState } from 'react';
import { botonSecundario } from '../estilos.js';
import Campo from './Campo.jsx';

export default function SelectorCuenta({ numero, onCambiar }) {
  const [texto, setTexto] = useState(numero);
  const [error, setError] = useState('');

  function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return setError('Ingresa un número de cuenta.');
    setError('');
    onCambiar(texto.trim());
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <Campo
        etiqueta="Número de cuenta"
        value={texto}
        error={error}
        autoComplete="off"
        onChange={(e) => setTexto(e.target.value)}
      />
      <button className={botonSecundario}>Ver esta cuenta</button>
    </form>
  );
}
