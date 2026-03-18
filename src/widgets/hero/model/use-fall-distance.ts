import { useEffect, useState } from 'react';

export const useFallDistance = () => {
  const [fallDistance, setFallDistance] = useState(1000);

  useEffect(() => {
    const updateFallDistance = () => {
      setFallDistance(Math.max(window.innerHeight * 1.15, 920));
    };

    updateFallDistance();
    window.addEventListener('resize', updateFallDistance);

    return () => window.removeEventListener('resize', updateFallDistance);
  }, []);

  return fallDistance;
};
