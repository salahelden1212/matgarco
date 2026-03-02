import { fetchStorefrontTheme } from '@/lib/api';
import { notFound } from 'next/navigation';
import StorePageShell from '@/components/StorePageShell';
import CartPageClient from './CartPageClient';

interface Props {
  params: { subdomain: string };
}

export default async function CartPage({ params }: Props) {
  const { subdomain } = params;

  const themeRes = await fetchStorefrontTheme(subdomain);
  if (!themeRes) return notFound();

  const theme = themeRes.theme;

  return (
    <StorePageShell subdomain={subdomain}>
      <CartPageClient
        subdomain={subdomain}
        theme={{ colors: theme.colors, store: theme.store }}
      />
    </StorePageShell>
  );
}
