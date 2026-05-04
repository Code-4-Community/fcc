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
import './containers/root.css';
import './styles.css';

const SAMPLE_DONATION: SampleDonation = {
  name: 'C4C',
  amount: 500,
  profile:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAALElEQVR42mNgGAWjgLGB4T8DGjBgFiMDw38GphCjEopFY1GNRg0Y1GgAAAD9YB5WfVii1AAAAABJRU5ErkJggg==',
};

const EmbedApp: React.FC = () => {
  const { data } = useActiveGoal();
  const donationTotal = data?.amountRaised ?? 3000;
  const targetGoal = data?.goal?.targetAmount ?? 10000;
  const label = data?.goal?.title || 'Grow your community with FCC';

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
              onSuccess={(id) => console.log('[FCC Donation] Submitted:', id)}
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
