import { DonationSummary } from '@containers/donations/DonationSummary';
import { DonationForm } from './donations/DonationForm';

const Root: React.FC = () => {
  return (
    <>
      <DonationForm
        onSuccess={function (donationId: string): void {
          throw new Error('Function not implemented.');
        }}
        onError={function (error: Error): void {
          throw new Error('Function not implemented.');
        }}
      />
    </>
  );
};

export default Root;
