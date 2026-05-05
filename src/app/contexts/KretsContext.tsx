import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId } from '/utils/supabase/info';
import { defaultKretsHierarchy, County } from '../data/enhancedKretsData';

interface KretsContextType {
  counties: County[];
  loading: boolean;
  refreshKrets: () => Promise<void>;
  updateKrets: (counties: County[], password: string) => Promise<boolean>;
}

const KretsContext = createContext<KretsContextType | undefined>(undefined);

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9a7b4805`;

export function KretsProvider({ children }: { children: ReactNode }) {
  const [counties, setCounties] = useState<County[]>(defaultKretsHierarchy);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshKrets();
  }, []);

  const refreshKrets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/krets`);

      if (!response.ok) {
        console.log('Failed to fetch krets, using defaults');
        setCounties(defaultKretsHierarchy);
        return;
      }

      const { krets } = await response.json();
      if (krets && krets.length > 0) {
        setCounties(krets);
      } else {
        setCounties(defaultKretsHierarchy);
      }
    } catch (error) {
      console.log(`Exception fetching krets: ${error}`);
      setCounties(defaultKretsHierarchy);
    } finally {
      setLoading(false);
    }
  };

  const updateKrets = async (newCounties: County[], password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/admin/krets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, krets: newCounties })
      });

      if (!response.ok) {
        console.log('Failed to update krets');
        return false;
      }

      setCounties(newCounties);
      return true;
    } catch (error) {
      console.log(`Exception updating krets: ${error}`);
      return false;
    }
  };

  return (
    <KretsContext.Provider value={{
      counties,
      loading,
      refreshKrets,
      updateKrets
    }}>
      {children}
    </KretsContext.Provider>
  );
}

export function useKrets() {
  const context = useContext(KretsContext);
  if (!context) {
    throw new Error('useKrets must be used within KretsProvider');
  }
  return context;
}
