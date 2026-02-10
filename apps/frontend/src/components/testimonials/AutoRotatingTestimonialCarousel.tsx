import React, { useCallback, useEffect, useMemo, useState } from 'react';

export interface CarouselSlide {
  id: number | string;
  image: string;
  alt?: string;
  objectPosition?: string;
}

type Props = {
  slides: CarouselSlide[];
  animMs?: number;
  autoMs?: number;
};

const ArrowSvgRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="26"
    viewBox="0 0 16 26"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M9.58759 12.5054L0.0000983635 2.91793L2.91803 0L15.4235 12.5054L2.91803 25.0109L0.0000983635 22.0929L9.58759 12.5054Z"
      fill="#1D1B20"
    />
  </svg>
);

const CardSlot: React.FC<{
  slide: CarouselSlide;
  style: React.CSSProperties;
  animMs: number;
}> = ({ slide, style, animMs }) => {
  return (
    <div
      className="absolute top-1/2 left-1/2 overflow-hidden"
      style={{
        borderRadius: 10,
        backgroundColor: '#d3d3d3',
        backgroundImage: `url(${slide.image})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '102.5% 102%',
        backgroundPosition: '-2px -2px',
        transitionProperty: 'transform, opacity, box-shadow, width, height',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: `${animMs}ms`,
        willChange: 'transform, opacity',
        ...style,
      }}
      aria-label={slide.alt}
    />
  );
};

export const AutoRotatingTestimonialCarousel: React.FC<Props> = ({
  slides,
  animMs = 500,
  autoMs = 7000,
}) => {
  const len = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (len <= 1 || isAnimating) return;
      setIsAnimating(true);
      setActiveIndex(((next % len) + len) % len);
      window.setTimeout(() => setIsAnimating(false), animMs);
    },
    [animMs, isAnimating, len],
  );

  useEffect(() => {
    if (len <= 1) return;

    const t = window.setInterval(() => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActiveIndex((prev) => (prev - 1 + len) % len);
      window.setTimeout(() => setIsAnimating(false), animMs);
    }, autoMs);

    return () => window.clearInterval(t);
  }, [autoMs, animMs, isAnimating, len]);

  const slotStyles = useMemo(() => {
    const base = { width: 193.834, height: 193.833 };

    return {
      left: {
        ...base,
        opacity: 0.85,
        zIndex: 10,
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.25)',
        transform: `translate(-50%, -50%) translateX(-120px) scale(0.8)`,
      } as React.CSSProperties,
      center: {
        ...base,
        opacity: 1,
        zIndex: 30,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,0.50)',
        transform: `translate(-50%, -50%) translateX(0px) scale(1)`,
      } as React.CSSProperties,
      right: {
        ...base,
        opacity: 0.85,
        zIndex: 10,
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.25)',
        transform: `translate(-50%, -50%) translateX(120px) scale(0.8)`,
      } as React.CSSProperties,
    };
  }, []);

  if (!len) return null;

  const leftIndex = (activeIndex - 1 + len) % len;
  const centerIndex = activeIndex;
  const rightIndex = (activeIndex + 1) % len;

  const ArrowButton = ({
    direction,
    onClick,
  }: {
    direction: 'left' | 'right';
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      disabled={isAnimating}
      className="w-[40px] h-[40px] flex items-center justify-center rounded-full disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
      style={{
        borderRadius: '80px',
        background: '#EFEFEF',
        border: 'none',
      }}
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
    >
      <ArrowSvgRight className={direction === 'left' ? 'rotate-180' : ''} />
    </button>
  );

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[650px]">
        <div className="flex items-center justify-between gap-8 sm:gap-16">
          {/* Left arrow (previous) */}
          <ArrowButton direction="left" onClick={() => goTo(activeIndex + 1)} />

          {/* Overlapping stage */}
          <div
            className="relative"
            style={{
              width: 420,
              height: 220,
            }}
          >
            {slides.map((slide, index) => {
              const position = (index - activeIndex + len) % len;
              let style: React.CSSProperties;

              if (position === len - 1) {
                // Left position
                style = slotStyles.left;
              } else if (position === 0) {
                // Center position
                style = slotStyles.center;
              } else if (position === 1) {
                // Right position
                style = slotStyles.right;
              } else {
                // Hidden - off screen
                style = {
                  ...slotStyles.right,
                  opacity: 0,
                  transform: `translate(-50%, -50%) translateX(240px) scale(0.6)`,
                  pointerEvents: 'none',
                };
              }

              return (
                <CardSlot
                  key={slide.id}
                  slide={slide}
                  style={style}
                  animMs={animMs}
                />
              );
            })}
          </div>

          {/* Right arrow (next) */}
          <ArrowButton
            direction="right"
            onClick={() => goTo(activeIndex - 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default AutoRotatingTestimonialCarousel;
