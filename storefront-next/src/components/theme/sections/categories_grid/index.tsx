import React from 'react';
import Link from 'next/link';
import { 
  Laptop, 
  Shirt, 
  Utensils, 
  Dumbbell, 
  Home, 
  HeartPulse, 
  Gamepad2, 
  BookOpen, 
  Car, 
  Gem, 
  Sparkles, 
  Tag, 
  LayoutGrid 
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  electronics: Laptop,
  laptop: Laptop,
  computer: Laptop,
  phone: Laptop,
  clothing: Shirt,
  fashion: Shirt,
  clothes: Shirt,
  food: Utensils,
  drinks: Utensils,
  sports: Dumbbell,
  fitness: Dumbbell,
  home: Home,
  garden: Home,
  beauty: HeartPulse,
  health: HeartPulse,
  toys: Gamepad2,
  games: Gamepad2,
  books: BookOpen,
  car: Car,
  jewelry: Gem,
  watches: Gem,
  perfume: Sparkles,
};

const arabicIconMap: Record<string, React.ComponentType<any>> = {
  'إلكترونيات': Laptop,
  'الكترونيات': Laptop,
  'هواتف': Laptop,
  'كمبيوتر': Laptop,
  'ملابس': Shirt,
  'أزياء': Shirt,
  'موضة': Shirt,
  'طعام': Utensils,
  'مأكولات': Utensils,
  'شراب': Utensils,
  'حلويات': Utensils,
  'مطاعم': Utensils,
  'رياضة': Dumbbell,
  'لياقة': Dumbbell,
  'جيم': Dumbbell,
  'منزل': Home,
  'حديقة': Home,
  'ديكور': Home,
  'أثاث': Home,
  'صحة': HeartPulse,
  'جمال': HeartPulse,
  'عناية': HeartPulse,
  'مكياج': HeartPulse,
  'ألعاب': Gamepad2,
  'العاب': Gamepad2,
  'كتب': BookOpen,
  'مكتبة': BookOpen,
  'سيارات': Car,
  'مجوهرات': Gem,
  'ساعات': Gem,
  'عطور': Sparkles,
};

function getCategoryIcon(name: string) {
  const cleanName = name.trim().toLowerCase();
  
  if (arabicIconMap[name.trim()]) {
    return arabicIconMap[name.trim()];
  }
  
  for (const key in arabicIconMap) {
    if (name.includes(key) || key.includes(name)) {
      return arabicIconMap[key];
    }
  }

  if (iconMap[cleanName]) {
    return iconMap[cleanName];
  }

  for (const key in iconMap) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return iconMap[key];
    }
  }

  return Tag;
}

export interface CategoriesGridProps {
  id: string;
  variant?: string;
  settings: Record<string, any>;
  blocks: any[];
  storeData?: any;
}

export default function CategoriesGridSection({ settings, variant = 'grid', storeData }: CategoriesGridProps) {
  const {
    title = 'تسوق حسب الفئة',
    style = '3col',
    bgColor = '#ffffff',
  } = settings;

  const colClass =
    style === '2col'
      ? 'grid-cols-2'
      : style === 'horizontal'
      ? 'flex overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';

  const rawCategories: any[] = storeData?.categories || storeData?.store?.categories || [];

  if (rawCategories.length === 0) {
    return (
      <section className="py-12 px-4" style={{ backgroundColor: bgColor }}>
        <div className="container mx-auto max-w-md text-center py-12 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد فئات حالياً</h3>
          <p className="text-sm text-slate-500">
            لم يتم إضافة فئات أو منتجات في هذا المتجر بعد.
          </p>
        </div>
      </section>
    );
  }

  const categories = rawCategories.map((c: any) => {
    const name = typeof c === 'string' ? c : c.name;
    return {
      name,
      Icon: getCategoryIcon(name)
    };
  });

  const isSlider = variant === 'slider';
  const containerClass = isSlider ? 'flex overflow-x-auto gap-4 snap-x hide-scrollbar pb-6' : `grid ${colClass} gap-4`;
  const itemClass = isSlider ? 'min-w-[140px] snap-center shrink-0' : '';

  return (
    <section className="py-12 px-4" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto">
        {title && (
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-8 text-center drop-shadow-sm">
            {title}
          </h2>
        )}
        <div className={containerClass}>
          {categories.map((cat: { name: string; Icon: React.ComponentType<any> }, i: number) => {
            const IconComponent = cat.Icon;
            const subdomain = storeData?.merchant?.subdomain;
            const base = subdomain ? `/store/${subdomain}` : '';
            return (
              <Link
                key={i}
                href={`${base}/products?category=${encodeURIComponent(cat.name)}`}
                className={`group flex flex-col items-center justify-center p-6 rounded-2xl bg-white shadow-sm border border-slate-150 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer ${itemClass}`}
              >
                <span className="block w-14 h-14 rounded-full bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center mb-3 transition-colors duration-300 shadow-inner">
                  <IconComponent className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </span>
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-950 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
