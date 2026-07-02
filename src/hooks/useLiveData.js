// src/hooks/useLiveData.js
// React hook for fetching live World Cup data from football-data.org
//
// ESPN API removed: it blocks browser requests with CORS errors.
// football-data.org works from browser (proper CORS headers with X-Auth-Token).
//
// Free key: https://www.football-data.org/ (covers WC, 10 req/min)

import { useState, useEffect, useRef, useCallback } from 'react';
import { createFootballDataApi } from '../services/footballDataApi';
import { transformFootballData } from '../services/dataTransformer';

// 5 minutes — safe for free tier (10 req/min limit)
const REFRESH_INTERVAL = 5 * 60 * 1000;

export function useLiveData(apiKey) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!apiKey) {
      setError('API key gerekli. football-data.org adresinden ücretsiz key alın.');
      setIsLive(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const api = createFootballDataApi(apiKey);
      const response = await api.getWorldCupMatches();
      const transformedData = transformFootballData(response);

      setData(transformedData);
      setLastUpdated(new Date());
      setIsLive(true);
      console.log(`[useLiveData] football-data.org | Phase: ${transformedData.phase} | Knockout rounds: ${transformedData.knockoutMatches?.length}`);
    } catch (err) {
      console.error('[useLiveData] Error:', err);
      // Provide helpful error messages
      if (err.message?.includes('401') || err.message?.includes('403')) {
        setError('API key geçersiz veya süresi dolmuş. Yeni key alın: football-data.org');
      } else if (err.message?.includes('429')) {
        setError('Rate limit aşıldı (10 req/dk). Biraz bekleyin.');
      } else if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        setError('Ağ hatası. İnternet bağlantınızı kontrol edin.');
      } else {
        setError(`Veri alınamadı: ${err.message}`);
      }
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  // Initial fetch and interval — only if we have a key
  useEffect(() => {
    if (!apiKey) return;
    
    refresh();
    
    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, apiKey]);

  const triggerRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    isLive, 
    refresh: triggerRefresh 
  };
}
