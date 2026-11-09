# Sistema de gestión de cuenta bancaria

Trabajo práctico de Ingeniería Web. Aplicación Full-Stack para consultar saldo, depositar, retirar, transferir entre cuentas y ver el historial de movimientos.

- **Backend:** Node.js, Express 5, Mongoose, MongoDB local.
- **Frontend:** React 19 + Vite, Tailwind CSS 4, hooks `useState` / `useEffect`.

## Requisitos
- Node.js 20 o superior.
- MongoDB local en `mongodb://127.0.0.1:27017` (sin necesidad de replica set).

## Instalación y ejecución

```bash
# 1. API
cd server
npm install
cp .env.example .env      # ajuste MONGODB_URI si hace falta
npm run seed              # crea cuentas 1001..1004 con movimientos de ejemplo
npm run dev               # http://localhost:4000

# 2. Web (otra terminal)
cd client
npm install
npm run dev               # http://localhost:5173 (proxy /api -> :4000)
```

Tests del backend (usan la base `banco_test`, que se vacía): `cd server && npm test`.
Build del frontend: `cd client && npm run build`.

## API

| Método | Ruta | Cuerpo | Respuestas |
|---|---|---|---|
| GET | `/api/cuenta/:numero` | – | 200, 404 |
| POST | `/api/cuenta/deposito` | `{ cuenta, monto }` | 201, 400, 404 |
| POST | `/api/cuenta/retiro` | `{ cuenta, monto }` | 201, 400 (saldo insuficiente), 404 |
| POST | `/api/cuenta/transferencia` | `{ origen, destino, monto }` | 201, 400, 404 |
| GET | `/api/cuenta/:numero/historial?pagina=1&limite=20` | – | 200, 404 |

Códigos: 200 consultas (y reintento idempotente), 201 operación creada, 400 datos inválidos o saldo insuficiente, 404 recurso inexistente, 500 error interno. Adicionalmente **409** cuando una `Idempotency-Key` se reutiliza con otro cuerpo o la operación original sigue en curso. Los errores devuelven `{ "error": "mensaje" }`.

Los montos se expresan en pesos con hasta 2 decimales (número JSON, no texto).

## Arquitectura y decisiones

```
server/src
  config/       env y conexión a MongoDB
  models/       Cuenta, Movimiento, Operacion (journal)
  validators/   validación de entrada
  services/     reglas de negocio (cuentaService, operacionService)
  controllers/  capa HTTP
  routes/       definición de rutas
  middlewares/  manejo centralizado de errores
server/scripts/seed.js   datos iniciales
server/tests/            pruebas de integración (node:test + supertest)
client/src
  api/ hooks/ components/   cliente HTTP, hooks (useCuenta, useOperacion) y UI
```

1. **Montos en centavos enteros** (sin errores de punto flotante).
2. **Saldos sin condiciones de carrera:** cada cambio de saldo es un único `findOneAndUpdate` atómico; los débitos solo se aplican si `saldo >= monto`, por lo que nunca hay saldo negativo.
3. **Transferencias sin transacciones:** el MongoDB local es standalone (no admite transacciones multi-documento). Se usa un **journal** (`Operacion`): débito, crédito y registro de movimientos son pasos **idempotentes** (cada cuenta recuerda los `opId` ya aplicados). Si el crédito falla se compensa el débito, y al arrancar el servidor `recuperarPendientes()` completa las operaciones que quedaron a medias.
4. **Idempotencia:** el cliente envía `Idempotency-Key`; un reintento con la misma clave devuelve el resultado original (200 + cabecera `Idempotent-Replayed`) sin volver a operar. Un fallo de negocio libera la clave. El cliente conserva la clave solo ante errores de red/5xx.
5. **Consistencia saldo/historial:** cada movimiento guarda `saldoResultante`; el índice único `(operacionId, tipo)` impide movimientos duplicados.
6. El frontend no tiene listado de cuentas (la consigna define solo 5 endpoints): se ingresa el número de cuenta (por defecto `1001`).

## Limitaciones conocidas
- Sin autenticación ni autorización (fuera de la consigna).
- Si el proceso se cae exactamente entre el débito y la actualización del journal, la recuperación sigue siendo segura (las aplicaciones son idempotentes), pero el `saldoResultante` de un movimiento recuperado refleja el saldo al momento de recuperar. Con un replica set se podrían usar transacciones reales.
- Se recuerdan las últimas 200 operaciones aplicadas por cuenta para la idempotencia interna.
