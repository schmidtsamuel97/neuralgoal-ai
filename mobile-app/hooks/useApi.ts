import { useState, useEffect, useCallback } from 'react';
import { matchesService, predictionsService, historyService, userService } from '@/services/api';

// Hook genérico para manejo de estados de API
export function useApi<T>(apiCall: () => Promise<any>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await apiCall();
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => fetchData(true);

  return { data, loading, error, refreshing, refetch };
}

// Hook específico para partidos en vivo
export function useLiveMatches() {
  return useApi(matchesService.getLiveMatches, []);
}

// Hook para detalle de partido
export function useMatchDetails(matchId: string | number) {
  return useApi(() => matchesService.getMatchDetails(matchId), [matchId]);
}

// Hook para predicciones del día
export function useTodayPredictions() {
  return useApi(predictionsService.getTodayPredictions, []);
}

// Hook para historial
export function useHistory(filter?: 'all' | 'win' | 'loss' | 'pending') {
  return useApi(() => historyService.getHistory(filter), [filter]);
}

// Hook para perfil de usuario
export function useUserProfile() {
  return useApi(userService.getProfile, []);
}

// Hook para stats del dashboard
export function useDashboardStats() {
  return useApi(userService.getDashboardStats, []);
}