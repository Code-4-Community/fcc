import React from 'react';
import { AutoRotatingTestimonialCarousel } from '../components/testimonials/AutoRotatingTestimonialCarousel';

const Test: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Testimonial Carousel Test</h1>

      <AutoRotatingTestimonialCarousel />

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default Test;
