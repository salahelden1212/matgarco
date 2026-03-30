/**
 * StorePageShell — server component.
 * Wraps inner pages (products, product detail, cart) with the correct
 * template Header + Footer for the given subdomain.
 */
import { notFound } from 'next/navigation';
import { fetchStorefrontTheme, fetchPreviewTheme, fetchMasterThemePreview } from '@/lib/api';
import { isPreviewMode, getMasterThemeId } from '@/lib/preview';
import HeaderSection from '@/components/theme/sections/HeaderSection';
import FooterSection from '@/components/theme/sections/FooterSection';

interface Props {
  subdomain: string;
  children: React.ReactNode;
}

export default async function StorePageShell({ subdomain, children }: Props) {
  const preview = isPreviewMode();
  const masterId = getMasterThemeId();
  
  const data = preview && masterId
    ? await fetchMasterThemePreview(masterId)
    : preview
      ? await fetchPreviewTheme(subdomain)
      : await fetchStorefrontTheme(subdomain);
  if (!data) notFound();

  const { theme, merchant } = data;

  // Extract global sections or use defaults
  const globalSections = theme?.pages?.global?.sections || [];
  const headerSettings = globalSections.find((s: any) => s.type === 'header')?.settings || {};
  const footerSettings = globalSections.find((s: any) => s.type === 'footer')?.settings || {};

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)]">
      {preview && (
        <div className="fixed top-0 inset-x-0 z-[9999] bg-indigo-600 text-white text-xs text-center py-2 font-medium shadow-md">
          🔍 وضع المعاينة — التغييرات لم تُنشر بعد
        </div>
      )}

      <HeaderSection settings={headerSettings} storeData={{ merchant }} />

      <main className="flex-1 w-full bg-[var(--background)]">
        {children}
      </main>

      <FooterSection settings={footerSettings} storeData={{ merchant }} />
    </div>
  );
}
