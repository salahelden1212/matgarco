import Link from 'next/link';
import Image from 'next/image';
import type { ThemeData } from '@/types/theme';

interface Props {
  config: {
    style?: 'fullscreen' | 'split' | 'centered';
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: string;
  };
  theme: ThemeData;
  subdomain: string;
}

export default function HeroSection({ config, theme, subdomain }: Props) {
  const style   = config.style   || 'fullscreen';
  const title   = config.title   || 'مرحباً بك في متجرنا';
  const subtitle = config.subtitle || 'اكتشف أحدث المنتجات بأفضل الأسعار';
  const ctaText = config.ctaText || 'تسوق الآن';
  const base    = `/store/${subdomain}`;

  // Resolve ctaLink — stored configs might be bare '/products'
  let ctaLink = config.ctaLink || `${base}/products`;
  if (ctaLink && !ctaLink.startsWith('/store/') && ctaLink.startsWith('/')) {
    ctaLink = `${base}${ctaLink}`;
  }

  // Fullscreen / image hero
  if (style === 'fullscreen' || style === 'centered') {
    return (
      <section className="relative w-full overflow-hidden" style={{ minHeight: '520px', backgroundColor: theme.colors.primary }}>
        {config.image && (
          <Image
            src={config.image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: config.image ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' : 'none' }}
        />
        {/* Content */}
        <div
          className={`relative z-10 flex flex-col items-${style === 'centered' ? 'center' : 'start'} justify-center h-full max-w-7xl mx-auto px-6 py-20 text-${style === 'centered' ? 'center' : 'right'}`}
          style={{ minHeight: '520px' }}
        >
          <h1
            className="text-4xl md:text-6xl font-black leading-tight mb-4"
            style={{
              color: config.image ? '#FFFFFF' : '#FFFFFF',
              fontFamily: `var(--font-heading)`,
            }}
          >
            {title}
          </h1>
          <p
            className="text-lg md:text-xl mb-8 max-w-xl"
            style={{ color: config.image ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)' }}
          >
            {subtitle}
          </p>
          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#FFFFFF', color: theme.colors.primary }}
          >
            {ctaText}
          </Link>
        </div>
      </section>
    );
  }

  // Split hero
  return (
    <section className="grid md:grid-cols-2 min-h-[480px]">
      {/* Text side */}
      <div
        className="flex flex-col justify-center px-8 md:px-16 py-16"
        style={{ backgroundColor: theme.colors.surface }}
      >
        <h1
          className="text-3xl md:text-5xl font-black leading-tight mb-4"
          style={{ color: theme.colors.text, fontFamily: `var(--font-heading)` }}
        >
          {title}
        </h1>
        <p className="text-lg mb-8" style={{ color: theme.colors.textMuted }}>
          {subtitle}
        </p>
        <Link
          href={ctaLink}
          className="self-start inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: theme.colors.primary }}
        >
          {ctaText}
        </Link>
      </div>
      {/* Image side */}
      <div className="relative min-h-[300px]" style={{ backgroundColor: theme.colors.primary + '20' }}>
        {config.image ? (
          <Image src={config.image} alt={title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary + '15' }}>
            <span className="text-8xl">🛍️</span>
          </div>
        )}
      </div>
    </section>
  );
}
