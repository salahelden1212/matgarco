import React from 'react';
import HeaderSection        from './sections/HeaderSection';
import HeroSection          from './sections/hero';
import FeaturedProductsSection from './sections/FeaturedProductsSection';
import CategoriesGridSection from './sections/categories_grid';
import AnnouncementBarSection from './sections/AnnouncementBarSection';
import PromoBannerSection   from './sections/PromoBannerSection';
import NewArrivalsSection   from './sections/NewArrivalsSection';
import TrustBadgesSection   from './sections/TrustBadgesSection';
import TestimonialsSection  from './sections/TestimonialsSection';
import NewsletterSection    from './sections/NewsletterSection';
import ImageWithTextSection from './sections/ImageWithTextSection';
import FooterSection        from './sections/FooterSection';
import type { ThemeSection } from '@/types/theme';

// ─── Section Component Registry ───────────────────────────────────────────────
const SectionMap: Record<string, React.FC<any>> = {
  'header':              HeaderSection,
  'footer':              FooterSection,
  'announcement_bar':    AnnouncementBarSection,
  'hero':                HeroSection, // Points to our new Variant Resolver!
  'featured_products':   FeaturedProductsSection,
  'categories_grid':     CategoriesGridSection,
  'promo_banner':        PromoBannerSection,
  'new_arrivals':        NewArrivalsSection,
  'trust_badges':        TrustBadgesSection,
  'testimonials':        TestimonialsSection,
  'newsletter':          NewsletterSection,
  'image_with_text':     ImageWithTextSection,
};

interface ThemeRendererProps {
  sections: ThemeSection[];
  storeData?: any;
}

// ─── Normalise a section: resolve type/settings from old or new format ────────
function normaliseSection(s: any): ThemeSection {
  return {
    id: s.id ?? `section-${Math.random().toString(36).slice(2, 8)}`,
    type: s.type ?? s.id, 
    enabled: s.enabled ?? true,
    variant: s.variant,
    settings: s.settings ?? s.config ?? {},
    blocks: s.blocks ?? [],
  };
}

export default function ThemeRenderer({ sections = [], storeData }: ThemeRendererProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        لا توجد أقسام محددة في هذا القالب.
      </div>
    );
  }

  // Normalise all sections
  const normalised = sections.map(normaliseSection);

  // Check chrome sections
  const hasHeader = normalised.some((s) => s.type === 'header');
  const hasFooter = normalised.some((s) => s.type === 'footer');

  // Build ordered list: Announcement → Header → Content → Footer
  const announcement = normalised.filter((s) => s.type === 'announcement_bar');
  const headers = hasHeader ? normalised.filter((s) => s.type === 'header') : [{ id: '__auto-header', type: 'header', settings: {} }];
  const content = normalised.filter((s) => !['announcement_bar', 'header', 'footer'].includes(s.type || ''));
  const footers = hasFooter ? normalised.filter((s) => s.type === 'footer') : [{ id: '__auto-footer', type: 'footer', settings: {} }];

  const orderedSections = [...announcement, ...headers, ...content, ...footers];

  return (
    <div className="theme-renderer-wrapper w-full min-h-screen flex flex-col">
      {orderedSections.map((section, index) => {
        const typeKey = section.type || '';
        const Component = SectionMap[typeKey];

        if (!Component) {
          return (
            <div
              key={section.id || index}
              className="p-4 border border-dashed border-amber-300 bg-amber-50 text-amber-600 text-center m-4 rounded text-sm"
            >
              قسم غير معروف: <code>{typeKey}</code>
            </div>
          );
        }

        return (
          <Component
            key={section.id || index}
            id={section.id}
            variant={section.variant}
            settings={section.settings || {}}
            blocks={section.blocks || []}
            storeData={storeData}
          />
        );
      })}
    </div>
  );
}
