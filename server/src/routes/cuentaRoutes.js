import { Router } from 'express';
import * as c from '../controllers/cuentaController.js';

const router = Router();

router.post('/deposito', c.deposito);
router.post('/retiro', c.retiro);
router.post('/transferencia', c.transferencia);
router.get('/:numero/historial', c.historial);
router.get('/:numero', c.consultar);

export default router;
