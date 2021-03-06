import { useState, useEffect, useRef } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

export const useResizeObserver = () => {
  const ref = useRef();
  const [width, changeWidth] = useState(1);
  const [height, changeHeight] = useState(1);

  useEffect(() => {
    const element = ref.current;
    const resizeObserver = new ResizeObserver(entries => {
      if (!Array.isArray(entries)) {
        return;
      }
      if (!entries.length) {
        return;
      }
      const entry = entries[0];

      changeWidth(entry.contentRect.width);
      changeHeight(entry.contentRect.height);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.unobserve(element);
  }, []);

  return [ref, width, height];
};

export default useResizeObserver;
