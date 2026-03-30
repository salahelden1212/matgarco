import React from 'react';

const BADGE_ICONS: Record<string, string> = {
  shipping:  '🚀',
  guarantee: '↩️',
  secure:    '🔒',
  support:   '💬',
};

const BADGE_LABELS: Record<string, { title: string; desc: string }> = {
  shipping:  { title: 'شحن سريع',        desc: 'توصيل داخل 2-5 أيام عمل' },
  guarantee: { title: 'ضمان الإرجاع',    desc: 'إرجاع مجاني خلال 14 يوماً' },
  secure:    { title: 'دفع آمن 100%',    desc: 'جميع بياناتك محمية ومشفرة' },
  support:   { title: 'دعم فني 24/7',    desc: 'فريقنا دائماً في خدمتك' },
};

export default function TrustBadgesSection({ settings }: { settings: Record<string, any> }) {
  const {
    badges = ['shipping', 'guarantee', 'secure', 'support'],
  } = settings;

  const activeBadges: string[] = Array.isArray(badges) ? badges : Object.keys(BADGE_LABELS);

  return (
    <section className="py-10 border-y border-[var(--color-border,#e5e7eb)] bg-[var(--color-background,#fff)]">
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(activeBadges.length, 4)} gap-6`}>
          {activeBadges.map((key) => {
            const badge = BADGE_LABELS[key];
            if (!badge) return null;
            return (
              <div key={key} className="flex items-center gap-4 p-4">
                <div className="text-3xl flex-shrink-0">{BADGE_ICONS[key] ?? '✅'}</div>
                <div>
                  <p className="font-bold text-sm text-[var(--color-text,#111)]">{badge.title}</p>
                  <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-0.5">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
