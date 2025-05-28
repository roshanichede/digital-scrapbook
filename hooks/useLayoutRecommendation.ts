// hooks/useLayoutRecommendation.ts
import { useState, useCallback } from 'react';
import { LayoutType, LayoutAnalysis } from '@/lib/layoutAI';

interface UseLayoutRecommendationReturn {
  recommendation: LayoutAnalysis | null;
  isLoading: boolean;
  error: string | null;
  recommendLayout: (
    imageCount: number,
    caption: string,
    additionalContext?: any
  ) => Promise<void>;
  clearRecommendation: () => void;
}

export const useLayoutRecommendation = (): UseLayoutRecommendationReturn => {
  const [recommendation, setRecommendation] = useState<LayoutAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommendLayout = useCallback(async (
    imageCount: number,
    caption: string,
    additionalContext?: any
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommend-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageCount,
          caption,
          additionalContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: LayoutAnalysis = await response.json();
      setRecommendation(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Layout recommendation failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRecommendation = useCallback(() => {
    setRecommendation(null);
    setError(null);
  }, []);

  return {
    recommendation,
    isLoading,
    error,
    recommendLayout,
    clearRecommendation,
  };
};