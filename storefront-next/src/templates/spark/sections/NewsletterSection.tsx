'use client';

import { useState } from 'react';
import type { ThemeData } from '@/types/theme';

interface Props {
  config: {
    title?: string;
    subtitle?: string;
    placeholder?: string;
    buttonText?: string;
  };
  theme: ThemeData;
}

export default function NewsletterSection({ config, theme }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to API
    setSubmitted(true);
  };

  return (
    <section className="py-16 px-4" style={{ backgroundColor: theme.colors.primary }}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3" style={{ fontFamily: `var(--font-heading)` }}>
          {config.title || 'اشترك في نشرتنا البريدية'}
        </h2>
        <p className="text-white/80 mb-8">
          {config.subtitle || 'احصل على أحدث العروض والتخفيضات مباشرة في بريدك'}
        </p>
        {submitted ? (
          <div className="bg-white/20 text-white rounded-xl px-6 py-4 font-medium">
            ✅ شكراً! تم تسجيلك بنجاح
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={config.placeholder || 'بريدك الإلكتروني'}
              required
              className="flex-1 px-4 py-3 rounded-xl outline-none text-sm"
              style={{ color: theme.colors.text }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105"
              style={{ backgroundColor: '#FFFFFF', color: theme.colors.primary }}
            >
              {config.buttonText || 'اشترك'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
