import type { ThemeData } from '@/types/theme';
import { Truck, RotateCcw, ShieldCheck, PhoneCall } from 'lucide-react';

interface Props {
  config: { badges?: string[] };
  theme: ThemeData;
}

const ALL_BADGES: Record<string, { icon: React.ComponentType<any>; label: string; sub: string }> = {
  shipping:  { icon: Truck,        label: 'شحن سريع',     sub: 'توصيل لباب بيتك' },
  guarantee: { icon: RotateCcw,    label: 'ضمان الإرجاع', sub: 'إرجاع خلال 14 يوم' },
  secure:    { icon: ShieldCheck,  label: 'دفع آمن',      sub: '100% مشفر وآمن' },
  support:   { icon: PhoneCall,    label: 'دعم 24/7',     sub: 'نحن هنا لمساعدتك' },
};

export default function TrustBadges({ config, theme }: Props) {
  const badges = config.badges || ['shipping', 'guarantee', 'secure', 'support'];

  return (
    <section
      className="py-10 px-4"
      style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`, borderBottom: `1px solid ${theme.colors.border}` }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((key) => {
          const badge = ALL_BADGES[key];
          if (!badge) return null;
          const Icon = badge.icon;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: theme.colors.primary + '15' }}>
                <Icon className="w-5 h-5" style={{ color: theme.colors.primary }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: theme.colors.text }}>{badge.label}</p>
                <p className="text-xs" style={{ color: theme.colors.textMuted }}>{badge.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
