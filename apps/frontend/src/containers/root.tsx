import { DonationForm } from './donations/DonationForm';

const Root: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '5%',
      }}
    >
      <div style={{ width: '10%' }}>
        <DonationForm
          onSuccess={function (donationId: string): void {
            throw new Error('Function not implemented.');
          }}
          onError={function (error: Error): void {
            throw new Error('Function not implemented.');
          }}
        />
      </div>
      <div style={{ width: '20%' }}>
        <DonationForm
          onSuccess={function (donationId: string): void {
            throw new Error('Function not implemented.');
          }}
          onError={function (error: Error): void {
            throw new Error('Function not implemented.');
          }}
        />
      </div>
      <div style={{ width: '30%' }}>
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
