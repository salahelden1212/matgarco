'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Client component that intercepts all anchor clicks while in preview mode
 * and appends ?preview=1 so the draft theme is loaded on every navigation.
 * Place this once inside the store layout.
 */
export default function PreviewLinkInterceptor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPreview = searchParams.get('preview') === '1';

  useEffect(() => {
    if (!isPreview) return;

    const handler = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, anchors, mailto, tel, javascript
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      // Already has preview param — let it go through normally
      if (href.includes('preview=1')) return;

      e.preventDefault();
      e.stopPropagation();

      const separator = href.includes('?') ? '&' : '?';
      router.push(`${href}${separator}preview=1`);
    };

    // Use capture phase to intercept before Next.js Link handler
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [isPreview, router]);

  return null;
}
