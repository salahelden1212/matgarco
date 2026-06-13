import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2, Eye, Code, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { aiAPI } from '../../../lib/api';
import { toast } from 'sonner';

interface Props {
  draft: any;
  onChange: (update: Record<string, any>) => void;
}

export default function SeoPanel({ draft, onChange }: Props) {
  const seo = draft?.seo || {};
  const store = draft || {};
  const set = (key: string, val: string) => onChange({ seo: { ...seo, [key]: val } });

  const titleLen = (seo.title || '').length;
  const descLen = (seo.description || '').length;
  const titleScore = titleLen > 20 && titleLen <= 60 ? 100 : titleLen <= 10 ? 40 : 70;
  const descScore = descLen > 70 && descLen <= 160 ? 100 : descLen <= 30 ? 40 : 70;
  const hasKeywords = (seo.keywords || '').split(',').filter(Boolean).length >= 3;
  const hasOgImage = !!seo.ogImage;
  const overallScore = Math.round((titleScore + descScore + (hasKeywords ? 100 : 40) + (hasOgImage ? 100 : 50)) / 4);

  const generateMutation = useMutation({
    mutationFn: (data: { storeName: string; description?: string; industry?: string }) =>
      aiAPI.generateStoreSEO(data),
    onSuccess: (res) => {
      const data = res.data?.data;
      if (data) {
        onChange({
          seo: {
            ...seo,
            title: data.seoTitle || seo.title,
            description: data.seoDescription || seo.description,
            keywords: Array.isArray(data.seoKeywords) ? data.seoKeywords.join(', ') : (data.seoKeywords || seo.keywords),
            ogDescription: data.ogDescription || seo.ogDescription,
            canonicalUrl: data.canonicalUrl || seo.canonicalUrl,
          },
        });
        setSuggestions(data.suggestions || []);
        toast.success('تم توليد بيانات SEO للمتجر بنجاح ✨');
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'فشل الاتصال بخدمة الذكاء الاصطناعي';
      toast.error(msg);
    },
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGenerate = () => {
    generateMutation.mutate({
      storeName: store.name || store.storeName || 'متجري',
      description: store.description || seo.description || '',
      industry: store.industry || '',
    });
  };

  const googlePreview = useMemo(() => {
    const title = seo.title || store.name || 'متجر إلكتروني';
    const desc = seo.description || store.description || '';
    return { title, url: `https://${store.subdomain || 'example'}.matgarco.com`, desc };
  }, [seo, store]);

  const jsonLd = useMemo(() => {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: store.name || 'متجري',
      description: seo.description || store.description || '',
      url: `https://${store.subdomain || 'example'}.matgarco.com`,
      image: seo.ogImage || '',
      sameAs: [
        draft?.social?.facebook || '',
        draft?.social?.instagram || '',
        draft?.social?.twitter || '',
      ].filter(Boolean),
    }, null, 2);
  }, [seo, store, draft]);

  const [showJson, setShowJson] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-800">إعدادات SEO</h3>
          <p className="text-xs text-gray-400">تحسين ظهور متجرك في نتائج البحث</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
        >
          {generateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Quantus AI — تحسين SEO
        </button>
      </div>

      {/* SEO Score */}
      <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: overallScore >= 80 ? '#bbf7d0' : overallScore >= 60 ? '#fde68a' : '#fecaca' }}>
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none"
              stroke={overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#eab308' : '#ef4444'}
              strokeWidth="3" strokeDasharray={`${overallScore} ${100 - overallScore}`}
              strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#eab308' : '#ef4444' }}>
            {overallScore}%
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-700">نسبة تحسين SEO</p>
          <p className="text-[10px] text-gray-500">
            {overallScore >= 80 ? 'ممتاز 🎉' : overallScore >= 60 ? 'جيد 👍' : 'يحتاج تحسين 📈'}
            {!hasKeywords && ' — أضف كلمات مفتاحية'}
            {!hasOgImage && ' — أضف صورة مشاركة'}
          </p>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-[10px] font-bold text-amber-700 mb-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> اقتراحات Quantus AI
          </p>
          {suggestions.map((s, i) => (
            <p key={i} className="text-[10px] text-amber-600 leading-relaxed">• {s}</p>
          ))}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">عنوان الصفحة (Title)</label>
        <div className="relative">
          <input value={seo.title || ''} onChange={(e) => set('title', e.target.value)}
            placeholder="متجر النور | تسوق أحدث المنتجات"
            maxLength={70} dir="rtl"
            className="w-full px-3 py-2 rounded-xl border outline-none focus:border-indigo-400 text-xs transition-all"
            style={{ borderColor: titleLen > 60 ? '#fecaca' : '#e2e8f0' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className={`text-[10px] ${titleLen > 60 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
            {titleLen}/60 {titleLen > 60 ? '(كثير جداً ❌)' : titleLen >= 20 ? '(ممتاز ✅)' : '(قصير جداً ⚠️)'}
          </span>
          <span className="text-[10px] text-gray-400">{60 - titleLen} حرف متبقي</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">الوصف (Meta Description)</label>
        <textarea value={seo.description || ''} onChange={(e) => set('description', e.target.value)}
          placeholder="اكتشف مجموعة واسعة من المنتجات..." maxLength={200} rows={3}
          className="w-full px-3 py-2 rounded-xl border outline-none focus:border-indigo-400 text-xs resize-none transition-all"
          style={{ borderColor: descLen > 160 ? '#fecaca' : '#e2e8f0' }}
        />
        <div className="flex justify-between mt-1">
          <span className={`text-[10px] ${descLen > 160 ? 'text-red-500 font-bold' : descLen >= 70 ? 'text-green-600' : 'text-gray-400'}`}>
            {descLen < 70 ? 'قصير ⚠️' : descLen > 160 ? 'طويل ❌' : 'ممتاز ✅'}
          </span>
          <span className="text-[10px] text-gray-400">{Math.max(0, 160 - descLen)} حرف متبقي</span>
        </div>
      </div>

      {/* Google Preview */}
      <div className="p-3 rounded-xl border border-gray-200 bg-white">
        <p className="text-[10px] font-bold text-gray-500 mb-2 flex items-center gap-1"><Eye className="w-3 h-3" /> معاينة جوجل</p>
        <div className="space-y-0.5" dir="ltr">
          <p className="text-[10px] text-green-700">{googlePreview.url}</p>
          <p className="text-sm text-blue-700 font-medium leading-tight hover:underline cursor-pointer">{googlePreview.title}</p>
          <p className="text-[10px] text-gray-600 leading-relaxed">{googlePreview.desc.slice(0, 160)}</p>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">الكلمات المفتاحية</label>
        <input value={seo.keywords || ''} onChange={(e) => set('keywords', e.target.value)}
          placeholder="متجر, منتجات, تسوق, عروض, خصم"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-xs"
        />
        <p className="text-[10px] text-gray-400 mt-1">افصل بين الكلمات بفاصلة — عدد الكلمات: {(seo.keywords || '').split(',').filter(Boolean).length}</p>
      </div>

      {/* Two-column fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">صورة المشاركة (OG Image)</label>
          <input value={seo.ogImage || ''} onChange={(e) => set('ogImage', e.target.value)}
            placeholder="https://..." dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          />
          <p className="text-[10px] text-gray-400 mt-1">1200×628 بكسل</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">الأيقونة (Favicon)</label>
          <input value={seo.favicon || ''} onChange={(e) => set('favicon', e.target.value)}
            placeholder="https://... .ico" dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          />
          <p className="text-[10px] text-gray-400 mt-1">32×32 أو 16×16</p>
        </div>
      </div>

      {/* OG Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">وصف المشاركة (OG Description)</label>
        <input value={seo.ogDescription || ''} onChange={(e) => set('ogDescription', e.target.value)}
          placeholder="يظهر عند المشاركة على فيسبوك..."
          className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-xs"
        />
      </div>

      {/* Canonical URL + Social */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">الرابط الأساسي (Canonical URL)</label>
          <input value={seo.canonicalUrl || ''} onChange={(e) => set('canonicalUrl', e.target.value)}
            placeholder="https://..." dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Google Analytics ID</label>
          <input value={seo.googleAnalyticsId || ''} onChange={(e) => set('googleAnalyticsId', e.target.value)}
            placeholder="G-XXXXXXXXXX" dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook Pixel ID</label>
          <input value={seo.facebookPixelId || ''} onChange={(e) => set('facebookPixelId', e.target.value)}
            placeholder="XXXXXXXXXXXXXXXXX" dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Twitter Handle</label>
          <input value={seo.twitterHandle || ''} onChange={(e) => set('twitterHandle', e.target.value)}
            placeholder="@username" dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-xs"
          />
        </div>
      </div>

      {/* Robots Meta */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={seo.noindex !== 'true'} onChange={(e) => onChange({ seo: { ...seo, noindex: e.target.checked ? 'false' : 'true' } })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <span className="text-xs text-gray-700">السماح بفهرسة المتجر (index)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={seo.nofollow !== 'true'} onChange={(e) => onChange({ seo: { ...seo, nofollow: e.target.checked ? 'false' : 'true' } })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <span className="text-xs text-gray-700">السماح بمتابعة الروابط (follow)</span>
        </label>
      </div>

      {/* Structured Data (JSON-LD) */}
      <div>
        <button onClick={() => setShowJson(!showJson)}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          <Code className="w-3.5 h-3.5" />
          {showJson ? 'إخفاء' : 'عرض'} بيانات JSON-LD المنظمة
          <Info className="w-3 h-3 text-gray-400" />
        </button>
        {showJson && (
          <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded-xl text-[10px] overflow-x-auto leading-relaxed" dir="ltr">
            {jsonLd}
          </pre>
        )}
      </div>

      {/* Save hint */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        التغييرات تُحفظ تلقائياً عند التعديل
      </div>
    </div>
  );
}
