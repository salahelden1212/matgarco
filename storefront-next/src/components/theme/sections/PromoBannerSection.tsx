import React from 'react';

export default function PromoBannerSection({ settings }: { settings: Record<string, any> }) {
  const {
    title = '🔥 عرض خاص',
    subtitle = 'خصم 30% على جميع المنتجات لفترة محدودة',
    ctaText = 'اطلب الآن',
    ctaLink = '/products',
    image,
    bgColor = 'var(--color-primary, #3B82F6)',
  } = settings;

  return (
    <section
      className="relative py-16 px-4 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="container relative mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-black mb-3 drop-shadow">{title}</h2>
        <p className="text-lg text-white/90 mb-6 max-w-xl mx-auto">{subtitle}</p>
        {ctaText && (
          <a
            href={ctaLink}
            className="inline-block px-8 py-3 bg-white text-[var(--color-primary,#3B82F6)] font-bold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
