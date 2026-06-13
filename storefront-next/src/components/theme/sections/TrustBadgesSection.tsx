import React from 'react';
import BlockRenderer from '../blocks/BlockRenderer';
import { Truck, RotateCcw, ShieldCheck, Headphones, CheckCircle2 } from 'lucide-react';

const BADGE_ICONS: Record<string, string> = {
  shipping:  'shipping',
  guarantee: 'guarantee',
  secure:    'secure',
  support:   'support',
};

const BADGE_LABELS: Record<string, { title: string; desc: string }> = {
  shipping:  { title: 'شحن سريع',        desc: 'توصيل داخل 2-5 أيام عمل' },
  guarantee: { title: 'ضمان الإرجاع',    desc: 'إرجاع مجاني خلال 14 يوماً' },
  secure:    { title: 'دفع آمن 100%',    desc: 'جميع بياناتك محمية ومشفرة' },
  support:   { title: 'دعم فني 24/7',    desc: 'فريقنا دائماً في خدمتك' },
};

const iconMap: Record<string, React.ComponentType<any>> = {
  shipping: Truck,
  '🚀': Truck,
  guarantee: RotateCcw,
  '↩️': RotateCcw,
  secure: ShieldCheck,
  '🔒': ShieldCheck,
  support: Headphones,
  '💬': Headphones,
};

function renderBadgeIcon(icon: string) {
  const IconComponent = iconMap[icon] || CheckCircle2;
  return <IconComponent className="w-8 h-8 text-slate-800" />;
}

export default function TrustBadgesSection({ settings = {}, blocks = [] }: { settings: Record<string, any>; blocks?: any[] }) {
  const {
    badges = ['shipping', 'guarantee', 'secure', 'support'],
    title = 'لماذا نحن؟',
    backgroundColor = 'var(--background)',
    borderColor = 'var(--border)',
  } = settings;

  const legacyBadgeKeys: string[] = Array.isArray(badges) ? badges : Object.keys(BADGE_LABELS);
  const legacyBlocks = [
    { id: 'legacy-heading', type: 'heading', settings: { text: title, size: 'h3', align: 'center' } },
    ...legacyBadgeKeys
      .filter((key) => !!BADGE_LABELS[key])
      .map((key, index) => ({
        id: `legacy-badge-${index + 1}`,
        type: 'badge_item',
        settings: {
          icon: BADGE_ICONS[key] ?? 'guarantee',
          title: BADGE_LABELS[key].title,
          description: BADGE_LABELS[key].desc,
        },
      })),
  ];

  const effectiveBlocks = blocks.length > 0 ? blocks : legacyBlocks;
  const headingBlocks = effectiveBlocks.filter((block) => ['heading', 'paragraph', 'subtext', 'divider', 'spacer'].includes(block.type));
  const badgeBlocks = effectiveBlocks.filter((block) => block.type === 'badge_item');

  const columnsClass =
    badgeBlocks.length >= 4
      ? 'md:grid-cols-4'
      : badgeBlocks.length === 3
        ? 'md:grid-cols-3'
        : badgeBlocks.length === 2
          ? 'md:grid-cols-2'
          : 'md:grid-cols-1';

  return (
    <section className="py-12 border-y border-slate-100 bg-white" style={{ borderColor, backgroundColor }}>
      <div className="container mx-auto px-4">
        <div className="space-y-4 mb-10">
          {headingBlocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              context={{ sectionType: 'trust_badges', tone: 'light', align: 'center' }}
            />
          ))}
        </div>
        <div className={`grid grid-cols-2 ${columnsClass} gap-6 md:gap-8`}>
          {badgeBlocks.map((block) => {
            const iconName = block.settings?.icon || 'guarantee';
            return (
              <div key={block.id} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100/50 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  {renderBadgeIcon(iconName)}
                </div>
                <div>
                  <p className="font-extrabold text-sm md:text-base text-slate-900">{block.settings?.title || 'شارة ثقة'}</p>
                  <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">{block.settings?.description || ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
