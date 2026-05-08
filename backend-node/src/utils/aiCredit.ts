import Merchant from '../models/Merchant';
import { AppError } from '../middleware/error.middleware';

/**
 * Checks if a merchant has enough AI credits and deducts one if they do.
 * Throws an AppError if credits are exhausted.
 * @param merchantId The ID of the merchant.
 */
export async function checkAndDeductAICredit(merchantId: string): Promise<void> {
  const merchant = await Merchant.findById(merchantId);
  
  if (!merchant) {
    throw new AppError('Merchant not found', 404);
  }

  // -1 means unlimited credits
  if (merchant.limits.aiCreditsPerMonth !== -1) {
    if (merchant.limits.aiCreditsUsed >= merchant.limits.aiCreditsPerMonth) {
      throw new AppError('لقد استنفدت رصيد الذكاء الاصطناعي المخصص لخطتك هذا الشهر. يرجى الترقية للحصول على المزيد.', 403);
    }

    // Deduct credit
    await Merchant.findByIdAndUpdate(merchantId, {
      $inc: { 'limits.aiCreditsUsed': 1 }
    });
  }
}
