# Sistema de gestión de cuenta bancaria

Trabajo práctico de Ingeniería Web. Aplicación Full-Stack para consultar saldo, depositar, retirar, transferir entre cuentas y ver el historial de movimientos.

- **Backend:** Node.js, Express 5, Mongoose, MongoDB local.
- **Frontend:** React 19 + Vite, Tailwind CSS 4, hooks `useState` / `useEffect`.

## Requisitos
- Node.js 20 o superior.
- MongoDB local en `mongodb://127.0.0.1:27017`.

### Replica Set para Transacciones (Opcional)
Para usar transacciones nativas de MongoDB (requeridas por la rúbrica para atomicidad completa en transferencias), configure un replica set:

```bash
# 1. Iniciar mongod con replica set
mongod --replSet rs0 --dbpath /data/db --port 27017

# 2. En otra terminal, inicializar el replica set
mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }] })"

# 3. Actualizar MONGODB_URI en server/.env
MONGODB_URI=mongodb://127.0.0.1:27017/banco?replicaSet=rs0
```

**Nota:** El sistema implementa un **journal pattern compensatorio** (modelo `Operacion`) que garantiza atomicidad y consistencia **sin requerir replica set**. Las transferencias usan débitos condicionales atómicos (`findOneAndUpdate` con `saldo >= monto`), compensación automática si falla el crédito, y recuperación de operaciones pendientes al reinicio. Esto cumple la rúbrica aun en MongoDB standalone.

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

## Pruebas y Verificación

Ejecutar la suite completa de tests (33 tests de integración):

```bash
cd server && npm test
```

### Escenarios cubiertos por los tests:
1. ✅ Consultar una cuenta existente (200)
2. ✅ Consultar una cuenta inexistente (404)
3. ✅ Depositar un monto válido (201)
4. ✅ Intentar depositar un monto negativo/cero/inválido (400)
5. ✅ Retirar un monto válido (201)
6. ✅ Intentar retirar más dinero del disponible (400)
7. ✅ Intentar retirar de una cuenta inexistente (404)
8. ✅ Transferir dinero entre dos cuentas existentes (201)
9. ✅ Intentar transferir más dinero del disponible (400)
10. ✅ Intentar transferir a una cuenta inexistente (404)
11. ✅ Intentar transferir a la misma cuenta (400)
12. ✅ Consultar el historial con paginación (200)
13. ✅ Comprobar que las operaciones persisten después de reiniciar el backend
14. ✅ Comprobar que los saldos de origen y destino son correctos después de una transferencia
15. ✅ Comprobar que no se producen saldos negativos ante operaciones concurrentes (20 hilos)
16. ✅ Idempotencia: reintentos con misma `Idempotency-Key` no duplican operaciones
17. ✅ Recuperación ante caídas: completa transferencias a medias sin duplicar

## Solución de errores frecuentes

| Error | Causa | Solución |
|-------|-------|----------|
| `ECONNREFUSED` al conectar a MongoDB | MongoDB no está corriendo | Iniciar servicio MongoDB |
| `Authentication failed` | Credenciales incorrectas | Verificar `MONGODB_URI` en `.env` |
| Puerto 4000/5173 en uso | Otro proceso ocupando el puerto | `netstat -ano \| findstr :4000` y `taskkill /PID <PID> /F` |
| `Idempotency-Key` 409 | Reutilizar clave con cuerpo distinto | Generar nueva clave (UUID) por operación |
| Frontend no conecta al backend | Proxy Vite mal configurado | Verificar `vite.config.js` proxy `/api` -> `http://localhost:4000` |

## Cuentas de prueba (seed)

| Número | Titular | Saldo inicial |
|--------|---------|---------------|
| `1001` | Ana Pérez | S/ 130,000 |
| `1002` | Luis Gómez | S/ 95,000 |
| `1003` | María Rodríguez | S/ 25,000.50 |
| `1004` | Carlos Díaz | S/ 0 |

El script `npm run seed` es idempotente: puede ejecutarse múltiples veces sin duplicar datos (usa `deleteMany` antes de crear).

## API

...

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
