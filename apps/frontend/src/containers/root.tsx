import './root.css';

import React from 'react';
import {
  GrowingGoal,
  type SampleDonation,
} from '@components/GrowingGoal/GrowingGoal';
import { TestimonialCarousel } from '@components/testimonials/TestimonialCarousel';
import { DonationForm } from './donations/DonationForm';
import { useActiveGoal } from '../hooks/useActiveGoal';
import apiClient from '../api/apiClient';

const SAMPLE_DONATION: SampleDonation = {
  name: 'C4C',
  amount: 500,
  profile:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAALElEQVR42mNgGAWjgLGB4T8DGjBgFiMDw38GphCjEopFY1GNRg0Y1GgAAAD9YB5WfVii1AAAAABJRU5ErkJggg==',
};

const Root: React.FC = () => {
  const { data, refresh: refreshGoal } = useActiveGoal();
  const [donorCycles, setDonorCycles] = React.useState<SampleDonation[]>([]);

  const fetchDonors = React.useCallback(async () => {
    try {
      // Fetch latest succeeded donations for the donor cycles
      const response = await apiClient.getDonations({
        perPage: 10,
        status: 'succeeded',
        page: 1,
      });

      if (response.rows && response.rows.length > 0) {
        // The API (DonationsRepository) already returns them ordered by DESC (latest first)
        const cycles = response.rows.map((d) => ({
          name: d.isAnonymous ? 'Anonymous' : d.firstName,
          amount: d.amount,
          profile: '', // No profile picture needed..
        }));
        setDonorCycles(cycles);
      }
    } catch (e) {
      console.error('Failed to fetch donor cycles', e);
    }
  }, []);

  React.useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // Falling back to 3000 if data is not available yet, but ideally we should wait or handle loading
  const donationTotal = data?.amountRaised ?? 3000;
  const targetGoal = data?.goal?.targetAmount ?? 10000;
  const label = data?.goal?.title || 'Grow your community with FCC';

  const handleDonationSuccess = async (donationId: string) => {
    console.info(`Donation submitted: ${donationId}`);
    // Refresh the goal and the donor cycle list immediately
    await Promise.all([refreshGoal(), fetchDonors()]);
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
              donorCycles={donorCycles}
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
