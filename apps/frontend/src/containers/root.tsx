import './root.css';

import React from 'react';
import {
  GrowingGoal,
  type SampleDonation,
} from '@components/GrowingGoal/GrowingGoal';
import { TestimonialCarousel } from '@components/testimonials/TestimonialCarousel';
import { DonationForm } from './donations/DonationForm';

const SAMPLE_DONATION: SampleDonation = {
  name: 'C4C',
  amount: 500,
  profile:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAALElEQVR42mNgGAWjgLGB4T8DGjBgFiMDw38GphCjEopFY1GNRg0Y1GgAAAD9YB5WfVii1AAAAABJRU5ErkJggg==',
};

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
          <TestimonialCarousel />
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
