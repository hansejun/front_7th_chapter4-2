import { useCallback, useRef } from 'react';

export function useAutoCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback; // 렌더링마다 업데이트

  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}
