import React, { createContext, useContext, useState, useEffect } from 'react';
import { MobileApiClient, FareItem } from '../services/api';

export interface UserProfile {
  phone: string;
  name: string;
  role: 'customer' | 'driver';
  token?: string;
  walletBalance?: number;
}

export interface TripSearch {
  origin: string;
  destination: string;
  tripType: 'oneway' | 'roundtrip' | 'local';
  pickupDate: string;
  pickupTime: string;
}

interface AppContextType {
  user: UserProfile | null;
  activeRole: 'customer' | 'driver';
  fares: FareItem[];
  faresLoading: boolean;
  currentSearch: TripSearch;
  isOnlineDriver: boolean;
  setUser: (user: UserProfile | null) => void;
  setActiveRole: (role: 'customer' | 'driver') => void;
  setCurrentSearch: React.Dispatch<React.SetStateAction<TripSearch>>;
  setIsOnlineDriver: (online: boolean) => void;
  refreshFares: () => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'customer' | 'driver'>('customer');
  const [fares, setFares] = useState<FareItem[]>([]);
  const [faresLoading, setFaresLoading] = useState<boolean>(true);
  const [isOnlineDriver, setIsOnlineDriver] = useState<boolean>(false);

  const [currentSearch, setCurrentSearch] = useState<TripSearch>({
    origin: 'Patna',
    destination: 'Gaya',
    tripType: 'oneway',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '10:00 AM'
  });

  const refreshFares = async () => {
    try {
      setFaresLoading(true);
      const res = await MobileApiClient.getFares();
      if (res && res.fares) {
        setFares(res.fares);
      }
    } catch (e) {
      console.warn('Could not fetch live fares:', e);
    } finally {
      setFaresLoading(false);
    }
  };

  useEffect(() => {
    refreshFares();
  }, []);

  const logout = () => {
    setUser(null);
    MobileApiClient.setAuthToken(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeRole,
        fares,
        faresLoading,
        currentSearch,
        isOnlineDriver,
        setUser,
        setActiveRole,
        setCurrentSearch,
        setIsOnlineDriver,
        refreshFares,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
