import { retirar } from '../api/cuentaApi.js';
import { moneda } from '../utils.js';
import FormMonto from './FormMonto.jsx';
import { IconoRetiro } from './Iconos.jsx';

export default function FormRetiro({ numero, onExito }) {
  return (
    <FormMonto
      titulo="Retirar"
      descripcion="Retira dinero de tu saldo disponible."
      Icono={IconoRetiro}
      textoBoton="Retirar"
      tituloConfirmar="Confirmar retiro"
      apiFn={retirar}
      numero={numero}
      onExito={onExito}
      ayuda="No puedes retirar más de tu saldo disponible."
      textoExito={(monto, saldo) => `Retiro de ${moneda(monto)} realizado. Tu nuevo saldo es ${moneda(saldo)}.`}
    />
  );
}
