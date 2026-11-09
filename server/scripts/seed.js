import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { conectarDB, desconectarDB } from '../src/config/db.js';
import { Cuenta } from '../src/models/Cuenta.js';
import { Movimiento } from '../src/models/Movimiento.js';
import { Operacion } from '../src/models/Operacion.js';
import { ejecutar } from '../src/services/operacionService.js';

const CUENTAS = [
  { numero: '1001', titular: 'Ana Pérez', deposito: 150000 },
  { numero: '1002', titular: 'Luis Gómez', deposito: 80000 },
  { numero: '1003', titular: 'María Rodríguez', deposito: 25000.5 },
  { numero: '1004', titular: 'Carlos Díaz', deposito: 0 },
];

await conectarDB();
console.log(`Sembrando base de datos: ${mongoose.connection.name} (${env.mongoUri})`);
await Promise.all([Cuenta.deleteMany({}), Movimiento.deleteMany({}), Operacion.deleteMany({})]);

for (const c of CUENTAS) {
  await Cuenta.create({ numero: c.numero, titular: c.titular, saldo: 0 });
  // El saldo inicial se registra como depósito para que historial y saldo coincidan.
  if (c.deposito > 0) {
    await ejecutar('deposito', { cuenta: c.numero, monto: Math.round(c.deposito * 100) });
  }
}
await ejecutar('transferencia', { origen: '1001', destino: '1002', monto: 2000000 });
await ejecutar('retiro', { cuenta: '1002', monto: 500000 });

const cuentas = await Cuenta.find().sort({ numero: 1 });
console.table(cuentas.map((c) => ({ numero: c.numero, titular: c.titular, saldo: c.saldo / 100 })));
await desconectarDB();
