import axios from 'axios';
import { CONFIG } from '@/constants/config';

const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptores mejorados para debugging en móvil
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 [${new Date().toLocaleTimeString()}] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [${new Date().toLocaleTimeString()}] ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

// ==================== SERVICIOS ====================

export const matchesService = {
  getLiveMatches: async () => {
    try {
      const response = await api.get('/matches/live');
      return response.data;
    } catch (error: any) {
      console.error('Error en getLiveMatches:', error.message);
      throw error;
    }
  },

  getUpcomingMatches: async (date?: string, league?: number) => {
    const params: any = {};
    if (date) params.date = date;
    if (league) params.league = league;
    
    const response = await api.get('/matches/upcoming', { params });
    return response.data;
  },

  getMatchDetails: async (matchId: string | number) => {
    const response = await api.get(`/match/${matchId}`);
    return response.data;
  },
};

export const predictionsService = {
  getPrediction: async (matchId: string | number) => {
    const response = await api.get(`/predict/${matchId}`);
    return response.data;
  },

  getDailyPredictions: async () => {
    const response = await api.get('/predictions');
    return response.data;
  },
};

export const leaguesService = {
  getLeagues: async (season?: number) => {
    const params: any = {};
    if (season) params.season = season;
    
    const response = await api.get('/leagues', { params });
    return response.data;
  },
};

// ==================== HOOKS ====================

import { useState, useEffect, useCallback } from 'react';

export const useLiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const data = await matchesService.getLiveMatches();
      
      if (data.success) {
        setMatches(data.matches);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('useLiveMatches error:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    
    // Polling cada 60 segundos
    const interval = setInterval(fetchMatches, CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  return { 
    matches, 
    loading, 
    error, 
    refetch: fetchMatches 
  };
};

export const useMatchPrediction = (matchId: string | number) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await predictionsService.getPrediction(matchId);
        
        if (data.success) {
          setPrediction(data.prediction);
        } else {
          throw new Error(data.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [matchId]);

  return { prediction, loading, error };
};

export default api;