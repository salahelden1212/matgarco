import { fetchStorefrontTheme } from '@/lib/api';
import { notFound } from 'next/navigation';
import StorePageShell from '@/components/StorePageShell';
import CheckoutClient from './CheckoutClient';

interface Props {
  params: { subdomain: string };
}

export default async function CheckoutPage({ params }: Props) {
  const { subdomain } = params;

  const themeRes = await fetchStorefrontTheme(subdomain);
  if (!themeRes) return notFound();

  // Get merchant's shipping config
  const shippingConfig = (themeRes as any)?.merchant?.shippingConfig || null;

  return (
    <StorePageShell subdomain={subdomain}>
      <CheckoutClient
        subdomain={subdomain}
        shippingConfig={shippingConfig}
      />
    </StorePageShell>
  );
}

