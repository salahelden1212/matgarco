import type { ThemeData } from '@/types/theme';
import Link from 'next/link';

interface Props {
  config: { title?: string; style?: '2col' | '3col' | 'horizontal' };
  theme: ThemeData;
  subdomain: string;
}

// Placeholder categories until API supports them
const PLACEHOLDER_CATS = [
  { id: '1', name: 'تصفح الكل', icon: '🛍️', slug: '' },
  { id: '2', name: 'الأكثر مبيعاً', icon: '🔥', slug: '?sort=bestseller' },
  { id: '3', name: 'وصل حديثاً', icon: '✨', slug: '?sort=newest' },
];

export default function CategoriesGrid({ config, theme, subdomain }: Props) {
  const title = config.title || 'تسوق حسب الفئة';

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      <h2
        className="text-2xl font-black mb-6 text-center"
        style={{ color: theme.colors.text, fontFamily: `var(--font-heading)` }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PLACEHOLDER_CATS.map((cat) => (
          <Link
            key={cat.id}
            href={`/store/${subdomain}/products${cat.slug}`}
            className="flex flex-col items-center justify-center gap-3 py-8 rounded-2xl font-semibold text-sm transition-all hover:scale-105 hover:shadow-md"
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
            }}
          >
            <span className="text-4xl">{cat.icon}</span>
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
