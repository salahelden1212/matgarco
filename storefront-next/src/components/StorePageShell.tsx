/**
 * StorePageShell — server component.
 * Wraps inner pages (products, product detail, cart) with the correct
 * template Header + Footer for the given subdomain.
 */
import { notFound } from 'next/navigation';
import { fetchStorefrontTheme, fetchPreviewTheme } from '@/lib/api';
import { isPreviewMode } from '@/lib/preview';
import type { TemplateId } from '@/lib/templates/registry';

interface Props {
  subdomain: string;
  children: React.ReactNode;
}

export default async function StorePageShell({ subdomain, children }: Props) {
  const preview = isPreviewMode();
  const data = preview
    ? await fetchPreviewTheme(subdomain)
    : await fetchStorefrontTheme(subdomain);
  if (!data) notFound();

  const { theme, merchant } = data;
  const templateId = (theme.templateId || 'spark') as TemplateId;

  // Dynamically import the template's Header and Footer
  const [{ default: Header }, { default: Footer }] = await Promise.all([
    import(`@/templates/${templateId}/Header`),
    import(`@/templates/${templateId}/Footer`),
  ]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}
    >
      {preview && (
        <div className="fixed top-0 inset-x-0 z-[9999] bg-indigo-600 text-white text-xs text-center py-2 font-medium">
          🔍 وضع المعاينة — التغييرات لم تُنشر بعد
        </div>
      )}

      <Header theme={theme} merchant={merchant} />

      <main className="flex-1">
        {children}
      </main>

      <Footer theme={theme} merchant={merchant} />
    </div>
  );
}
