import React from 'react';

export default function NewsletterSection({ settings }: { settings: Record<string, any> }) {
  const {
    title       = 'اشترك في نشرتنا البريدية',
    subtitle    = 'احصل على أحدث العروض والتخفيضات في بريدك مباشرة',
    placeholder = 'بريدك الإلكتروني',
    buttonText  = 'اشترك مجاناً',
  } = settings;

  return (
    <section className="py-16 px-4 bg-[var(--color-primary,#3B82F6)]">
      <div className="container mx-auto text-center text-white max-w-xl">
        <h2 className="text-3xl font-black mb-3">{title}</h2>
        <p className="text-white/80 mb-8">{subtitle}</p>
        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder={placeholder}
            className="flex-1 px-5 py-3 rounded-full text-gray-900 outline-none text-sm font-medium placeholder:text-gray-400 shadow"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-white text-[var(--color-primary,#3B82F6)] font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  );
}
