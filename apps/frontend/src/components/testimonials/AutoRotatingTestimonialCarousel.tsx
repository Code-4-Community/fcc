import React, { useEffect, useState, useCallback } from 'react';

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
      setActiveIndex((prev) => {
        if (isAnimating) return prev;
        setIsAnimating(true);
        window.setTimeout(() => setIsAnimating(false), animMs);
        return (prev + 1) % len;
      });
    }, autoMs);

    return () => window.clearInterval(t);
  }, [autoMs, animMs, isAnimating, len]);

  if (!len) return null;

  const leftIndex = (activeIndex - 1 + len) % len;
  const centerIndex = activeIndex;
  const rightIndex = (activeIndex + 1) % len;

  const Card = ({
    slide,
    position,
  }: {
    slide: CarouselSlide;
    position: 'left' | 'center' | 'right';
  }) => {
    const isCenter = position === 'center';

    return (
      <div
        className="relative rounded-[10px] overflow-hidden transition-all ease-in-out flex-shrink-0"
        style={{
          width: isCenter ? '193.834px' : '150.065px',
          height: isCenter ? '193.833px' : '150.065px',
          boxShadow: isCenter
            ? '0 4px 10px 0 rgba(0, 0, 0, 0.50)'
            : '0 4px 8px 0 rgba(0, 0, 0, 0.25)',
          transitionDuration: `${animMs}ms`,
          zIndex: isCenter ? 30 : 20,
        }}
      >
        <img
          src={slide.image}
          alt={slide.alt ?? ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: slide.objectPosition || 'center center',
          }}
          draggable={false}
        />
      </div>
    );
  };

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
      className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-gray-200"
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
    >
      {/* Right arrow SVG; rotate ONLY for left */}
      <ArrowSvgRight className={direction === 'left' ? 'rotate-180' : ''} />
    </button>
  );

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[900px]">
        {/* Make a "row" with a fixed min height so arrows can center against it */}
        <div
          className="grid grid-cols-[auto,1fr,auto] gap-4"
          style={{ minHeight: '240px' }}
        >
          {/* Left arrow column: fill height + center */}
          <div className="h-full flex items-center justify-start">
            <ArrowButton
              direction="left"
              onClick={() => goTo(activeIndex - 1)}
            />
          </div>

          {/* Center carousel column */}
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-row items-center justify-center gap-4 px-6 sm:px-10">
              {len === 1 ? (
                <Card
                  slide={slides[centerIndex]}
                  position="center"
                  key={`center-${centerIndex}`}
                />
              ) : len === 2 ? (
                <>
                  <Card
                    slide={slides[leftIndex]}
                    position="left"
                    key={`left-${leftIndex}`}
                  />
                  <Card
                    slide={slides[centerIndex]}
                    position="center"
                    key={`center-${centerIndex}`}
                  />
                </>
              ) : (
                <>
                  <Card
                    slide={slides[leftIndex]}
                    position="left"
                    key={`left-${leftIndex}`}
                  />
                  <Card
                    slide={slides[centerIndex]}
                    position="center"
                    key={`center-${centerIndex}`}
                  />
                  <Card
                    slide={slides[rightIndex]}
                    position="right"
                    key={`right-${rightIndex}`}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right arrow column: fill height + center */}
          <div className="h-full flex items-center justify-end">
            <ArrowButton
              direction="right"
              onClick={() => goTo(activeIndex + 1)}
            />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            disabled={isAnimating}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'bg-teal-600 w-8'
                : 'bg-gray-300 hover:bg-gray-400 w-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AutoRotatingTestimonialCarousel;
