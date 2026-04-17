import { useState, useEffect, useCallback } from 'react';
import { ApiClient, type ActiveGoalResponse } from '../api/apiClient';

const apiClient = new ApiClient();

export const useActiveGoal = () => {
  const [data, setData] = useState<ActiveGoalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoal = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure we use the current token if available
      const token = localStorage.getItem('accessToken');
      apiClient.setAuthToken(token);

      const result = await apiClient.getActiveGoalSummary();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch active goal',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  return { data, loading, error, refresh: fetchGoal };
};
