import { DonationForm } from './donations/DonationForm';
import { GrowingGoal } from '@components/GrowingGoal/GrowingGoal';

const Root: React.FC = () => {
  const base64Profile =
    'data:image/jpeg;base64,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';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '5%',
      }}
    >
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
      <div style={{ display: 'flex', flexDirection: 'row', gap: '4%' }}>
        <div style={{ width: '40%' }}>
          <GrowingGoal
            message={'Donate to FCC!'}
            total={3000}
            goal={10000}
            sampleDonation={{
              name: 'C4C',
              amount: 500,
              profile: base64Profile,
            }}
          />
        </div>
        <div style={{ width: '40%' }}>
          <GrowingGoal
            message={'Donate to FCC!'}
            total={3000}
            goal={10000}
            sampleDonation={{ name: 'C4C', amount: 500 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Root;
