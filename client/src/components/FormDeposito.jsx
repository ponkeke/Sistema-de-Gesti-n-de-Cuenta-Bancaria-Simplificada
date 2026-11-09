import { depositar } from '../api/cuentaApi.js';
import { moneda } from '../utils.js';
import FormMonto from './FormMonto.jsx';
import { IconoDeposito } from './Iconos.jsx';

export default function FormDeposito({ numero, onExito }) {
  return (
    <FormMonto
      titulo="Depositar"
      descripcion="Agrega dinero a tu cuenta al instante."
      Icono={IconoDeposito}
      textoBoton="Depositar"
      tituloConfirmar="Confirmar depósito"
      apiFn={depositar}
      numero={numero}
      onExito={onExito}
      textoExito={(monto, saldo) => `Depósito de ${moneda(monto)} realizado. Tu nuevo saldo es ${moneda(saldo)}.`}
    />
  );
}
