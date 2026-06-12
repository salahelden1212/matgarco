import { NextResponse } from 'next/server';
import { fetchProducts, fetchCategories } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: { subdomain: string } }) {
  const { subdomain } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${subdomain}.matgarco.com`;

  const staticPages = [
    { loc: baseUrl, priority: '1.0', freq: 'daily' },
    { loc: `${baseUrl}/products`, priority: '0.8', freq: 'weekly' },
    { loc: `${baseUrl}/categories`, priority: '0.7', freq: 'weekly' },
    { loc: `${baseUrl}/cart`, priority: '0.4', freq: 'monthly' },
    { loc: `${baseUrl}/track-order`, priority: '0.5', freq: 'monthly' },
  ];

  // Fetch product URLs
  let productUrls: { loc: string; priority: string; freq: string; lastmod: string }[] = [];
  try {
    const productsData = await fetchProducts(subdomain, { limit: 1000 });
    if (productsData?.products) {
      productUrls = productsData.products.map((p: any) => ({
        loc: `${baseUrl}/products/${p.slug || p._id}`,
        priority: '0.7',
        freq: 'weekly',
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : '',
      }));
    }
  } catch {}

  let categoryUrls: { loc: string; priority: string; freq: string }[] = [];
  try {
    const categoriesData = await fetchCategories(subdomain);
    if (categoriesData?.categories) {
      categoryUrls = categoriesData.categories.map((c: any) => ({
        loc: `${baseUrl}/products?category=${encodeURIComponent(c.name)}`,
        priority: '0.6',
        freq: 'weekly',
      }));
    }
  } catch {}

  const all = [...staticPages, ...productUrls, ...categoryUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
