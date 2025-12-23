import { useCallback, useRef } from 'react';

export function useAutoCallback<Args extends unknown[], Return>(
  callback: (...args: Args) => Return
): (...args: Args) => Return {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Args) => callbackRef.current(...args), []) as (
    ...args: Args
  ) => Return;
}
