import { useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'lagrer' | 'lagret' | 'feil' | 'inaktiv';

export function useAutosave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  delay: number = 2000
) {
  const [status, setStatus] = useState<AutosaveStatus>('inaktiv');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>('');
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      previousDataRef.current = JSON.stringify(data);
      return;
    }

    const currentData = JSON.stringify(data);

    if (currentData === previousDataRef.current) {
      return;
    }

    previousDataRef.current = currentData;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus('lagrer');

    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFn(data);
        setStatus('lagret');
        setTimeout(() => setStatus('inaktiv'), 2000);
      } catch (error) {
        console.error('Autosave error:', error);
        setStatus('feil');
        setTimeout(() => setStatus('inaktiv'), 3000);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay]);

  return { status };
}
