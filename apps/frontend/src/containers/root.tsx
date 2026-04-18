import './root.css';

import React from 'react';
import {
  GrowingGoal,
  type SampleDonation,
} from '@components/GrowingGoal/GrowingGoal';
import { TestimonialCarousel } from '@components/testimonials/TestimonialCarousel';
import { DonationForm } from './donations/DonationForm';
import { useActiveGoal } from '../hooks/useActiveGoal';

const SAMPLE_DONATION: SampleDonation = {
  name: 'C4C',
  amount: 500,
  profile:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAALElEQVR42mNgGAWjgLGB4T8DGjBgFiMDw38GphCjEopFY1GNRg0Y1GgAAAD9YB5WfVii1AAAAABJRU5ErkJggg==',
};

const Root: React.FC = () => {
  const { data } = useActiveGoal();
  // Falling back to 3000 if data is not available yet, but ideally we should wait or handle loading
  const donationTotal = data?.amountRaised ?? 3000;
  const targetGoal = data?.goal?.targetAmount ?? 10000;
  const label = data?.goal?.title || 'Grow your community with FCC';

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
              message={label}
              total={donationTotal}
              goal={targetGoal}
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
