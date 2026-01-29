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
  className="relative overflow-hidden transition-all ease-in-out flex-shrink-0"
  style={{
    width: isCenter ? '193.834px' : '150.065px',
    height: isCenter ? '193.833px' : '150.065px',
    borderRadius: '10px',
    background: `url(${slide.image}) lightgray -2.207px -1.667px / 102.451% 101.732% no-repeat`,
    boxShadow: isCenter
      ? '0 4px 10px 0 rgba(0, 0, 0, 0.50)'
      : '0 4px 8px 0 rgba(0, 0, 0, 0.25)',
    transitionDuration: `${animMs}ms`,
    zIndex: isCenter ? 30 : 10,
    
  }}
/>
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
        {/* Flex container with centered items */}
        <div className="flex items-center justify-between gap-8 sm:gap-16">
          {/* Left arrow */}
          <ArrowButton
            direction="left"
            onClick={() => goTo(activeIndex + 1)}
          />

          {/* Center carousel */}
          <div className="flex items-center justify-center">
            <div className="flex flex-row items-center justify-center gap-20 px-6 sm:px-10">
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

          {/* Right arrow */}
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