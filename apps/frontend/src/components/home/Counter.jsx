import { useState, useEffect, useRef } from 'react';

const Counter = ({ end, duration = 2000, prefix = "", suffix = "", decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef(null);

  useEffect(() => {
    const node = countRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutQuad easing
      const easeOutProgress = progress * (2 - progress);
      
      setCount(easeOutProgress * end);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration, isVisible]);

  // Format the number: commas for thousands, fixed decimals if needed
  const formattedCount = count.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span ref={countRef}>
      {prefix}{formattedCount}{suffix}
    </span>
  );
};

export default Counter;
