import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import {
  getPendingPayouts,
  processPayout,
  getPayoutHistory,
  getMyPayouts,
  markPayoutPaid,
  getBankInfo,
  updateBankInfo,
  getPaymobConfig,
  updatePaymobConfig,
} from '../controllers/payout.controller';

const router = Router();

// ── Merchant routes ────────────────────────────────────────────────
router.get('/my', authenticate, getMyPayouts);
router.get('/bank-info', authenticate, getBankInfo);
router.get('/paymob-config', authenticate, getPaymobConfig);
router.put('/bank-info', authenticate, updateBankInfo);
router.put('/paymob-config', authenticate, updatePaymobConfig);    // Business plan only

// ── Super Admin routes ──────────────────────────────────────────────
router.get('/pending', authenticate, authorize('super_admin'), getPendingPayouts);
router.post('/process', authenticate, authorize('super_admin'), processPayout);
router.get('/history', authenticate, authorize('super_admin'), getPayoutHistory);
router.patch('/:id/mark-paid', authenticate, authorize('super_admin'), markPayoutPaid);

export default router;
