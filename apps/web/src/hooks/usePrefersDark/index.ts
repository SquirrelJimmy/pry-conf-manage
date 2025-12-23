import { useEffect, useState } from 'react';

export function usePrefersDark() {
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (ev?: MediaQueryListEvent) => {
      setPrefersDark(Boolean(ev ? ev.matches : media.matches));
    };

    update();

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return prefersDark;
}
