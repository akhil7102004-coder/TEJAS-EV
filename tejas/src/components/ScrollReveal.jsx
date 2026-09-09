import React, { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 700, 
  yOffset = 25,
  xOffset = 0,
  threshold = 0.05
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px' // triggers slightly before/as it enters the viewport
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible 
      ? 'translate(0, 0)' 
      : `translate(${xOffset}px, ${yOffset}px)`,
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
