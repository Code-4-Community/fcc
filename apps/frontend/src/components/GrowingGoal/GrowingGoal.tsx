import { useEffect, useRef, useState } from 'react';
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
  const growthContainerRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(0);
  const [endHandle, setEndHandle] = useState({
    top: 0,
    left: 0,
  });
  const progress = Math.floor((total / goal) * 360);

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
    <div className={styles['goal-container']}>
      <div className={styles['description-label']}>{message}</div>
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
