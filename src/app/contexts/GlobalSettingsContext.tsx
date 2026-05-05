import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId } from '/utils/supabase/info';
import { GlobalSettings, defaultThemes, defaultStrategies, defaultOutlets } from '../types/globalSettings';
import { defaultKretsHierarchy } from '../data/enhancedKretsData';

interface GlobalSettingsContextType {
  settings: GlobalSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (settings: GlobalSettings, password: string) => Promise<boolean>;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9a7b4805`;

const defaultSettings: GlobalSettings = {
  counties: defaultKretsHierarchy,
  themes: defaultThemes,
  strategies: defaultStrategies,
  outlets: defaultOutlets,
  version: 1,
  lastUpdated: new Date().toISOString()
};

export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshSettings();
  }, []);

  const refreshSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/global-settings`);

      if (!response.ok) {
        console.log('Failed to fetch settings, using defaults');
        setSettings(defaultSettings);
        return;
      }

      const { settings: fetchedSettings } = await response.json();
      if (fetchedSettings) {
        setSettings(fetchedSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.log(`Exception fetching settings: ${error}`);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: GlobalSettings, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/admin/global-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password,
          settings: {
            ...newSettings,
            version: newSettings.version + 1,
            lastUpdated: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        console.log('Failed to update settings');
        return false;
      }

      await refreshSettings();
      return true;
    } catch (error) {
      console.log(`Exception updating settings: ${error}`);
      return false;
    }
  };

  return (
    <GlobalSettingsContext.Provider value={{
      settings,
      loading,
      refreshSettings,
      updateSettings
    }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export function useGlobalSettings() {
  const context = useContext(GlobalSettingsContext);
  if (!context) {
    throw new Error('useGlobalSettings must be used within GlobalSettingsProvider');
  }
  return context;
}
