// ─── Section ──────────────────────────────────────────────────────────────────
export interface ThemeSection {
  id: string;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

// ─── Full theme payload ────────────────────────────────────────────────────────
export interface ThemeData {
  templateId: string;

  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    border: string;
  };

  fonts: {
    heading: string;
    body: string;
    size: 'sm' | 'md' | 'lg';
  };

  header: {
    style: 'centered' | 'split' | 'minimal' | 'sticky';
    showSearch: boolean;
    showCart: boolean;
    showWishlist: boolean;
  };

  productCard: {
    style: 'classic' | 'overlay' | 'minimal' | 'bordered';
    showRating: boolean;
    showBadges: boolean;
    showQuickAdd: boolean;
  };

  footer: {
    style: 'full' | 'minimal' | 'centered';
    showSocial: boolean;
    showNewsletter: boolean;
  };

  seo: {
    title: string;
    description: string;
    keywords: string;
    favicon: string;
    ogImage: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
  };

  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
    twitter: string;
    youtube: string;
  };

  store: {
    logo: string;
    tagline: string;
    currency: string;
    language: 'ar' | 'en';
    direction: 'rtl' | 'ltr';
    announcementBar: {
      enabled: boolean;
      text: string;
      bgColor: string;
      textColor: string;
    };
  };

  sections: ThemeSection[];
}

// ─── Storefront API response ───────────────────────────────────────────────────
export interface StorefrontThemeResponse {
  theme: ThemeData;
  merchant: {
    storeName: string;
    subdomain: string;
    logo: string;
    currency: string;
    language: string;
  };
  isPreview?: boolean;
}

// ─── Template metadata (for picker UI) ────────────────────────────────────────
export interface TemplateInfo {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  thumbnail: string;   // static image path in /public/templates/
  tags: string[];
  bestFor: string;
  bestForAr: string;
  accentColor: string; // preview color for the picker card
  isDark: boolean;
}
