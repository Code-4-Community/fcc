import React from 'react';
import { TestimonialCarousel } from '../components/testimonials/TestimonialCarousel';

const Test: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Testimonial Carousel Test</h1>
      <TestimonialCarousel />
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      ></div>
    </div>
  );
};

export default Test;
