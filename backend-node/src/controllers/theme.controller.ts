import { Request, Response } from 'express';
import { ThemeSettings, buildDefaultTheme } from '../models/ThemeSettings';
import Merchant from '../models/Merchant';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

// ─── Helper: ensure theme doc exists ─────────────────────────────────────────
async function ensureTheme(merchantId: string, storeName: string) {
  let theme = await ThemeSettings.findOne({ merchantId });
  if (!theme) {
    const defaultData = buildDefaultTheme('spark', storeName);
    theme = await ThemeSettings.create({
      merchantId,
      published: defaultData,
      draft: defaultData,
      hasUnpublishedChanges: false,
    });
  }
  return theme;
}

// ─── GET /api/theme  (dashboard — returns draft) ─────────────────────────────
export const getTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  const merchantId = req.user?.merchantId?.toString();
  if (!merchantId) throw new AppError('Merchant not found', 404);

  const merchant = await Merchant.findById(merchantId).lean();
  if (!merchant) throw new AppError('Merchant not found', 404);

  const theme = await ensureTheme(merchantId, (merchant as any).storeName || 'متجري');

  res.json({
    success: true,
    data: {
      published: theme.published,
      draft: theme.draft,
      hasUnpublishedChanges: theme.hasUnpublishedChanges,
      lastPublishedAt: theme.lastPublishedAt,
    },
  });
};

// ─── PATCH /api/theme/draft  (save draft) ────────────────────────────────────
export const saveDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  const merchantId = req.user?.merchantId?.toString();
  if (!merchantId) throw new AppError('Merchant not found', 404);

  const merchant = await Merchant.findById(merchantId).lean();
  const theme = await ensureTheme(merchantId, (merchant as any)?.storeName || 'متجري');

  // Deep merge incoming changes with existing draft
  const updatedDraft = deepMerge(theme.draft as any, req.body);

  theme.draft = updatedDraft as any;
  theme.hasUnpublishedChanges = true;
  await theme.save();

  res.json({ success: true, data: { draft: theme.draft, hasUnpublishedChanges: true } });
};

// ─── POST /api/theme/publish  (publish draft → live) ─────────────────────────
export const publishTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  const merchantId = req.user?.merchantId?.toString();
  if (!merchantId) throw new AppError('Merchant not found', 404);

  const theme = await ThemeSettings.findOne({ merchantId });
  if (!theme) throw new AppError('Theme not found', 404);

  theme.published = JSON.parse(JSON.stringify(theme.draft)); // deep copy
  theme.hasUnpublishedChanges = false;
  theme.lastPublishedAt = new Date();
  await theme.save();

  res.json({ success: true, message: 'تم نشر التصميم بنجاح', data: { published: theme.published } });
};

// ─── POST /api/theme/reset-draft  (discard draft → revert to published) ──────
export const resetDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  const merchantId = req.user?.merchantId?.toString();
  if (!merchantId) throw new AppError('Merchant not found', 404);

  const theme = await ThemeSettings.findOne({ merchantId });
  if (!theme) throw new AppError('Theme not found', 404);

  theme.draft = JSON.parse(JSON.stringify(theme.published));
  theme.hasUnpublishedChanges = false;
  await theme.save();

  res.json({ success: true, message: 'تم تجاهل التغييرات', data: { draft: theme.draft } });
};

// ─── POST /api/theme/apply-template  (change template, resets draft) ─────────
export const applyTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  const merchantId = req.user?.merchantId?.toString();
  if (!merchantId) throw new AppError('Merchant not found', 404);

  const { templateId } = req.body;
  if (!templateId) throw new AppError('templateId is required', 400);

  const merchant = await Merchant.findById(merchantId).lean();
  const storeName = (merchant as any)?.storeName || 'متجري';

  const newDraft = buildDefaultTheme(templateId, storeName);

  const theme = await ThemeSettings.findOneAndUpdate(
    { merchantId },
    { $set: { draft: newDraft, hasUnpublishedChanges: true } },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: { draft: theme.draft } });
};

// ─── PUBLIC: GET /api/theme/storefront/:subdomain  (storefront reads published) 
export const getPublishedTheme = async (req: Request, res: Response): Promise<void> => {
  const { subdomain } = req.params;

  const merchant = await Merchant.findOne({ subdomain }).lean();
  if (!merchant) throw new AppError('Store not found', 404);

  const merchantId = (merchant as any)._id.toString();
  const storeName = (merchant as any).storeName || 'متجري';
  const theme = await ensureTheme(merchantId, storeName);

  res.json({
    success: true,
    data: {
      theme: theme.published,
      merchant: {
        storeName: (merchant as any).storeName,
        subdomain: (merchant as any).subdomain,
        logo: (merchant as any).logo,
        currency: (merchant as any).currency,
        language: (merchant as any).language,
      },
    },
  });
};

// ─── PUBLIC: GET /api/theme/storefront/:subdomain/preview  (reads draft) ──────
export const getPreviewTheme = async (req: Request, res: Response): Promise<void> => {
  const { subdomain } = req.params;

  const merchant = await Merchant.findOne({ subdomain }).lean();
  if (!merchant) throw new AppError('Store not found', 404);

  const merchantId = (merchant as any)._id.toString();
  const storeName = (merchant as any).storeName || 'متجري';
  const theme = await ensureTheme(merchantId, storeName);

  res.json({
    success: true,
    data: {
      theme: theme.draft,
      isPreview: true,
      merchant: {
        storeName: (merchant as any).storeName,
        subdomain: (merchant as any).subdomain,
        logo: (merchant as any).logo,
      },
    },
  });
};

// ─── Utility: deep merge ──────────────────────────────────────────────────────
function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
