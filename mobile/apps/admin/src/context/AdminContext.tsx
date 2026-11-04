import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { MobileApiClient } from '../../../../shared/services/api';
import { StorageService } from '../../../../shared/services/storage';
import { FleetSyncService } from '../../../../shared/services/fleetSync';
import { AdminOperator, AdminMetrics } from '../../../../shared/types';

interface AdminContextType {
  admin: AdminOperator | null;
  isAuthenticated: boolean;
  metrics: AdminMetrics;
  bookings: any[];
  drivers: any[];
  isLoading: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  verifyDriver: (driverId: string, status: 'approved' | 'rejected' | 'needs_changes', notes?: string) => Promise<boolean>;
  assignDriver: (bookingId: string, driverId: string, force?: boolean) => Promise<boolean>;
}

const defaultMetrics: AdminMetrics = {
  totalBookings: 0,
  activeRides: 0,
  activeDrivers: 0,
  pendingApplications: 0,
  todayRevenue: 0,
  completedTrips: 0
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminOperator | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics>(defaultMetrics);
  const [bookings, setBookings] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const prevBookingsCountRef = useRef<number>(0);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Pull live fleet data directly from MongoDB Atlas cloud
      const [bRes, dRes] = await Promise.allSettled([
        MobileApiClient.getAdminBookings(),
        MobileApiClient.getAdminDrivers()
      ]);

      const finalBookings = bRes.status === 'fulfilled' ? bRes.value : FleetSyncService.getBookings();
      const finalDrivers = dRes.status === 'fulfilled' ? dRes.value : FleetSyncService.getDrivers();

      // Trigger dispatch desk sound/haptic ping if new bookings arrived
      if (prevBookingsCountRef.current > 0 && finalBookings.length > prevBookingsCountRef.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      prevBookingsCountRef.current = finalBookings.length;

      const pendingCount = finalDrivers.filter((dr: any) => !dr.isVerified && dr.status !== 'approved').length;
      const activeCount = finalDrivers.filter((dr: any) => dr.isVerified || dr.status === 'approved').length;
      const totalRev = finalBookings.reduce((sum: number, x: any) => sum + (Number(x.fareBreakdown?.totalFare || x.price || x.totalFare || x.fare) || 0), 0);

      setMetrics({
        totalBookings: finalBookings.length,
        activeRides: finalBookings.filter((x: any) => ['driver_assigned', 'driver_en_route', 'arrived', 'started', 'ACCEPTED', 'ON THE WAY', 'TRIP STARTED'].includes(x.status || x.bookingStatus)).length,
        activeDrivers: activeCount,
        pendingApplications: pendingCount,
        todayRevenue: totalRev,
        completedTrips: finalBookings.filter((x: any) => (x.status || x.bookingStatus || '').toLowerCase().includes('complete')).length
      });

      setBookings([...finalBookings]);
      setDrivers([...finalDrivers]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedAdmin = await StorageService.getJSON<AdminOperator>('otb_admin_session');
        const token = await StorageService.getItem('otb_auth_token');

        if (storedAdmin && token) {
          setAdmin(storedAdmin);
          await refreshData();
        }
      } catch (e) {
        console.warn('[AdminContext] Error restoring admin session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Real-time synchronization across Passenger and Driver apps
  useEffect(() => {
    const unsub = FleetSyncService.subscribe(() => {
      refreshData();
    });
    return unsub;
  }, []);

  // 10-second automatic polling for live market website bookings & driver status changes
  useEffect(() => {
    if (!admin) return;
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [admin]);

  const login = async (u: string, p: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await MobileApiClient.adminLogin(u, p);
      if (res.success && res.admin) {
        setAdmin(res.admin);
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setAdmin(null);
    await StorageService.removeItem('otb_auth_token');
    await StorageService.removeItem('otb_admin_session');
  };

  const verifyDriver = async (driverId: string, status: 'approved' | 'rejected' | 'needs_changes', notes?: string): Promise<boolean> => {
    await FleetSyncService.verifyDriver(driverId, status, notes);
    try {
      await MobileApiClient.verifyDriver({ driverId, status, notes });
    } catch (e) {}
    await refreshData();
    return true;
  };

  const assignDriver = async (bookingId: string, driverId: string, force = false): Promise<boolean> => {
    await FleetSyncService.assignDriver(bookingId, driverId);
    try {
      await MobileApiClient.assignDriverToBooking(bookingId, driverId, force);
    } catch (e) {}
    await refreshData();
    return true;
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        metrics,
        bookings,
        drivers,
        isLoading,
        login,
        logout,
        refreshData,
        verifyDriver,
        assignDriver
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
