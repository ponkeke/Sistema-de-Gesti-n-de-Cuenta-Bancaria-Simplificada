import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { conectarDB, desconectarDB } from '../src/config/db.js';
import { crearApp } from '../src/app.js';
import { Cuenta } from '../src/models/Cuenta.js';
import { Movimiento } from '../src/models/Movimiento.js';
import { Operacion } from '../src/models/Operacion.js';
import { recuperarPendientes } from '../src/services/operacionService.js';

const app = crearApp();
const api = () => request(app);
let n = 0;
const clave = () => `test-key-${Date.now()}-${n++}`;

before(() => conectarDB('mongodb://127.0.0.1:27017/banco_test'));
after(async () => {
  await Promise.all([Cuenta.deleteMany({}), Movimiento.deleteMany({}), Operacion.deleteMany({})]);
  await desconectarDB();
});
beforeEach(async () => {
  await Promise.all([Cuenta.deleteMany({}), Movimiento.deleteMany({}), Operacion.deleteMany({})]);
  await Cuenta.create([
    { numero: 'A001', titular: 'Ana', saldo: 100000 }, // $1000.00
    { numero: 'B002', titular: 'Beto', saldo: 50000 }, // $500.00
  ]);
});

const saldo = async (num) => (await api().get(`/api/cuenta/${num}`)).body.saldo;

describe('Consulta de saldo', () => {
  it('200 con el saldo', async () => {
    const r = await api().get('/api/cuenta/A001');
    assert.equal(r.status, 200);
    assert.deepEqual(r.body, { numero: 'A001', titular: 'Ana', saldo: 1000 });
  });
  it('404 si la cuenta no existe', async () => {
    assert.equal((await api().get('/api/cuenta/ZZZ999')).status, 404);
  });
  it('400 si el número es inválido', async () => {
    assert.equal((await api().get('/api/cuenta/a$')).status, 400);
  });
  it('404 en ruta inexistente', async () => {
    assert.equal((await api().get('/api/nada/x/y/z')).status, 404);
  });
});

describe('Depósito', () => {
  it('201 y actualiza saldo e historial', async () => {
    const r = await api().post('/api/cuenta/deposito').send({ cuenta: 'A001', monto: 250.75 });
    assert.equal(r.status, 201);
    assert.equal(r.body.saldo, 1250.75);
    assert.equal(await saldo('A001'), 1250.75);
    const h = await api().get('/api/cuenta/A001/historial');
    assert.equal(h.status, 200);
    assert.equal(h.body.total, 1);
    assert.equal(h.body.movimientos[0].tipo, 'deposito');
    assert.equal(h.body.movimientos[0].saldoResultante, 1250.75);
  });
  for (const monto of [0, -5, '10', null, undefined, NaN, 1.234, 2e9, [], {}]) {
    it(`400 con monto inválido ${JSON.stringify(monto)}`, async () => {
      const r = await api().post('/api/cuenta/deposito').send({ cuenta: 'A001', monto });
      assert.equal(r.status, 400);
      assert.equal(await saldo('A001'), 1000);
    });
  }
  it('400 con cuenta inválida / sin cuerpo', async () => {
    assert.equal((await api().post('/api/cuenta/deposito').send({ monto: 5 })).status, 400);
    assert.equal((await api().post('/api/cuenta/deposito')).status, 400);
    assert.equal((await api().post('/api/cuenta/deposito').set('Content-Type', 'application/json').send('{mal')).status, 400);
  });
  it('404 si la cuenta no existe', async () => {
    assert.equal((await api().post('/api/cuenta/deposito').send({ cuenta: 'ZZZ999', monto: 5 })).status, 404);
  });
});

describe('Retiro', () => {
  it('201 y descuenta', async () => {
    const r = await api().post('/api/cuenta/retiro').send({ cuenta: 'A001', monto: 400 });
    assert.equal(r.status, 201);
    assert.equal(await saldo('A001'), 600);
  });
  it('permite retirar exactamente todo el saldo', async () => {
    assert.equal((await api().post('/api/cuenta/retiro').send({ cuenta: 'A001', monto: 1000 })).status, 201);
    assert.equal(await saldo('A001'), 0);
  });
  it('400 si supera el saldo y no registra movimiento', async () => {
    const r = await api().post('/api/cuenta/retiro').send({ cuenta: 'A001', monto: 1000.01 });
    assert.equal(r.status, 400);
    assert.equal(await saldo('A001'), 1000);
    assert.equal(await Movimiento.countDocuments(), 0);
  });
  it('400 con monto <= 0 y 404 con cuenta inexistente', async () => {
    assert.equal((await api().post('/api/cuenta/retiro').send({ cuenta: 'A001', monto: 0 })).status, 400);
    assert.equal((await api().post('/api/cuenta/retiro').send({ cuenta: 'ZZZ999', monto: 1 })).status, 404);
  });
  it('concurrencia: 20 retiros de 100 sobre 1000 -> exactamente 10 exitosos, saldo 0', async () => {
    const rs = await Promise.all(
      Array.from({ length: 20 }, () => api().post('/api/cuenta/retiro').send({ cuenta: 'A001', monto: 100 })),
    );
    assert.equal(rs.filter((r) => r.status === 201).length, 10);
    assert.equal(rs.filter((r) => r.status === 400).length, 10);
    assert.equal(await saldo('A001'), 0);
    assert.equal(await Movimiento.countDocuments({ tipo: 'retiro' }), 10);
  });
});

describe('Transferencia', () => {
  it('201, mueve fondos y registra dos movimientos', async () => {
    const r = await api().post('/api/cuenta/transferencia').send({ origen: 'A001', destino: 'B002', monto: 300 });
    assert.equal(r.status, 201);
    assert.equal(await saldo('A001'), 700);
    assert.equal(await saldo('B002'), 800);
    const ha = (await api().get('/api/cuenta/A001/historial')).body.movimientos;
    const hb = (await api().get('/api/cuenta/B002/historial')).body.movimientos;
    assert.equal(ha[0].tipo, 'transferencia_enviada');
    assert.equal(ha[0].contraparte, 'B002');
    assert.equal(hb[0].tipo, 'transferencia_recibida');
    assert.equal(hb[0].contraparte, 'A001');
    assert.equal(ha[0].operacionId, hb[0].operacionId);
  });
  it('400 a la misma cuenta', async () => {
    const r = await api().post('/api/cuenta/transferencia').send({ origen: 'A001', destino: 'A001', monto: 1 });
    assert.equal(r.status, 400);
  });
  it('404 a cuenta destino u origen inexistente, sin cambios', async () => {
    assert.equal((await api().post('/api/cuenta/transferencia').send({ origen: 'A001', destino: 'ZZZ999', monto: 1 })).status, 404);
    assert.equal((await api().post('/api/cuenta/transferencia').send({ origen: 'ZZZ999', destino: 'A001', monto: 1 })).status, 404);
    assert.equal(await saldo('A001'), 1000);
  });
  it('400 por saldo insuficiente o monto inválido, sin cambios', async () => {
    assert.equal((await api().post('/api/cuenta/transferencia').send({ origen: 'B002', destino: 'A001', monto: 500.01 })).status, 400);
    assert.equal((await api().post('/api/cuenta/transferencia').send({ origen: 'B002', destino: 'A001', monto: -1 })).status, 400);
    assert.equal(await saldo('B002'), 500);
    assert.equal(await saldo('A001'), 1000);
  });
  it('consistencia: transferencias cruzadas concurrentes conservan la suma total', async () => {
    const peticiones = [];
    for (let i = 0; i < 30; i++) {
      const [o, d] = i % 2 ? ['A001', 'B002'] : ['B002', 'A001'];
      peticiones.push(api().post('/api/cuenta/transferencia').send({ origen: o, destino: d, monto: 37.5 }));
    }
    await Promise.all(peticiones);
    const a = await saldo('A001');
    const b = await saldo('B002');
    assert.equal(a + b, 1500);
    assert.ok(a >= 0 && b >= 0);
    // El historial reproduce el saldo final de cada cuenta.
    for (const [num, inicial] of [['A001', 1000], ['B002', 500]]) {
      const movs = await Movimiento.find({ cuenta: num });
      const delta = movs.reduce(
        (s, m) => s + (['deposito', 'transferencia_recibida'].includes(m.tipo) ? m.monto : -m.monto), 0);
      assert.equal(inicial + delta / 100, await saldo(num));
    }
  });
});

describe('Idempotencia', () => {
  it('mismo Idempotency-Key no duplica el depósito', async () => {
    const k = clave();
    const r1 = await api().post('/api/cuenta/deposito').set('Idempotency-Key', k).send({ cuenta: 'A001', monto: 100 });
    const r2 = await api().post('/api/cuenta/deposito').set('Idempotency-Key', k).send({ cuenta: 'A001', monto: 100 });
    assert.equal(r1.status, 201);
    assert.equal(r2.status, 200);
    assert.equal(r2.headers['idempotent-replayed'], 'true');
    assert.deepEqual(r2.body, r1.body);
    assert.equal(await saldo('A001'), 1100);
    assert.equal(await Movimiento.countDocuments(), 1);
  });
  it('reintentos simultáneos con la misma clave aplican una sola vez', async () => {
    const k = clave();
    const rs = await Promise.all(
      Array.from({ length: 8 }, () =>
        api().post('/api/cuenta/transferencia').set('Idempotency-Key', k).send({ origen: 'A001', destino: 'B002', monto: 100 })),
    );
    assert.equal(rs.filter((r) => r.status === 201).length, 1);
    assert.ok(rs.every((r) => [200, 201, 409].includes(r.status)));
    assert.equal(await saldo('A001'), 900);
    assert.equal(await saldo('B002'), 600);
  });
  it('409 si se reutiliza la clave con otro cuerpo', async () => {
    const k = clave();
    await api().post('/api/cuenta/deposito').set('Idempotency-Key', k).send({ cuenta: 'A001', monto: 10 });
    const r = await api().post('/api/cuenta/deposito').set('Idempotency-Key', k).send({ cuenta: 'A001', monto: 20 });
    assert.equal(r.status, 409);
    assert.equal(await saldo('A001'), 1010);
  });
  it('un fallo de negocio libera la clave: se puede reintentar tras depositar', async () => {
    const k = clave();
    const r1 = await api().post('/api/cuenta/retiro').set('Idempotency-Key', k).send({ cuenta: 'B002', monto: 600 });
    assert.equal(r1.status, 400);
    await api().post('/api/cuenta/deposito').send({ cuenta: 'B002', monto: 200 });
    const r2 = await api().post('/api/cuenta/retiro').set('Idempotency-Key', k).send({ cuenta: 'B002', monto: 600 });
    assert.equal(r2.status, 201);
    assert.equal(await saldo('B002'), 100);
  });
  it('400 con Idempotency-Key malformada', async () => {
    const r = await api().post('/api/cuenta/deposito').set('Idempotency-Key', 'x').send({ cuenta: 'A001', monto: 1 });
    assert.equal(r.status, 400);
  });
});

describe('Recuperación ante caídas', () => {
  it('completa una transferencia que quedó debitada sin acreditar, sin duplicar', async () => {
    const op = await Operacion.create({
      tipo: 'transferencia',
      datos: { origen: 'A001', destino: 'B002', monto: 25000 },
      paso: 'debitada',
    });
    // Simula caída justo tras el débito.
    await Cuenta.updateOne(
      { numero: 'A001' },
      { $inc: { saldo: -25000 }, $push: { aplicadas: String(op._id) } },
    );
    assert.equal(await recuperarPendientes(), 1);
    assert.equal(await recuperarPendientes(), 0); // idempotente
    assert.equal(await saldo('A001'), 750);
    assert.equal(await saldo('B002'), 750);
    assert.equal(await Movimiento.countDocuments(), 2);
    assert.equal((await Operacion.findById(op._id)).estado, 'completada');
  });
});
