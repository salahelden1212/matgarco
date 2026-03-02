import type { ThemeData } from '@/types/theme';
import { getEnabledSections, getSection } from '@/lib/theme';
import SparkHeader from './Header';
import SparkFooter from './Footer';
import AnnouncementBar from './sections/AnnouncementBar';
import HeroSection from './sections/HeroSection';
import FeaturedProducts from './sections/FeaturedProducts';
import CategoriesGrid from './sections/CategoriesGrid';
import PromoBanner from './sections/PromoBanner';
import NewArrivals from './sections/NewArrivals';
import TrustBadges from './sections/TrustBadges';
import NewsletterSection from './sections/NewsletterSection';

interface Props {
  theme: ThemeData;
  merchant: { storeName: string; subdomain: string; logo: string };
  products: any[];
  isPreview?: boolean;
}

// Map section IDs to components
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

export default function SparkHomePage({ theme, merchant, products, isPreview }: Props) {
  const enabledSections = getEnabledSections(theme);

  return (
    <>
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-indigo-600 text-white text-xs text-center py-2 font-medium">
          🔍 وضع المعاينة — التغييرات لم تُنشر بعد
        </div>
      )}

      <div className={`min-h-screen flex flex-col ${isPreview ? 'pt-8' : ''}`} style={{ backgroundColor: theme.colors.background }}>
        <SparkHeader theme={theme} merchant={merchant} />

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

        <SparkFooter theme={theme} merchant={merchant} />
      </div>
    </>
  );
}
