import styles from './GrowingGoal.module.css';
import Plant from './Plant';

export type SampleDonation = {
  name: string;
  amount: number;
};

export type GrowingGoalProps = {
  message: string;
  total: number;
  goal: number;
  sampleDonation?: SampleDonation;
};

export const GrowingGoal = (props: GrowingGoalProps) => {
  const { message, total, goal } = props;
  const progress = Math.floor((total / goal) * 360);

  return (
    <div className={styles['goal-container']}>
      <div className={styles['description-label']}>{message}</div>
      <div className={styles['growth-container']}>
        <div className={styles['growth-container-solid-grey']}>
          <div
            className={styles['growth-container-gradient']}
            style={{
              mask: `conic-gradient(black 0deg ${progress}deg, transparent ${progress}deg 360deg)`,
            }}
          ></div>
          <Plant />
        </div>
      </div>
      <div className={styles['total-donation-label']}>
        ${total.toFixed(0)} <span style={{ fontSize: '4cqw' }}>raised of</span>{' '}
        ${goal.toFixed(0)}
      </div>
      <div className={styles['sample-donor-container']}>
        {props.sampleDonation && (
          <div className={styles['sample-donor-label']}>
            <div className={styles['sample-donor-amount']}>
              <b>
                {props.sampleDonation.name.length > 10
                  ? props.sampleDonation.name.slice(0, 10) + '...'
                  : props.sampleDonation.name}
              </b>
              {' donated $'}
              <b>{props.sampleDonation.amount.toFixed(2)}</b>!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};