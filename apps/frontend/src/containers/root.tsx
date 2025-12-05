import { DonationForm } from "./donations/DonationForm";

const Root: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '50%' }}>
        <DonationForm
          onSuccess={function (donationId: string): void {
            throw new Error('Function not implemented.');
          }}
          onError={function (error: Error): void {
            throw new Error('Function not implemented.');
          }}
        />
      </div>
    </div>
  );
};

export default Root;
