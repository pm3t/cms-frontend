import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that measures a container's dimensions using ResizeObserver.
 * This is a workaround for Recharts ResponsiveContainer issues with React 19.
 * Starts with a default width of 500 so charts render immediately on first paint,
 * then updates to the actual container width via ResizeObserver.
 */
export function useChartSize(defaultHeight = 256) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(500); // Start with 500 so chart renders on first paint

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set the real width immediately after mount
    if (el.clientWidth > 0) {
      setWidth(el.clientWidth);
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 0) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width, height: defaultHeight };
}
