'use client';

import { useEffect } from 'react';

export function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const delay = (i % 3) * 120;
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
          }
        });
      },
      { threshold: 0.15 },
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
