import Link from 'next/link';
import Image from 'next/image';
import type { ThemeData } from '@/types/theme';

interface Props {
  config: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: string;
    bgColor?: string;
  };
  theme: ThemeData;
  subdomain: string;
}

export default function PromoBanner({ config, theme, subdomain }: Props) {
  if (!config.title && !config.image) return null;

  const bg   = config.bgColor || theme.colors.primary;
  const base = `/store/${subdomain}`;

  // Resolve ctaLink — stored configs might be bare '/products'
  let ctaLink = config.ctaLink || `${base}/products`;
  if (ctaLink && !ctaLink.startsWith('/store/') && ctaLink.startsWith('/')) {
    ctaLink = `${base}${ctaLink}`;
  }

  return (
    <section className="my-8 mx-4 md:mx-auto max-w-7xl">
      <div
        className="relative rounded-3xl overflow-hidden min-h-[280px] flex items-center"
        style={{ backgroundColor: bg }}
      >
        {config.image && (
          <Image src={config.image} alt={config.title || ''} fill className="object-cover opacity-40" />
        )}
        <div className="relative z-10 px-8 md:px-16 py-12 text-white">
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ fontFamily: `var(--font-heading)` }}>
            {config.title}
          </h2>
          {config.subtitle && <p className="text-lg mb-6 opacity-90">{config.subtitle}</p>}
          {config.ctaText && (
            <Link
              href={ctaLink}
              className="inline-flex px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: '#FFFFFF', color: bg }}
            >
              {config.ctaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
