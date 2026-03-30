import React from 'react';

export default function TestimonialsSection({ settings = {}, blocks = [] }: { settings: Record<string, any>, blocks: any[] }) {
  const { title = 'آراء عملائنا', backgroundColor = 'var(--background)' } = settings;

  // Default block if empty
  const defaultBlocks = blocks.length > 0 ? blocks : [
    { id: '1', settings: { author: 'أحمد محمود', content: 'منتجات رائعة وجودة ممتازة، أنصح بالتعامل معهم!', rating: 5 } },
    { id: '2', settings: { author: 'منى كريم', content: 'خدمة عملاء راقية وتوصيل سريع جداً.', rating: 5 } },
    { id: '3', settings: { author: 'علي حسن', content: 'تجربة تسوق مميزة، سأقوم بالشراء مرة أخرى بالتأكيد.', rating: 4 } }
  ];

  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[var(--text)]">{title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {defaultBlocks.map((block) => (
            <div key={block.id} className="bg-[var(--surface)] p-8 rounded-[var(--radius)] shadow-sm border border-[var(--border)] relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex text-yellow-400 mb-6 gap-1">
                {[...Array(block.settings.rating || 5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[var(--text)] text-lg mb-8 leading-relaxed italic relative z-10 font-medium">
                "{block.settings.content}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-[var(--border)] mt-auto">
                {block.settings.image ? (
                  <img 
                    src={block.settings.image} 
                    alt={block.settings.author} 
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--border)]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xl">
                    {block.settings.author?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-[var(--text)] text-lg">{block.settings.author}</h4>
                  {block.settings.role && <p className="text-sm text-[var(--text-muted)] font-medium mt-1">{block.settings.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
