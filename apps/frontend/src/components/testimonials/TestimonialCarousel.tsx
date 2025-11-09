import React, { useState, useEffect, useRef } from 'react';
import './testimonials.css';

export interface Testimonial {
  text: string;
  author?: string;
}

interface TestimonialCarouselProps {
  testimonials?: Testimonial[];
  rotationInterval?: number; // in milliseconds, default 5500
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    text: "The FCC provides so many great services, I'm glad I can contribute!",
    author: 'Anonymous Donor',
  },
  {
    text: 'Supporting the FCC means supporting our entire community. Every donation makes a real difference.',
    author: 'Sarah M.',
  },
  {
    text: 'I have seen firsthand the impact of FCC programs. Proud to be a recurring donor!',
    author: 'James K.',
  },
  {
    text: 'The work FCC does is invaluable. It is an honor to give back to an organization that gives so much.',
  },
];

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials = DEFAULT_TESTIMONIALS,
  rotationInterval = 5500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeState, setFadeState] = useState<'fade-in' | 'fade-out'>('fade-in');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTestimonials =
    testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;

  useEffect(() => {
    if (isPaused || activeTestimonials.length <= 1) {
      return;
    }

    const rotate = () => {
      setFadeState('fade-out');

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activeTestimonials.length);
        setFadeState('fade-in');
      }, 300);
    };

    timeoutRef.current = setTimeout(rotate, rotationInterval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isPaused, activeTestimonials.length, rotationInterval]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const currentTestimonial = activeTestimonials[currentIndex];

  return (
    <div
      className="testimonial-carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Donor testimonials"
      aria-live="polite"
    >
      <div className={`testimonial-content ${fadeState}`}>
        <div className="quote-icon" aria-hidden="true">
          "
        </div>
        <blockquote className="testimonial-text">
          {currentTestimonial.text}
        </blockquote>
        {currentTestimonial.author && (
          <cite className="testimonial-author">
            – {currentTestimonial.author}
          </cite>
        )}
        <div className="quote-icon quote-icon-end" aria-hidden="true">
          "
        </div>
      </div>
      {activeTestimonials.length > 1 && (
        <div
          className="carousel-indicators"
          role="tablist"
          aria-label="Testimonial indicators"
        >
          {activeTestimonials.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setFadeState('fade-out');
                setTimeout(() => {
                  setCurrentIndex(index);
                  setFadeState('fade-in');
                }, 300);
              }}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`View testimonial ${index + 1} of ${activeTestimonials.length}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
