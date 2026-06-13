import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenantIsolation.middleware';
import {
  getShippingConfig,
  updateShippingConfig,
  calculateShippingRate,
  createShipment,
  trackShipment,
} from '../controllers/shipping.controller';

const router = Router();

router.get('/config', authenticate, tenantIsolation, getShippingConfig);
router.patch('/config', authenticate, tenantIsolation, updateShippingConfig);
router.post('/rates', authenticate, tenantIsolation, calculateShippingRate);
router.post('/shipments', authenticate, tenantIsolation, createShipment);
router.get('/track/:id', authenticate, tenantIsolation, trackShipment);

export default router;
