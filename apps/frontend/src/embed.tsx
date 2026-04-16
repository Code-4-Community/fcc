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
import CarouselImage1 from '@components/testimonials/TestimonialImages/Carousel_image1.png';
import CarouselImage2 from '@components/testimonials/TestimonialImages/Carousel_image2.png';
import CarouselImage3 from '@components/testimonials/TestimonialImages/Carousel_image3.png';
import './containers/root.css';
import './styles.css';

const SAMPLE_DONATION: SampleDonation = {
  name: 'C4C',
  amount: 500,
  profile:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAALElEQVR42mNgGAWjgLGB4T8DGjBgFiMDw38GphCjEopFY1GNRg0Y1GgAAAD9YB5WfVii1AAAAABJRU5ErkJggg==',
};

const TESTIMONIAL_SLIDES = [
  { id: 1, image: CarouselImage1, alt: 'Testimonial image 1' },
  { id: 2, image: CarouselImage2, alt: 'Testimonial image 2' },
  { id: 3, image: CarouselImage3, alt: 'Testimonial image 3' },
];

const EmbedApp: React.FC = () => {
  const { data } = useActiveGoal();
  const donationTotal = data?.amountRaised ?? 3000;
  const targetGoal = data?.goal?.targetAmount ?? 10000;
  const label = data?.goal?.title || 'Grow your community with FCC';

  return (
    <div className="root-page">
      <div className="root-container">
        <section className="root-testimonial">
          <TestimonialCarousel slides={TESTIMONIAL_SLIDES} />
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
