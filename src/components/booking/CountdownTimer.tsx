import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';

interface CountdownTimerProps {
  startTime: Date;
  endTime: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ startTime, endTime, onExpire }: CountdownTimerProps) {
  const { hours, minutes, seconds, isExpired } = useCountdownTimer({ startTime, endTime });

  useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
        <p className="text-sm font-medium">
          Payment window has expired. Please start a new booking.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-amber-600" />
        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Time Remaining to Complete Payment
        </h4>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {hours.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300">Seconds</div>
        </div>
      </div>
    </div>
  );
}