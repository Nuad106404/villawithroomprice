import { useState, useEffect } from 'react';

const TIMER_KEY = 'booking_timer';
const PAYMENT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedEndTime = localStorage.getItem(TIMER_KEY);
    if (savedEndTime) {
      const remaining = parseInt(savedEndTime) - Date.now();
      return remaining > 0 ? remaining : 0;
    }
    return PAYMENT_WINDOW;
  });

  useEffect(() => {
    if (timeLeft === PAYMENT_WINDOW) {
      const endTime = Date.now() + PAYMENT_WINDOW;
      localStorage.setItem(TIMER_KEY, endTime.toString());
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        const newTime = Math.max(0, current - 1000);
        if (newTime === 0) {
          localStorage.removeItem(TIMER_KEY);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  return { hours, minutes, seconds, isExpired: timeLeft === 0 };
}