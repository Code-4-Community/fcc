import { GrowingGoal } from '@components/GrowingGoal/GrowingGoal';
import Plant from '@components/GrowingGoal/Plant';

const Root: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '2%' }}>
      <div style={{ width: '400rem' }}>
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
      <div style={{ width: '400rem' }}>
        <GrowingGoal
          message={'Grow your community with FCC!'}
          total={4000}
          goal={10000}
          sampleDonation={{
            name: 'John Smith',
            amount: 567.987,
          }}
        />
      </div>
      <div style={{ width: '400rem' }}>
        <GrowingGoal
          message={'Grow your community with FCC!'}
          total={6000}
          goal={10000}
          sampleDonation={{
            name: 'John Smith',
            amount: 567.987,
          }}
        />
      </div>
      <div style={{ width: '400rem' }}>
        <GrowingGoal
          message={'Grow your community with FCC!'}
          total={8000}
          goal={10000}
          sampleDonation={{
            name: 'John Smith',
            amount: 567.987,
          }}
        />
      </div>
      <div style={{ width: '400rem' }}>
        <GrowingGoal
          message={'Grow your community with FCC!'}
          total={10000}
          goal={10000}
          sampleDonation={{
            name: 'John Smith',
            amount: 567.987,
          }}
        />
      </div>
    </div>
  );
};

export default Root;
