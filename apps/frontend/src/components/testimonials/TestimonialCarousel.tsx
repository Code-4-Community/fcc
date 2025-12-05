import React from 'react';
import './testimonials.css';

export interface TestimonialCarouselProps {
  title?: string;
  body?: string;
  linkText?: string;
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  title = 'Make a Difference',
  body = 'Read below for more about FCC and how your gift supports our small organization serving the entire Fenway community!',
  linkText = 'Contact Us for any questions!',
}) => {
  return (
    <div className="testimonial-carousel">
      <div className="testimonial-carousel__text">
        <h2 className="testimonial-carousel__title">{title}</h2>

        <p className="testimonial-carousel__body">{body}</p>

        <a href="#contact" className="testimonial-carousel__link">
          {linkText}
        </a>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
