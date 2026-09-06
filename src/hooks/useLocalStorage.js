import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue, sanitizer) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return typeof sanitizer === 'function' ? sanitizer(initialValue) : initialValue;
      }
      const parsed = JSON.parse(item);
      return typeof sanitizer === 'function' ? sanitizer(parsed) : parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return typeof sanitizer === 'function' ? sanitizer(initialValue) : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
