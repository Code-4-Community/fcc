import { GrowingGoal } from '@components/GrowingGoal/GrowingGoal';
import Plant from '@components/GrowingGoal/Plant';

const Root: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '2%' }}>
      <div style={{ width: '15rem' }}>
        <GrowingGoal
          message={'Grow your community with FCC!'}
          total={2000}
          goal={10000}
          sampleDonation={{
            name: 'John Smith',
            amount: 567.987,
          }}
        />
      </div>
      <div style={{ width: '20rem' }}>
        <GrowingGoal
          message={'Grow your community with FCC!'}
          total={4000}
          goal={10000}
          sampleDonation={{
            name: 'long username keeps going on and on and on and on and on and on jkfdjfkjdkfdjfjd',
            amount: 567.987,
          }}
        />
      </div>
      <div style={{ width: '25rem' }}>
        <GrowingGoal
          message={'Custom Message!'}
          total={8000}
          goal={10000}
          sampleDonation={{
            name: 'John Smith',
            amount: 567.987,
          }}
        />
      </div>
      <div style={{ width: '20rem' }}>
        <Plant />
      </div>
      <div style={{ width: '30rem' }}>
        <Plant />
      </div>
      <div style={{ width: '40rem' }}>
        <Plant />
      </div>
    </div>
  );
};

export default Root;
