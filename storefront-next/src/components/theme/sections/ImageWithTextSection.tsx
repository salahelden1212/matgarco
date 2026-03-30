import React from 'react';
import Link from 'next/link';

export default function ImageWithTextSection({ settings }: { settings: Record<string, any> }) {
  const {
    title = 'نوفر لك أفضل جودة',
    content = 'نحن نهتم بأدق التفاصيل لضمان حصولك على منتجات تدوم طويلاً وتلبي كافة احتياجاتك اليومية.',
    image = 'https://picsum.photos/seed/imagetext/800/800',
    imagePosition = 'right', // left, right
    buttonText = 'اعرف المزيد',
    buttonLink = '/about',
    backgroundColor = 'var(--surface)',
  } = settings;

  return (
    <section className="py-16" style={{ backgroundColor }}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col gap-12 items-center ${imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
          <div className="w-full lg:w-1/2">
            <div className="aspect-square md:aspect-[4/3] rounded-[var(--radius)] overflow-hidden shadow-lg relative">
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-6 leading-tight">
              {title}
            </h2>
            <div className="text-lg text-[var(--text-muted)] mb-8 prose prose-lg prose-p:leading-relaxed">
              <p>{content}</p>
            </div>
            
            {buttonText && (
              <div>
                <Link 
                  href={buttonLink}
                  className="inline-block px-8 py-3 bg-[var(--text)] text-[var(--background)] font-medium rounded-[var(--radius)] hover:opacity-90 transition-opacity"
                >
                  {buttonText}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
