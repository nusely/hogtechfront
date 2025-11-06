'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatTimeRemainingWithDays } from '@/lib/timeUtils';

interface CountdownTimerProps {
  endTime: string;
  className?: string;
  showDays?: boolean;
  variant?: 'default' | 'compact' | 'large';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endTime, 
  className = '',
  showDays = true,
  variant = 'default'
}) => {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemainingWithDays(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemainingWithDays(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const { days, hours, minutes, seconds, formatted } = timeRemaining;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Clock size={14} className="text-current" />
        <span className="text-xs font-semibold">
          {showDays && days > 0 ? `${days}d ` : ''}{hours}h {minutes}m {seconds}s
        </span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {showDays && days > 0 && (
          <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <span className="text-2xl font-bold text-white">{days.toString().padStart(2, '0')}</span>
            <span className="text-xs text-white/90">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-2xl font-bold text-white">{hours.toString().padStart(2, '0')}</span>
          <span className="text-xs text-white/90">Hours</span>
        </div>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-2xl font-bold text-white">{minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs text-white/90">Minutes</span>
        </div>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-2xl font-bold text-white">{seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs text-white/90">Seconds</span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 ${className}`}>
      <Clock size={16} className="text-current" />
      <div className="flex items-center gap-1 text-sm font-semibold">
        {showDays && days > 0 && (
          <>
            <span className="px-2 py-1 bg-white/30 rounded">{days.toString().padStart(2, '0')}</span>
            <span className="text-white/90">:</span>
          </>
        )}
        <span className="px-2 py-1 bg-white/30 rounded">{hours.toString().padStart(2, '0')}</span>
        <span className="text-white/90">:</span>
        <span className="px-2 py-1 bg-white/30 rounded">{minutes.toString().padStart(2, '0')}</span>
        <span className="text-white/90">:</span>
        <span className="px-2 py-1 bg-white/30 rounded">{seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};

