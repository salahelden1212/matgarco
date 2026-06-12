import { Response } from 'express';
import dns from 'dns';
import { AuthRequest } from '../types';
import Merchant from '../models/Merchant';
import Subscription from '../models/Subscription';
import { AppError } from '../middleware/error.middleware';

const EXPECTED_TXT_VALUE = process.env.DOMAIN_VERIFICATION_TXT || 'matgarco-domain-verify';

export const getDomainStatus = async (req: AuthRequest, res: Response) => {
  const merchant = await Merchant.findById(req.user?.merchantId).select('customDomain domainVerified');
  if (!merchant) throw new AppError('Merchant not found', 404);

  return res.status(200).json({
    success: true,
    data: {
      customDomain: merchant.customDomain || null,
      verified: merchant.domainVerified || false,
      expectedTxtRecord: EXPECTED_TXT_VALUE,
    },
  });
};

export const updateDomain = async (req: AuthRequest, res: Response) => {
  const { domain } = req.body as { domain: string };

  if (!domain || !/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return res.status(400).json({ success: false, message: 'Invalid domain format' });
  }

  const subscription = await Subscription.findOne({ merchantId: req.user?.merchantId });
  const allowedPlans = ['business', 'professional'];
  if (!subscription || !allowedPlans.includes(subscription.plan)) {
    return res.status(403).json({
      success: false,
      message: 'Custom domains require Professional or Business plan',
    });
  }

  const existing = await Merchant.findOne({ customDomain: domain.toLowerCase(), _id: { $ne: req.user?.merchantId } });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Domain already in use by another merchant' });
  }

  await Merchant.findByIdAndUpdate(req.user?.merchantId, {
    customDomain: domain.toLowerCase(),
    domainVerified: false,
  });

  return res.status(200).json({
    success: true,
    message: 'Domain saved. Add the TXT record below to verify ownership.',
    data: {
      customDomain: domain.toLowerCase(),
      expectedTxtRecord: EXPECTED_TXT_VALUE,
    },
  });
};

export const verifyDomain = async (req: AuthRequest, res: Response) => {
  const merchant = await Merchant.findById(req.user?.merchantId).select('customDomain domainVerified');
  if (!merchant) throw new AppError('Merchant not found', 404);
  if (!merchant.customDomain) {
    return res.status(400).json({ success: false, message: 'No custom domain configured' });
  }

  try {
    const records = await dns.promises.resolveTxt(merchant.customDomain);
    const txtValues = records.flat();
    const match = txtValues.find((v) => v.includes(EXPECTED_TXT_VALUE));

    if (match) {
      await Merchant.findByIdAndUpdate(req.user?.merchantId, { domainVerified: true });
      return res.status(200).json({ success: true, message: 'Domain verified successfully!', data: { verified: true } });
    }

    return res.status(200).json({
      success: false,
      message: 'Verification record not found. Ensure the TXT record is added to your DNS.',
      data: { verified: false },
    });
  } catch {
    return res.status(200).json({
      success: false,
      message: 'Could not resolve domain. Ensure the domain points to our server and the TXT record is added.',
      data: { verified: false },
    });
  }
};

export const removeDomain = async (req: AuthRequest, res: Response) => {
  await Merchant.findByIdAndUpdate(req.user?.merchantId, {
    $unset: { customDomain: '' },
    domainVerified: false,
  });

  return res.status(200).json({ success: true, message: 'Custom domain removed' });
};
