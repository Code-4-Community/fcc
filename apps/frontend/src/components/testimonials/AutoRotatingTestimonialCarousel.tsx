import React, { useEffect, useState } from 'react';
import {
  TestimonialCarousel,
  TestimonialCarouselProps,
} from './TestimonialCarousel';

const SLIDES: TestimonialCarouselProps[] = [
  {
    title: 'Make a Difference',
    body: 'Read below for more about FCC and how your gift supports our small organization serving the entire Fenway community!',
    linkText: 'Contact Us for any questions!',
  },
  {
    title: 'Support the Arts',
    body: 'Your generosity helps us bring live performances, workshops, and community events to the Fenway neighborhood.',
    linkText: 'Learn how to get involved',
  },
  {
    title: 'Invest in Community',
    body: 'Every contribution—large or small—directly funds programs that connect neighbors, families, and local artists.',
    linkText: 'See where your gift goes',
  },
  {
    title: 'Join Our Mission',
    body: 'Partner with FCC to build a more vibrant, inclusive Fenway community through culture, creativity, and care.',
    linkText: 'Become a supporter today',
  },
];

export const AutoRotatingTestimonialCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);

  // auto-rotate every 7 seconds
  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 7000);

    return () => window.clearInterval(id);
  }, []);

  const currentSlide = SLIDES[index];

  return <TestimonialCarousel {...currentSlide} />;
};

export default AutoRotatingTestimonialCarousel;
