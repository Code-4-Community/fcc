import './root.css';

import React from 'react';
import {
  GrowingGoal,
  type SampleDonation,
} from '@components/GrowingGoal/GrowingGoal';
import { TestimonialCarousel } from '@components/testimonials/TestimonialCarousel';
import { DonationForm } from './donations/DonationForm';
import CarouselImage1 from '@components/testimonials/TestimonialImages/Carousel_image1.png';
import CarouselImage2 from '@components/testimonials/TestimonialImages/Carousel_image2.png';
import CarouselImage3 from '@components/testimonials/TestimonialImages/Carousel_image3.png';
import ShareOptions from './donations/ShareOptions';

const SAMPLE_DONATION: SampleDonation = {
  name: 'C4C',
  amount: 500,
  profile:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAALElEQVR42mNgGAWjgLGB4T8DGjBgFiMDw38GphCjEopFY1GNRg0Y1GgAAAD9YB5WfVii1AAAAABJRU5ErkJggg==',
};

const TESTIMONIAL_SLIDES = [
  {
    id: 1,
    image: CarouselImage1,
    alt: 'Testimonial image 1',
  },
  {
    id: 2,
    image: CarouselImage2,
    alt: 'Testimonial image 2',
  },
  {
    id: 3,
    image: CarouselImage3,
    alt: 'Testimonial image 3',
  },
];

const Root: React.FC = () => {
  const donationTotal = 3000;

  const handleDonationSuccess = (donationId: string) => {
    console.info(`Donation submitted: ${donationId}`);
  };

  const handleDonationError = (error: Error) => {
    console.error('Donation failed', error);
  };

  return (
    <div className="root-page">
      <div className="root-container">
        <section className="root-testimonial">
          <TestimonialCarousel slides={TESTIMONIAL_SLIDES} />
          <ShareOptions />
        </section>
        <section className="root-content-grid">
          <div className="root-goal-panel">
            <GrowingGoal
              message="Donate to FCC!"
              total={donationTotal}
              goal={10000}
              sampleDonation={SAMPLE_DONATION}
            />
          </div>
          <div className="root-form-panel">
            <DonationForm
              onSuccess={handleDonationSuccess}
              onError={handleDonationError}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Root;
