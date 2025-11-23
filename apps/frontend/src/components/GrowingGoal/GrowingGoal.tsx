import styles from './GrowingGoal.module.css';

export type SampleDonation = {
  name: string;
  amount: number;
  profileImage?: string; // base64 image string
};

export type GrowingGoalProps = {
  title: string;
  description: string;
  total: number;
  goal: number;
  sampleDonation?: SampleDonation;
};

// example prop for sample donation??

export const GrowingGoal = (props: GrowingGoalProps) => {
  const { title, description, total, goal } = props;

  const progress = Math.floor((total / goal) * 360);
  // TO DO: add animated growth inside

  // gradient style for progress bar
  const gradientProgressStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '25.75rem',
    background: `conic-gradient(
    from 180deg at 50% 50%,
    #c6be3b 0deg,
    #863b27 90deg,
    #650d77 180deg,
    #0c7962 270deg,
    #c6be3b 360deg,
    transparent 180deg 360deg
  )`,
    mask: `conic-gradient(black 0deg ${progress}deg, transparent ${progress}deg 360deg)`,
  };

  // solid style for progress bar
  const solidProgressStyle = {
    width: '85%',
    height: '85%',
    borderRadius: '25.75rem',
    background: '#cecece',
  };

  return (
    <div className={styles['goal-container']}>
      <div className={styles['description-label']}>
        Grow your community with FCC!
      </div>
      <div className={styles['growth-container']}>
        <div className={styles['growth-container-solid']}>
          <div style={gradientProgressStyle}>
            <div style={solidProgressStyle}></div>
          </div>
        </div>
      </div>
      <div className={styles['total-donation-label']}>
        <span style={{ fontWeight: 700 }}>$31,336</span>{' '}
        <span style={{ fontSize: '1.25rem' }}>raised of</span> $50,000
      </div>
      {props.sampleDonation && (
        <div className={styles['sample-donor-label']}>
          <div
            className={styles['sample-donor-profile']}
            style={{
              background: !props.sampleDonation.profileImage
                ? '#cecece'
                : 'transparent',
            }}
          >
            {props.sampleDonation.profileImage && (
              <img
                alt="profile"
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                src={
                  props.sampleDonation.profileImage.startsWith('data:')
                    ? props.sampleDonation.profileImage
                    : `data:image/*;base64,${props.sampleDonation.profileImage}`
                }
              />
            )}
          </div>
          <div className={styles['sample-donor-amount']}>
            {props.sampleDonation.name} has donated $
            {props.sampleDonation.amount.toFixed(2)}!
          </div>
        </div>
      )}
    </div>
  );
};
