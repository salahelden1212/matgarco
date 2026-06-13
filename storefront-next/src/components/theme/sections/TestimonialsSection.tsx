import React from 'react';
import BlockRenderer from '../blocks/BlockRenderer';
import { Star } from 'lucide-react';

export default function TestimonialsSection({ settings = {}, blocks = [] }: { settings: Record<string, any>, blocks: any[] }) {
  const { title = 'آراء عملائنا', subtitle = '', backgroundColor = 'var(--background)' } = settings;

  const legacyBlocks = [
    { id: 'legacy-title', type: 'heading', settings: { text: title, size: 'h2', align: 'center' } },
    ...(subtitle ? [{ id: 'legacy-subtitle', type: 'paragraph', settings: { text: subtitle, size: 'md', align: 'center' } }] : []),
    { id: 'legacy-item-1', type: 'testimonial_item', settings: { author: 'أحمد محمود', content: 'منتجات رائعة وجودة ممتازة، أنصح بالتعامل معهم!', rating: 5 } },
    { id: 'legacy-item-2', type: 'testimonial_item', settings: { author: 'منى كريم', content: 'خدمة عملاء راقية وتوصيل سريع جداً.', rating: 5 } },
    { id: 'legacy-item-3', type: 'testimonial_item', settings: { author: 'علي حسن', content: 'تجربة تسوق مميزة، سأقوم بالشراء مرة أخرى بالتأكيد.', rating: 4 } },
  ];

  const effectiveBlocks = blocks.length > 0 ? blocks : legacyBlocks;
  const headerBlocks = effectiveBlocks.filter((block) => ['heading', 'paragraph', 'subtext', 'divider', 'spacer'].includes(block.type));
  const testimonialItems = effectiveBlocks.filter((block) => block.type === 'testimonial_item' || !block.type);

  return (
    <section className="py-20 bg-slate-50" style={{ backgroundColor }}>
      <div className="container mx-auto px-4">
        <div className="space-y-3 mb-16">
          {headerBlocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              context={{ sectionType: 'testimonials', tone: 'light', align: 'center' }}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialItems.map((block) => (
            <div key={block.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex text-amber-400 mb-6 gap-0.5">
                {[...Array(Math.max(1, Math.min(5, Number(block.settings?.rating || 5))))].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 text-base md:text-lg mb-8 leading-relaxed italic relative z-10 font-medium">
                "{block.settings?.content || ''}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100 mt-auto">
                {block.settings?.image ? (
                  <img 
                    src={block.settings.image}
                    alt={block.settings.author || 'User'}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    {block.settings?.author?.[0] || 'ع'}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base md:text-lg">{block.settings?.author || 'عميل'}</h4>
                  {block.settings?.role && <p className="text-xs text-slate-400 font-semibold mt-1">{block.settings.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
