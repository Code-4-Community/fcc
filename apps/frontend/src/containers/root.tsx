import { GrowingGoal } from '@components/GrowingGoal/GrowingGoal';

const Root: React.FC = () => {
  return (
    <GrowingGoal
      title={'title'}
      description={'description'}
      total={8000}
      goal={10000}
      sampleDonation={{
        name: 'John Smith',
        amount: 567.987,
      }}
    />
  );
};

export default Root;
