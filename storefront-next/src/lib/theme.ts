/**
 * Theme engine — converts ThemeData into CSS custom properties
 * injected into <html> so every component can use var(--color-primary) etc.
 */

import type { ThemeData } from '@/types/theme';

// Font size scale
const FONT_SCALE: Record<string, string> = {
  sm: '15px',
  md: '16px',
  lg: '17px',
};

/**
 * Build a <style> string of CSS variables from ThemeData.
 * Called server-side in layout.tsx to inject into <html>.
 */
export function buildCSSVariables(theme: ThemeData): string {
  const { colors, fonts, store } = theme;

  return `
    :root {
      --color-primary:     ${colors.primary};
      --color-secondary:   ${colors.secondary};
      --color-background:  ${colors.background};
      --color-surface:     ${colors.surface};
      --color-text:        ${colors.text};
      --color-text-muted:  ${colors.textMuted};
      --color-accent:      ${colors.accent};
      --color-border:      ${colors.border};

      --font-heading:      '${fonts.heading}', sans-serif;
      --font-body:         '${fonts.body}', sans-serif;
      --font-base-size:    ${FONT_SCALE[fonts.size] ?? '16px'};
    }

    html {
      font-size: var(--font-base-size);
      font-family: var(--font-body);
      background-color: ${colors.background};
      color: ${colors.text};
      direction: ${store.direction};
    }
  `.trim();
}

/**
 * Returns the Google Fonts URL for the heading + body fonts.
 * Deduplicates if heading === body.
 */
export function buildGoogleFontsURL(theme: ThemeData): string {
  const { heading, body } = theme.fonts;
  const families = [...new Set([heading, body])];
  const query = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;900`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

/**
 * Get a section config by id, or undefined if not found / disabled.
 */
export function getSection(theme: ThemeData, sectionId: string) {
  return theme.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
    .find((s) => s.id === sectionId);
}

/**
 * Get all enabled sections sorted by order.
 */
export function getEnabledSections(theme: ThemeData) {
  return theme.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}
