import React from 'react';
import './testimonials.css';
import AutoRotatingTestimonialCarousel, {
  CarouselSlide,
} from './AutoRotatingTestimonialCarousel';

export interface TestimonialCarouselProps {
  slides?: CarouselSlide[];
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  slides,
}) => {
  // If slides are provided (like in Step 4), show the image-based carousel
  if (slides && slides.length > 0) {
    return (
      <div className="w-full flex justify-center">
        <AutoRotatingTestimonialCarousel slides={slides} />
      </div>
    );
  }

  // Otherwise, show the default "Make a Difference" banner
  return (
    <div className="testimonial-carousel">
      <div className="testimonial-carousel__text">
        <h2 className="testimonial-carousel__title">Make a Difference</h2>
        <p className="testimonial-carousel__body">
          Read below for more about FCC and how your gift supports our small
          organization serving the entire Fenway community!
        </p>
        <a href="#contact" className="testimonial-carousel__link">
          Contact Us for any questions!
        </a>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
