import { useState, useEffect } from 'react';
import { getClasses, getGrades, getSubjects, getTopics } from '@/data/cbseCurriculum';

export const useCurriculum = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return {
    isLoading,
    classes: getClasses(),
    getGrades,
    getSubjects,
    getTopics,
  };
};
