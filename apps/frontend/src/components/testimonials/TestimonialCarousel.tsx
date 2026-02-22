import React from 'react';
import AutoRotatingTestimonialCarousel, {
  CarouselSlide,
} from './AutoRotatingTestimonialCarousel';

export interface TestimonialCarouselProps {
  slides: CarouselSlide[];
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  slides,
}) => {
  return (
    <div className="w-full flex justify-center">
      <AutoRotatingTestimonialCarousel slides={slides} />
    </div>
  );
};

export default TestimonialCarousel;
