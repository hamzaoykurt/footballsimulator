// src/hooks/useCLLiveData.js
// React hook for fetching live Champions League data from football-data.org

import { useState, useEffect, useRef, useCallback } from 'react';
import { createFootballDataApi } from '../services/footballDataApi';
import { transformCLData } from '../services/clDataTransformer';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useCLLiveData(apiKey) {
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
      const response = await api.getChampionsLeagueMatches();
      const transformedData = transformCLData(response);

      setData(transformedData);
      setLastUpdated(new Date());
      setIsLive(true);
      console.log(`[useCLLiveData] CL matches loaded. Phase: ${transformedData.phase}`);
    } catch (err) {
      console.error('[useCLLiveData] Error:', err);
      if (err.message?.includes('401') || err.message?.includes('403')) {
        setError('API key geçersiz veya süresi dolmuş. football-data.org adresinden yeni key alın.');
      } else if (err.message?.includes('429')) {
        setError('Rate limit aşıldı (10 req/dk). Biraz bekleyin.');
      } else {
        setError(`Veri alınamadı: ${err.message}`);
      }
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  // Initial fetch and interval
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
