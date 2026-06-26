'use client';

import { useState, useEffect } from 'react';

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

const ZERO: CountdownValues = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isExpired: false,
};

function calcDiff(target: Date): CountdownValues {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isExpired: false,
  };
}

/** คำนวณบน client เท่านั้น — ป้องกัน hydration mismatch */
export function useCountdown(target: Date): CountdownValues {
  const [values, setValues] = useState<CountdownValues>(ZERO);

  useEffect(() => {
    function tick() {
      setValues(calcDiff(target));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return values;
}
