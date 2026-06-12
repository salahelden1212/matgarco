import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenantIsolation.middleware';
import {
  getDomainStatus,
  updateDomain,
  verifyDomain,
  removeDomain,
} from '../controllers/domain.controller';

const router = Router();

router.use(authenticate, tenantIsolation);
router.get('/', getDomainStatus);
router.put('/', updateDomain);
router.post('/verify', verifyDomain);
router.delete('/', removeDomain);

export default router;
