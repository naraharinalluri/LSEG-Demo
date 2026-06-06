import { useEffect, useState } from 'react';
import type { WealthDriver } from '../driver/wealth-driver';
import type { WealthState } from '../types';

export function useWealthState(driver: WealthDriver): WealthState {
  const [state, setState] = useState(driver.getState());
  useEffect(() => {
    const unsub = driver.subscribe(setState);
    return () => {
      unsub();
    };
  }, [driver]);
  return state;
}
