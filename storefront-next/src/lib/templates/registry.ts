import type { TemplateInfo } from '@/types/theme';

// ─── Template metadata ─────────────────────────────────────────────────────────
export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'spark',
    name: 'Spark',
    nameAr: 'سبارك',
    description: 'Clean, modern and versatile. Great for any product type.',
    descriptionAr: 'تصميم نظيف وعصري يناسب جميع أنواع المتاجر.',
    thumbnail: '/templates/spark.jpg',
    tags: ['modern', 'minimal', 'versatile'],
    bestFor: 'Electronics, general stores, tech products',
    bestForAr: 'إلكترونيات، متاجر عامة، منتجات تقنية',
    accentColor: '#3B82F6',
    isDark: false,
  },
  {
    id: 'volt',
    name: 'Volt',
    nameAr: 'فولت',
    description: 'Dark, powerful and energetic. Built for performance brands.',
    descriptionAr: 'تصميم داكن وقوي مصمم لعلامات الرياضة والأداء.',
    thumbnail: '/templates/volt.jpg',
    tags: ['dark', 'sporty', 'bold', 'neon'],
    bestFor: 'Sportswear, activewear, fitness, compression gear',
    bestForAr: 'ملابس رياضية، أدوات لياقة، ملابس ضاغطة',
    accentColor: '#7C3AED',
    isDark: true,
  },
  {
    id: 'epure',
    name: 'Épure',
    nameAr: 'إيبور',
    description: 'Warm, fashion-forward and elegant. Storytelling through products.',
    descriptionAr: 'تصميم دافئ وأنثوي راقٍ يروي قصة علامتك التجارية.',
    thumbnail: '/templates/epure.jpg',
    tags: ['warm', 'fashion', 'elegant', 'lifestyle'],
    bestFor: 'Hijab, scarves, fashion, lifestyle brands',
    bestForAr: 'حجاب، أوشحة، موضة، إكسسوارات أنثوية',
    accentColor: '#8B4513',
    isDark: false,
  },
  {
    id: 'bloom',
    name: 'Bloom',
    nameAr: 'بلوم',
    description: 'Soft, feminine and product-focused. Perfect for beauty stores.',
    descriptionAr: 'تصميم ناعم وأنثوي يبرز جمال منتجاتك.',
    thumbnail: '/templates/bloom.jpg',
    tags: ['feminine', 'soft', 'beauty', 'skincare'],
    bestFor: 'Beauty, skincare, personal care, cosmetics',
    bestForAr: 'جمال، عناية بالبشرة، مستحضرات تجميل',
    accentColor: '#EC4899',
    isDark: false,
  },
  {
    id: 'noir',
    name: 'Noir',
    nameAr: 'نوار',
    description: 'Luxury, dark and sophisticated. For premium brands.',
    descriptionAr: 'تصميم فاخر وداكن ومتطور للعلامات الراقية.',
    thumbnail: '/templates/noir.jpg',
    tags: ['luxury', 'dark', 'gold', 'premium'],
    bestFor: 'Perfumes, watches, jewelry, luxury goods',
    bestForAr: 'عطور، ساعات، مجوهرات، منتجات فاخرة',
    accentColor: '#C9A84C',
    isDark: true,
  },
  {
    id: 'mosaic',
    name: 'Mosaic',
    nameAr: 'موزاييك',
    description: 'Colorful, creative and joyful. Great for handmade & gifts.',
    descriptionAr: 'تصميم ملون وإبداعي مليء بالحيوية للمنتجات اليدوية.',
    thumbnail: '/templates/mosaic.jpg',
    tags: ['colorful', 'creative', 'handmade', 'gifts'],
    bestFor: 'Handmade crafts, gifts, art, home decor',
    bestForAr: 'هاندميد، هدايا، فنون، ديكور منزلي',
    accentColor: '#FF6B6B',
    isDark: false,
  },
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

export type TemplateId = 'spark' | 'volt' | 'epure' | 'bloom' | 'noir' | 'mosaic';

/**
 * Lazily import the HomePage component for the given templateId.
 * Add new templates here — no other file needs changing.
 */
export const TEMPLATE_LOADERS: Record<TemplateId, () => Promise<{ default: React.ComponentType<any> }>> = {
  spark:  () => import('@/templates/spark/HomePage'),
  volt:   () => import('@/templates/volt/HomePage'),
  epure:  () => import('@/templates/epure/HomePage'),
  bloom:  () => import('@/templates/bloom/HomePage'),
  noir:   () => import('@/templates/noir/HomePage'),
  mosaic: () => import('@/templates/mosaic/HomePage'),
};
