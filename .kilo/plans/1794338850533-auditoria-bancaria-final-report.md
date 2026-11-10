# INFORME FINAL DE AUDITORÍA Y MEJORA

## A. Diagnóstico Inicial

### Estado Original del Proyecto
El proyecto **Sistema-de-Gestión-de-Cuenta-Bancaria-Simplificada** ya contaba con una arquitectura completa y robusta:
- **Backend**: Node.js + Express 5 + Mongoose + MongoDB local
- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Arquitectura modular** bien separada (models, services, controllers, routes, validators, middlewares)
- **Tests de integración** exhaustivos (33 tests, 6 suites)
- **Script seed** funcional con 4 cuentas de prueba
- **Patrón journal compensatorio** para atomicidad sin replica set

### Puntaje Inicial según Rúbrica

| Criterio | Puntaje Inicial | Problemas Encontrados |
|----------|-----------------|----------------------|
| Backend y API REST | 2.5/3 | ✅ Endpoints completos, validaciones, códigos HTTP correctos, manejo errores centralizado. ⚠️ Faltaba verificar persistencia real en MongoDB y ejecutar tests. Documenta limitación de transacciones en standalone. |
| Arquitectura Frontend | 3/3 | ✅ Componentes reutilizables, separación lógica, hooks personalizados, props, estructura modular. |
| Gestión del Estado | 3/3 | ✅ useState/useEffect correctos, sincronización tras operaciones, idempotencia cliente, loading/error states. |
| Diseño y Tailwind CSS | 3/3 | ✅ Tailwind 4, diseño moderno, responsive, accesibilidad, iconografía propia, estados hover/focus/loading/disabled. |
| Documentación y Entregables | 2.5/3 | ✅ README completo con instalación, endpoints, ejemplos, arquitectura. ⚠️ Faltaba documentación explícita de replica set y troubleshooting. |

**TOTAL INICIAL: 14/15**

---

## B. Mejoras Realizadas

### 1. Verificación de Funcionamiento Real (Completado)
✅ MongoDB local verificado corriendo (proceso `mongod.exe` activo)
✅ `npm run seed` ejecutado correctamente - 4 cuentas creadas con saldos y movimientos iniciales
✅ `npm test` ejecutado - **33/33 tests pasan** (0 fallos)
✅ `npm run build` en client - **compilación exitosa** (243 kB JS, 23 kB CSS gzipped)
✅ Backend levantado en puerto 4000 - health check `/api/salud` responde `{"estado":"ok"}`
✅ Frontend levantado en puerto 5174 - proxy `/api` → `http://localhost:4000` funcionando
✅ Flujo E2E verificado: depósito, retiro, transferencia, historial - todos operativos

### 2. Documentación de Replica Set para Transacciones (Completado)
Se actualizó `README.md` con:
- Instrucciones explícitas para configurar MongoDB replica set (`rs.initiate()`)
- Variable de entorno `MONGODB_URI` con `replicaSet=rs0`
- Explicación clara del **journal pattern compensatorio** implementado que garantiza atomicidad sin replica set:
  - Débitos condicionales atómicos (`findOneAndUpdate` con `saldo >= monto`)
  - Compensación automática si falla el crédito
  - Recuperación de operaciones pendientes al reinicio (`recuperarPendientes()`)
  - Idempotencia vía `aplicadas` array y índice único `(operacionId, tipo)`

### 3. Sección de Pruebas y Troubleshooting (Agregada)
Se agregó a `README.md`:
- Tabla de 17 escenarios de prueba cubiertos por tests automatizados
- Guía de solución de errores frecuentes (ECONNREFUSED, auth failed, puertos, Idempotency-Key 409, proxy)
- Tabla de cuentas de prueba con saldos iniciales
- Confirmación de idempotencia del script seed

### Archivos Modificados
| Archivo | Cambio |
|---------|--------|
| `README.md` | + Sección Replica Set, + Pruebas y Verificación (17 escenarios), + Troubleshooting, + Cuentas de prueba |

### Sin Cambios de Código Necesarios
El código ya cumplía funcionalmente con todos los requisitos. Solo se requería validación en entorno real y documentación complementaria.

---

## C. Pruebas Ejecutadas

### Tests Automatizados (Backend)
```
▶ Consulta de saldo        ✔ 4 tests
▶ Depósito                 ✔ 13 tests (válidos, inválidos, 404, validaciones)
▶ Retiro                   ✔ 5 tests (incluye concurrencia 20 hilos)
▶ Transferencia            ✔ 5 tests (incluye concurrencia cruzada 30 hilos)
▶ Idempotencia             ✔ 5 tests (reintentos, claves, liberación)
▶ Recuperación ante caídas ✔ 1 test (transferencia a medias)
────────────────────────────────────────────
TOTAL: 33 tests - 33 PASSED - 0 FAILED
```

### Pruebas Manuales E2E (API via Proxy)
| Operación | Request | Response | Estado |
|-----------|---------|----------|--------|
| Health Check | GET `/api/salud` | `{"estado":"ok"}` | ✅ |
| Consultar cuenta | GET `/api/cuenta/1001` | saldo 130000 | ✅ |
| Cuenta inexistente | GET `/api/cuenta/9999` | 404 `{"error":"La cuenta 9999 no existe"}` | ✅ |
| Depósito válido | POST `/api/cuenta/deposito` `{cuenta:"1001",monto:500}` | 201 saldo 130500 | ✅ |
| Depósito inválido | POST `/api/cuenta/deposito` `{monto:-100}` | 400 | ✅ |
| Retiro válido | POST `/api/cuenta/retiro` `{cuenta:"1001",monto:200}` | 201 saldo 130300 | ✅ |
| Transferencia | POST `/api/cuenta/transferencia` `{origen:"1001",destino:"1002",monto:1000}` | 201 origen 129300, destino 96000 | ✅ |
| Transferencia misma cuenta | POST `{origen:"1001",destino:"1001"}` | 400 | ✅ |
| Historial | GET `/api/cuenta/1001/historial` | 5 movimientos, paginación | ✅ |
| Frontend Proxy | GET `http://localhost:5174/api/cuenta/1001` | saldo correcto | ✅ |

### Verificación de Persistencia
- ✅ Datos persisten tras reinicio del backend (MongoDB)
- ✅ Saldos correctos tras transferencia (origen -1000, destino +1000)
- ✅ Sin saldos negativos en pruebas de concurrencia (tests automatizados)
- ✅ Historial muestra `saldoResultante` consistente en cada movimiento

### Errores Encontrados y Solucionados
| Error | Causa | Solución |
|-------|-------|----------|
| PowerShell `npm` blocked | ExecutionPolicy | Usar `cmd /c npm ...` |
| `curl` JSON parsing | PowerShell alias | Usar `Invoke-RestMethod` o `curl.exe` |
| Puerto 5173 en uso | Proceso previo | Vite auto-selecciona 5174, proxy funciona |

---

## D. Evaluación Final

| Criterio | Puntaje Final | Evidencias que Justifican |
|----------|---------------|---------------------------|
| **Backend y API REST** | **3/3** | 33/33 tests pasando, MongoDB persistiendo, 5 endpoints REST con métodos/validaciones/códigos HTTP correctos, atomicidad verificada (journal pattern + recovery), error handling centralizado |
| **Arquitectura Frontend** | **3/3** | 15+ componentes reutilizables, hooks personalizados (useCuenta, useOperacion), props, separación api/hooks/components, build sin errores |
| **Gestión del Estado** | **3/3** | useState/useEffect correctos, recarga automática tras operaciones (`recargar` via version counter), idempotencia cliente (Idempotency-Key), loading/error states, no recarga manual |
| **Diseño y Tailwind CSS** | **3/3** | Tailwind 4 + @theme tokens, responsive (mobile/tablet/desktop), accesibilidad (aria-labels, roles, focus-visible, sr-only), iconografía SVG propia, estados hover/focus/loading/disabled, alertas éxito/error con icono+texto |
| **Documentación y Entregables** | **3/3** | README actualizado con: instalación, replica set, 17 escenarios de prueba, troubleshooting, cuentas seed, endpoints, ejemplos, arquitectura, limitaciones |

**TOTAL FINAL: 15/15** 🎉

---

## E. Instrucciones de Ejecución

### Requisitos Previos
- Node.js 20+
- MongoDB local corriendo en `mongodb://127.0.0.1:27017`

### Pasos Exactos

```bash
# 1. Iniciar MongoDB (si no está corriendo)
# Windows: net start MongoDB
# O ejecutar: mongod --dbpath C:\data\db

# 2. BACKEND
cd server
cp .env.example .env
npm run seed              # Crea cuentas 1001-1004 con movimientos
npm run dev               # http://localhost:4000

# 3. FRONTEND (en otra terminal)
cd client
npm run dev               # http://localhost:5173 (o 5174 si 5173 ocupado)

# 4. TESTS
cd server && npm test     # 33 tests de integración

# 5. BUILD PRODUCCIÓN
cd client && npm run build
```

### URLs de Acceso
| Componente | URL |
|------------|-----|
| Frontend (Web) | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| Health Check | http://localhost:4000/api/salud |
| API Docs (README) | Ver sección "API" en README.md |

### Cuentas de Prueba Disponibles
| Número | Titular | Saldo Inicial |
|--------|---------|---------------|
| `1001` | Ana Pérez | S/ 130,000 |
| `1002` | Luis Gómez | S/ 95,000 |
| `1003` | María Rodríguez | S/ 25,000.50 |
| `1004` | Carlos Díaz | S/ 0 |

---

## F. Pendientes / Configuraciones Manuales

1. **MongoDB Local**: Usuario debe tener MongoDB instalado y servicio activo
   - Verificar: `mongod --version` y `net start MongoDB` (Windows)

2. **Replica Set (Opcional - para transacciones nativas)**: 
   ```bash
   mongod --replSet rs0 --dbpath /data/db --port 27017
   mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }] })"
   # Actualizar server/.env: MONGODB_URI=mongodb://127.0.0.1:27017/banco?replicaSet=rs0
   ```
   **Nota**: El sistema funciona **completamente sin replica set** gracias al journal pattern compensatorio implementado.

3. **Puertos Libres**: 4000 (backend) y 5173/5174 (frontend) deben estar disponibles

4. **Variables de Entorno**: Copiar `server/.env.example` a `server/.env` (ya hecho en validación)

---

## Conclusión

El proyecto **cumple al 100% con la rúbrica académica** y alcanza **SOBRESALIENTE (15/15 puntos)** en todos los criterios:

✅ Backend funcional con API REST completa, validaciones bancarias, atomicidad, persistencia MongoDB  
✅ Frontend React modular, hooks, estado sincronizado, diseño Tailwind profesional y accesible  
✅ Tests automatizados (33) cubriendo todos los escenarios requeridos + concurrencia + idempotencia + recovery  
✅ Documentación completa para instalación, ejecución, testing y troubleshooting  
✅ Seed idempotente con 4 cuentas de prueba listas para usar  

El sistema está listo para entrega, demostración y evaluación académica.