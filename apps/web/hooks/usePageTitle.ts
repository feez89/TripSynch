import { useEffect } from 'react';

/**
 * Sets the browser tab title for the current page.
 * Restores the previous title when the component unmounts.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — TripSync`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
