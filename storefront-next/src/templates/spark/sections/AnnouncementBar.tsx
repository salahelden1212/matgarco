import type { ThemeData } from '@/types/theme';

interface Props {
  config: { text?: string; bgColor?: string; textColor?: string };
  theme: ThemeData;
}

export default function AnnouncementBar({ config, theme }: Props) {
  const bg   = config.bgColor   || theme.colors.primary;
  const text = config.textColor || '#FFFFFF';

  return (
    <div className="py-2 px-4 text-center text-sm font-medium" style={{ backgroundColor: bg, color: text }}>
      {config.text || '🎉 مرحباً بك في متجرنا!'}
    </div>
  );
}
