import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { DonationForm } from './containers/donations/DonationForm';
import {
  GrowingGoal,
  type SampleDonation,
} from '@components/GrowingGoal/GrowingGoal';
import { TestimonialCarousel } from '@components/testimonials/TestimonialCarousel';
import { useActiveGoal } from './hooks/useActiveGoal';
import apiClient from './api/apiClient';
import './containers/root.css';
import './styles.css';

const EmbedApp: React.FC = () => {
  const { data, refresh: refreshGoal } = useActiveGoal();
  const [donorCycles, setDonorCycles] = React.useState<SampleDonation[]>([]);

  const fetchDonors = React.useCallback(async () => {
    try {
      const response = await apiClient.getPublicDonations({ limit: 10 });
      if (response && response.length > 0) {
        const cycles = response.map((d) => ({
          name: d.donorName || 'Anonymous',
          amount: d.amount,
          profile: '',
        }));
        setDonorCycles(cycles);
      }
    } catch (e) {
      console.error('[FCC Donation] Failed to fetch donor cycles', e);
    }
  }, []);

  React.useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const donationTotal = data?.amountRaised ?? 3000;
  const targetGoal = data?.goal?.targetAmount ?? 10000;
  const label = data?.goal?.title || 'Grow your community with FCC';

  const handleDonationSuccess = async (donationId: string) => {
    console.info('[FCC Donation] Submitted:', donationId);
    await Promise.all([refreshGoal(), fetchDonors()]);
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
              onError={(err) => console.error('[FCC Donation] Error:', err)}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const mountId = 'fcc-donation-embed';
const container = document.getElementById(mountId);

if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <MemoryRouter>
        <EmbedApp />
      </MemoryRouter>
    </React.StrictMode>,
  );
} else {
  console.warn(`[FCC Donation] Mount element #${mountId} not found.`);
}
