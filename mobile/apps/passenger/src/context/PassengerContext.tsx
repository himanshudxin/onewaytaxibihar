import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../../../../shared/services/storage';
import { MobileApiClient } from '../../../../shared/services/api';
import { FleetSyncService } from '../../../../shared/services/fleetSync';
import { Booking, CabTier, TripType, CabTierId } from '../../../../shared/types';
import { MASTER_PATNA_FARES } from '../../../../shared/data/patnaFares';

interface SearchState {
  origin: string;
  destination: string;
  pickupAddress: string;
  dropAddress: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  tripType: TripType;
  pickupDate: string;
  pickupTime: string;
  departureDate?: string;
  departureTime?: string;
  returnDate?: string;
  passengerCount: number;
  phone: string;
  passengerName: string;
}

interface PassengerContextType {
  search: SearchState;
  setSearch: React.Dispatch<React.SetStateAction<SearchState>>;
  updateSearch: (fields: Partial<SearchState>) => void;
  selectedTier: CabTierId;
  setSelectedTier: (tier: CabTierId) => void;
  fares: any[];
  myTrips: Booking[];
  refreshTrips: () => Promise<void>;
  activeBooking: Booking | null;
  setActiveBooking: (b: Booking | null) => void;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  isLoggedIn: boolean;
  login: (phone: string, token?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultSearch: SearchState = {
  origin: '',
  destination: '',
  pickupAddress: '',
  dropAddress: '',
  tripType: 'one-way',
  pickupDate: new Date().toISOString().split('T')[0],
  pickupTime: '10:00 AM',
  passengerCount: 2,
  phone: '',
  passengerName: ''
};

const PassengerContext = createContext<PassengerContextType | undefined>(undefined);

export const PassengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [search, setSearch] = useState<SearchState>(defaultSearch);
  const [selectedTier, setSelectedTier] = useState<CabTierId>('sedan');
  const [fares, setFares] = useState<any[]>(MASTER_PATNA_FARES);
  const [myTrips, setMyTrips] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Restore session and saved search draft from storage
    (async () => {
      const savedPhone = await StorageService.getItem('otb_user_phone');
      if (savedPhone) {
        setUserPhone(savedPhone);
        setIsLoggedIn(true);
        setSearch(prev => ({ ...prev, phone: savedPhone }));
      }
      const savedDraft = await StorageService.getJson<SearchState | null>('otb_search_draft', null);
      if (savedDraft) {
        setSearch(prev => ({ ...prev, ...savedDraft }));
      }
      try {
        const remoteFares = await MobileApiClient.getCorridorFares();
        if (Array.isArray(remoteFares) && remoteFares.length > 0) {
          setFares(remoteFares);
        }
      } catch (e) {}

      if (savedPhone) {
        const trips = await MobileApiClient.getPassengerTrips(savedPhone);
        setMyTrips(trips);
      }
    })();
  }, []);

  useEffect(() => {
    const unsub = FleetSyncService.subscribe(() => {
      const all = FleetSyncService.getBookings();
      const phone = userPhone || search.phone;
      if (phone) {
        const clean = phone.replace(/\D/g, '').slice(-10);
        const filtered = all.filter(b => (b.passengerPhone || '').replace(/\D/g, '').slice(-10) === clean);
        setMyTrips(filtered.length > 0 ? filtered : all);
      } else {
        setMyTrips(all);
      }
    });
    return unsub;
  }, [userPhone, search.phone]);

  const updateSearch = (fields: Partial<SearchState>) => {
    setSearch(prev => {
      const updated = { ...prev, ...fields };
      StorageService.setJson('otb_search_draft', updated).catch(() => {});
      return updated;
    });
  };

  const refreshTrips = async () => {
    const phone = userPhone || search.phone;
    if (phone) {
      const trips = await MobileApiClient.getPassengerTrips(phone);
      setMyTrips(trips);
    }
  };

  const login = async (phone: string, token?: string) => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    setUserPhone(clean);
    setIsLoggedIn(true);
    await StorageService.setItem('otb_user_phone', clean);
    if (token) {
      await StorageService.setItem('otb_auth_token', token);
    }
    setSearch(prev => ({ ...prev, phone: clean }));
    try {
      const trips = await MobileApiClient.getPassengerTrips(clean);
      setMyTrips(trips);
    } catch (e) {}
  };

  const handleSetUserPhone = (phone: string) => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    setUserPhone(clean);
    if (clean.length === 10) {
      setIsLoggedIn(true);
      StorageService.setItem('otb_user_phone', clean).catch(() => {});
      setSearch(prev => ({ ...prev, phone: clean }));
    }
  };

  const logout = async () => {
    await MobileApiClient.logout();
    await StorageService.removeItem('otb_user_phone');
    await StorageService.removeItem('otb_auth_token');
    setUserPhone('');
    setIsLoggedIn(false);
    setMyTrips([]);
    setActiveBooking(null);
  };

  return (
    <PassengerContext.Provider
      value={{
        search,
        setSearch,
        updateSearch,
        selectedTier,
        setSelectedTier,
        fares,
        myTrips,
        refreshTrips,
        activeBooking,
        setActiveBooking,
        userPhone,
        setUserPhone: handleSetUserPhone,
        isLoggedIn,
        login,
        logout
      }}
    >
      {children}
    </PassengerContext.Provider>
  );
};

export const usePassenger = () => {
  const context = useContext(PassengerContext);
  if (!context) {
    throw new Error('usePassenger must be used within a PassengerProvider');
  }
  return context;
};
