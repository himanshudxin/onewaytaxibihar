/**
 * useDispatchOffers.ts
 * Real-time broadcast dispatch offer polling hook for Driver App.
 * Polls GET /api/dispatch/offers every 6 seconds while driver is ON_DUTY.
 * Exposes: offers list, claimOffer(), rejectOffer(), isLoading, error
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { StorageService } from '../../../../shared/services/storage';
import { resolveApiBaseUrl } from '../../../../shared/services/api';

const POLL_INTERVAL_MS = 6000; // 6-second polling

export interface BroadcastOffer {
  bookingId: string;
  pnr: string;
  pickupDateTimeFormatted: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropLocation: string;
  originCity: string;
  destCity: string;
  totalFare: number;
  driverNetEarnings: number;
  platformCommission: number;
  tripType: 'oneway' | 'roundtrip' | string;
  cabTier: string;
  passengerName: string;
  dispatchStatus: string;
  broadcastStartedAt: string;
  broadcastTimeoutSec: number;
  candidateCount: number;
  alreadyRejected: boolean;
  source?: string;
  channel?: string;
  isApp?: boolean;
}

interface ClaimResult {
  success: boolean;
  alreadyClaimed?: boolean;
  message?: string;
  booking?: any;
  driver?: any;
}

function getApiBase(): string {
  try {
    const base = resolveApiBaseUrl();
    return base.replace(/\/api\/?$/, '');
  } catch {
    return 'https://onewaytaxibihar.com';
  }
}

async function getDriverToken(): Promise<string | null> {
  try {
    const token = (await StorageService.getItem('otb_auth_token')) || (await StorageService.getItem('driver_token'));
    return token;
  } catch {
    return null;
  }
}

export function useDispatchOffers(isDutyOnline: boolean) {
  const [offers, setOffers] = useState<BroadcastOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const fetchOffers = useCallback(async () => {
    if (!isDutyOnline) return;
    const token = await getDriverToken();
    if (!token) return;

    try {
      const res = await fetch(`${getApiBase()}/api/dispatch/offers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired - silent fail
          return;
        }
        return;
      }

      const data = await res.json();
      if (data.success && isMountedRef.current) {
        setOffers(data.offers || []);
        setError(null);
      }
    } catch (err: any) {
      if (isMountedRef.current && err?.name !== 'AbortError') {
        // Silent network error - keep polling
        setError(null);
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [isDutyOnline]);

  // Start/stop polling based on duty status & AppState lifecycle (Battery-aware optimization)
  useEffect(() => {
    isMountedRef.current = true;

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchOffers, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (isDutyOnline) {
      setIsLoading(true);
      fetchOffers(); // immediate first fetch
      startPolling();

      // Battery saver: pause high-frequency polling when app is in background/screen locked,
      // and immediately re-sync when driver brings app back to foreground.
      const appStateSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          fetchOffers();
          startPolling();
        } else if (nextState === 'background' || nextState === 'inactive') {
          stopPolling();
        }
      });

      return () => {
        stopPolling();
        appStateSub.remove();
      };
    } else {
      setOffers([]);
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isDutyOnline, fetchOffers]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const claimOffer = useCallback(async (bookingId: string): Promise<ClaimResult> => {
    const token = await getDriverToken();
    if (!token) return { success: false, message: 'Not authenticated.' };

    try {
      const res = await fetch(`${getApiBase()}/api/dispatch/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();

      if (res.status === 409) {
        return { success: false, alreadyClaimed: true, message: data.message || 'Trip accepted by another driver.' };
      }

      if (res.ok && data.success) {
        // Remove the claimed offer from local list
        setOffers(prev => prev.filter(o => o.bookingId !== bookingId));
        return { success: true, booking: data.booking, driver: data.driver, message: data.message };
      }

      return { success: false, message: data.message || 'Failed to claim trip.' };
    } catch (err: any) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const rejectOffer = useCallback(async (bookingId: string, reason?: string): Promise<boolean> => {
    const token = await getDriverToken();
    if (!token) return false;

    try {
      const res = await fetch(`${getApiBase()}/api/dispatch/reject-broadcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, reason: reason || 'Driver declined' }),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        // Remove from local list immediately
        setOffers(prev => prev.filter(o => o.bookingId !== bookingId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    offers,
    isLoading,
    error,
    claimOffer,
    rejectOffer,
    refetch: fetchOffers,
  };
}

