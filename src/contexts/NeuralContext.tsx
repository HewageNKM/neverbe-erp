import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface NeuralState {
  data: any | null;
  loading: boolean;
  refreshing: boolean;
  lastSynced: string | null;
  refresh: (force?: boolean) => Promise<void>;
}

const NeuralContext = createContext<NeuralState | undefined>(undefined);

const CACHE_KEY = "neverbe_neural_cache";

export const NeuralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const fetchNeural = useCallback(async (force: boolean = false) => {
    if (force) setRefreshing(true);
    
    try {
      const resp = await api.get(`/api/v1/erp/ai/neural?refresh=${force}`);
      if (resp.data.success) {
        const feed = resp.data.data;
        setData(feed);
        setLastSynced(new Date().toISOString());
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: feed,
          syncedAt: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error("Neural Synchronization Failed", err);
      // Soft fail: Toast only if it was a manual refresh
      if (force) toast.error("Neural Core synchronization failed. Using cached data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initialization: Load from cache then fetch fresh
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data: cachedFeed, syncedAt } = JSON.parse(cached);
      setData(cachedFeed);
      setLastSynced(syncedAt);
      setLoading(false);
    }
    
    fetchNeural(); // Initial silent fetch

    // Auto-poll every 5 minutes
    const interval = setInterval(() => fetchNeural(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNeural]);

  return (
    <NeuralContext.Provider value={{
      data,
      loading,
      refreshing,
      lastSynced,
      refresh: fetchNeural
    }}>
      {children}
    </NeuralContext.Provider>
  );
};

export const useNeural = () => {
  const context = useContext(NeuralContext);
  if (context === undefined) {
    throw new Error("useNeural must be used within a NeuralProvider");
  }
  return context;
};
