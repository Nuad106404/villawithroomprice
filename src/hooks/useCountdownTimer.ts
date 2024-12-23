import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  startTime: Date;
  endTime: Date;
}

export function useCountdownTimer({ startTime, endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const remaining = new Date(endTime).getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((current) => {
        const newTime = Math.max(0, new Date(endTime).getTime() - Date.now());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  return { hours, minutes, seconds, isExpired: timeLeft === 0 };
}