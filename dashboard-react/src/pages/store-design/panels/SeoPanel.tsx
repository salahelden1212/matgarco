import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiAPI } from '../../../../lib/api';
import { toast } from 'sonner';

interface Props {
  draft: any;
  onChange: (update: Record<string, any>) => void;
}

export default function SeoPanel({ draft, onChange }: Props) {
  const seo = draft?.seo || {};
  const set = (key: string, val: string) => onChange({ seo: { ...seo, [key]: val } });

  const generateSeoMutation = useMutation({
    mutationFn: (data: { productName: string; description?: string }) => aiAPI.generateSEO(data),
    onSuccess: (res) => {
      const data = res.data?.data;
      if (data) {
        onChange({
          seo: {
            ...seo,
            title: data.title || seo.title,
            description: data.description || seo.description,
            keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords || seo.keywords,
          }
        });
        toast.success('تم توليد بيانات SEO بنجاح');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء التوليد';
      toast.error(message);
    }
  });

  const handleGenerateAI = () => {
    generateSeoMutation.mutate({
      productName: draft?.name || 'متجر إلكتروني',
      description: draft?.description || 'تسوق أفضل المنتجات',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-800">إعدادات SEO</h3>
          <p className="text-xs text-gray-400">تحسين ظهور متجرك في محركات البحث</p>
        </div>
        <button
          onClick={handleGenerateAI}
          disabled={generateSeoMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {generateSeoMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          توليد بالذكاء الاصطناعي
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">عنوان الصفحة (Title)</label>
        <input
          value={seo.title || ''}
          onChange={(e) => set('title', e.target.value)}
          placeholder="متجر النور | اكتشف أحدث المنتجات"
          maxLength={60}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-xs"
        />
        <p className="text-[10px] text-gray-400 mt-1">{(seo.title || '').length}/60 حرف</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">الوصف (Meta Description)</label>
        <textarea
          value={seo.description || ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder="اكتشف مجموعة واسعة من المنتجات..."
          maxLength={160}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-xs resize-none"
        />
        <p className="text-[10px] text-gray-400 mt-1">{(seo.description || '').length}/160 حرف</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">الكلمات المفتاحية (Keywords)</label>
        <input
          value={seo.keywords || ''}
          onChange={(e) => set('keywords', e.target.value)}
          placeholder="متجر, منتجات, تسوق, عروض"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-xs"
        />
        <p className="text-[10px] text-gray-400 mt-1">افصل بين الكلمات بفاصلة</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">صورة المشاركة (OG Image)</label>
        <input
          value={seo.ogImage || ''}
          onChange={(e) => set('ogImage', e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          dir="ltr"
        />
        <p className="text-[10px] text-gray-400 mt-1">الحجم المناسب: 1200×628 بكسل</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">الأيقونة (Favicon)</label>
        <input
          value={seo.favicon || ''}
          onChange={(e) => set('favicon', e.target.value)}
          placeholder="https://... (.ico أو .png)"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Google Analytics ID</label>
        <input
          value={seo.googleAnalyticsId || ''}
          onChange={(e) => set('googleAnalyticsId', e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook Pixel ID</label>
        <input
          value={seo.facebookPixelId || ''}
          onChange={(e) => set('facebookPixelId', e.target.value)}
          placeholder="XXXXXXXXXXXXXXXXX"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          dir="ltr"
        />
      </div>
    </div>
  );
}
