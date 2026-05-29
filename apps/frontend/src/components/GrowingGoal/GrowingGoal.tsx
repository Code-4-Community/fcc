import { useEffect, useRef, useState } from 'react';
import styles from './GrowingGoal.module.css';
import Plant from './Plant';
import { Pencil } from 'lucide-react';
import { Button } from '../ui/button';

export type SampleDonation = {
  name: string;
  amount: number;
  profile?: string; //base64 string
};

export type GrowingGoalProps = {
  message: string;
  total: number;
  goal: number;
  sampleDonation?: SampleDonation;
  donorCycles?: SampleDonation[];
  variant?: 'default' | 'admin';
  subMessage?: string;
  onEdit?: () => void;
  fillHeight?: boolean;
};

export const GrowingGoal = (props: GrowingGoalProps) => {
  const {
    message,
    total,
    goal,
    variant = 'default',
    subMessage,
    onEdit,
    donorCycles,
    fillHeight = false,
  } = props;
  const growthContainerRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(0);
  const [endHandle, setEndHandle] = useState({
    top: 0,
    left: 0,
  });
  const [currentDonorIndex, setCurrentDonorIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // When donorCycles changes (e.g., after a new donation), reset the cycle to the latest donor
  useEffect(() => {
    setCurrentDonorIndex(0);
  }, [donorCycles]);

  const displayDonor =
    donorCycles && donorCycles.length > 0
      ? donorCycles[currentDonorIndex]
      : props.sampleDonation;

  useEffect(() => {
    if (donorCycles && donorCycles.length > 1) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentDonorIndex((prev) => (prev + 1) % donorCycles.length);
          setIsAnimating(false);
        }, 500); // Wait for fade out
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [donorCycles]);

  const progress = goal > 0 ? Math.floor((total / goal) * 360) : 0;
  const percentage = goal > 0 ? Math.round((total / goal) * 100) : 0;

  // calculate gradient color of growth container handles
  const getGradientColor = (degree: number): string => {
    const gradientAngle = (degree + 180) % 360;

    const stops = [
      { angle: 0, color: { r: 198, g: 190, b: 59 } },
      { angle: 90, color: { r: 134, g: 59, b: 39 } },
      { angle: 180, color: { r: 101, g: 13, b: 119 } },
      { angle: 270, color: { r: 12, g: 121, b: 98 } },
      { angle: 360, color: { r: 198, g: 190, b: 59 } },
    ];

    let startStop = stops[stops.length - 1];
    let endStop = stops[0];

    for (let i = 0; i < stops.length - 1; i++) {
      if (
        gradientAngle >= stops[i].angle &&
        gradientAngle <= stops[i + 1].angle
      ) {
        startStop = stops[i];
        endStop = stops[i + 1];
        break;
      }
    }
    const range = endStop.angle - startStop.angle;
    const factor = (gradientAngle - startStop.angle) / range;
    const r = Math.round(
      startStop.color.r + (endStop.color.r - startStop.color.r) * factor,
    );
    const g = Math.round(
      startStop.color.g + (endStop.color.g - startStop.color.g) * factor,
    );
    const b = Math.round(
      startStop.color.b + (endStop.color.b - startStop.color.b) * factor,
    );

    return `rgb(${r}, ${g}, ${b})`;
  };

  // calculate growth container end handle position
  useEffect(() => {
    if (growthContainerRef.current) {
      setRadius(growthContainerRef.current.offsetWidth / 2);
      const handleSize = radius * 0.05;
      const progressRadians = ((90 - progress) * Math.PI) / 180;
      const topOffset = (radius - handleSize) * Math.sin(progressRadians);
      const leftOffset = (radius - handleSize) * Math.cos(progressRadians);

      const top = radius - topOffset - handleSize;
      const left = radius + leftOffset - handleSize;

      setEndHandle({
        top: top,
        left: left,
      });
    }
  }, [growthContainerRef, progress, radius]);

  const startHandleStyle: React.CSSProperties = {
    top: '0%',
    left: `47.5%`,
  };

  const endHandleStyle: React.CSSProperties = {
    top: `${endHandle.top}px`,
    left: `${endHandle.left}px`,
  };

  return (
    <div
      className={styles['goal-container']}
      style={{
        background: '#FCFCFC',
        ...(fillHeight
          ? { height: '100%', aspectRatio: 'auto' }
          : { aspectRatio: variant === 'admin' ? '7 / 9' : '7 / 10' }),
      }}
    >
      <div
        className={styles['description-label']}
        style={
          variant === 'admin'
            ? {
                backgroundColor: '#FCFCFC',
                color: '#000',
                borderBottom: '1px solid #E5E5E5',
                height: 'auto',
                padding: '4% 4%',
                alignItems: 'flex-start',
                textAlign: 'left',
                position: 'relative',
              }
            : {}
        }
      >
        <span style={variant === 'admin' ? { fontWeight: 600 } : {}}>
          {message}
        </span>
        {subMessage && (
          <span
            style={{
              fontSize: '3.5cqw',
              color: variant === 'admin' ? '#666' : '#FFFFFF',
              fontWeight: 400,
              display: 'block',
            }}
          >
            {subMessage}
          </span>
        )}

        {variant === 'admin' && onEdit && (
          <Button
            onClick={onEdit}
            variant="outline"
            className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 border-[#E5E5E5] bg-white px-3 py-1 shadow-sm hover:bg-neutral-50"
          >
            <Pencil size={14} className="text-[#404040]" />
            <span className="text-[14px] font-normal leading-6 text-black">
              Edit
            </span>
          </Button>
        )}
      </div>

      <div className={styles['growth-container']}>
        <div
          ref={growthContainerRef}
          className={styles['growth-container-solid-grey']}
        >
          <div
            className={styles['growth-container-gradient']}
            style={{
              mask: `conic-gradient(black 0deg ${progress}deg, transparent ${progress}deg 360deg)`,
            }}
          ></div>

          <Plant />

          <div
            style={{ ...startHandleStyle, backgroundColor: '#650d77' }}
            className={styles['progress-bar-handle']}
          ></div>

          <div
            style={{
              ...endHandleStyle,
              backgroundColor: getGradientColor(progress),
            }}
            className={styles['progress-bar-handle']}
          ></div>
        </div>
      </div>
      <div className={styles['total-donation-label']}>
        <div style={{ marginBottom: variant === 'admin' ? '2%' : '0' }}>
          <span style={{ fontWeight: '700' }}>${total.toLocaleString()}</span>{' '}
          <span style={{ fontSize: '4cqw' }}>raised of</span> $
          {goal.toLocaleString()}
        </div>
        {variant === 'admin' && (
          <div
            style={{
              display: 'inline-flex',
              padding: '2% 6%',
              backgroundColor: '#F2F2F2',
              borderRadius: '999px',
              fontSize: '3.5cqw',
              color: '#000',
              fontWeight: 400,
              marginTop: '2%',
              fontFamily: "'Source Sans Pro', sans-serif",
            }}
          >
            {percentage}% complete
          </div>
        )}
      </div>
      <div className={styles['sample-donor-container']}>
        {displayDonor && (
          <div
            className={`${styles['sample-donor-label']} ${
              isAnimating ? styles['fade-out'] : styles['fade-in']
            }`}
          >
            {displayDonor.profile ? (
              <div
                style={{
                  backgroundImage: `url("${displayDonor.profile}")`,
                  backgroundSize: 'cover',
                }}
                className={styles['sample-donor-profile']}
              ></div>
            ) : (
              <div className={styles['sample-donor-profile']}></div>
            )}

            <div className={styles['sample-donor-amount']}>
              <b>
                {displayDonor.name.length > 8
                  ? displayDonor.name.slice(0, 8) + '...'
                  : displayDonor.name}
              </b>
              {' donated $'}
              <b>{displayDonor.amount.toFixed(2)}</b>!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
