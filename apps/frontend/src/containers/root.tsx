import { DonationSummary } from '@components/donations/DonationSummary';

const Root: React.FC = () => {
  return (
    <>
      <DonationSummary baseAmount={10.99} />
    </>
  );
};

export default Root;
