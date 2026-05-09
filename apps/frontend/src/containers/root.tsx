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

const Root: React.FC = () => {
  const { data, refresh: refreshGoal } = useActiveGoal();
  const [donorCycles, setDonorCycles] = React.useState<SampleDonation[]>([]);

  const fetchDonors = React.useCallback(async () => {
    try {
      // Fetch latest succeeded donations for the donor cycles
      const response = await apiClient.getPublicDonations({
        limit: 10,
      });

      if (response && response.length > 0) {
        // The API already handles anonymity and mapping in the public endpoint if needed,
        // but we ensure it matches the SampleDonation interface:
        const cycles = response.map((d) => ({
          name: d.donorName || (d.isAnonymous ? 'Anonymous' : 'Anonymous'),
          amount: d.amount,
          profile: '', // No profile picture needed
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
