import { Router } from 'express';
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  validateDiscount,
} from '../controllers/discount.controller';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenantIsolation.middleware';

const router = Router();

router.use(authenticate, tenantIsolation);

router.get('/', getDiscounts);
router.post('/', createDiscount);
router.patch('/:id', updateDiscount);
router.delete('/:id', deleteDiscount);
router.post('/validate', validateDiscount);

export default router;
