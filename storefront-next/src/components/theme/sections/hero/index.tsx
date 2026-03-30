import React from 'react';
import HeroCentered from './variants/centered';
import HeroSplit from './variants/split';

// Standard props passed from ThemeRenderer
export interface HeroProps {
  id: string;
  variant?: string;
  settings: Record<string, any>;
  blocks: {
    id: string;
    type: string;
    settings: Record<string, any>;
  }[];
  storeData?: any;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function HeroSectionResolver(props: HeroProps) {
  // If no variant is directly provided, default to centered
  const variant = props.variant || 'centered';

  switch (variant) {
    case 'split':
      return <HeroSplit {...props} />;
    case 'centered':
    default:
      return <HeroCentered {...props} />;
  }
}
