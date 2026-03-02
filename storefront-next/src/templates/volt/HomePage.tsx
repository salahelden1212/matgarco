import type { ThemeData } from '@/types/theme';
import { getEnabledSections } from '@/lib/theme';
import VoltHeader from './Header';
import VoltFooter from './Footer';
import AnnouncementBar from '../spark/sections/AnnouncementBar';
import HeroSection from '../spark/sections/HeroSection';
import FeaturedProducts from '../spark/sections/FeaturedProducts';
import CategoriesGrid from '../spark/sections/CategoriesGrid';
import PromoBanner from '../spark/sections/PromoBanner';
import NewArrivals from '../spark/sections/NewArrivals';
import TrustBadges from '../spark/sections/TrustBadges';
import NewsletterSection from '../spark/sections/NewsletterSection';

interface Props {
  theme: ThemeData;
  merchant: { storeName: string; subdomain: string; logo: string };
  products: any[];
  isPreview?: boolean;
}

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  announcement_bar:  AnnouncementBar,
  hero:              HeroSection,
  featured_products: FeaturedProducts,
  categories_grid:   CategoriesGrid,
  promo_banner:      PromoBanner,
  new_arrivals:      NewArrivals,
  trust_badges:      TrustBadges,
  newsletter:        NewsletterSection,
};

export default function VoltHomePage({ theme, merchant, products, isPreview }: Props) {
  const enabledSections = getEnabledSections(theme);

  // Volt: dark background forced
  const voltBackground = theme.colors.background || '#0A0A0A';

  return (
    <>
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-black text-xs text-center py-2 font-bold">
          ⚡ وضع المعاينة — التغييرات لم تُنشر بعد
        </div>
      )}
      <div className={`min-h-screen flex flex-col ${isPreview ? 'pt-8' : ''}`} style={{ backgroundColor: voltBackground }}>
        <VoltHeader theme={theme} merchant={merchant} />
        <main className="flex-1">
          {enabledSections.map((section) => {
            const Component = SECTION_COMPONENTS[section.id];
            if (!Component) return null;
            return (
              <Component
                key={section.id}
                config={section.config}
                theme={theme}
                products={products}
                subdomain={merchant.subdomain}
              />
            );
          })}
        </main>
        <VoltFooter theme={theme} merchant={merchant} />
      </div>
    </>
  );
}
