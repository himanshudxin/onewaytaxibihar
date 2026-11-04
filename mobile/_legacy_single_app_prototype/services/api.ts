/**
 * OneWayTaxiBihar Mobile API Client
 * Connects directly to production Vercel & MongoDB Atlas Cloud backend
 */

export const API_BASE_URL = 'https://onewaytaxibihar.com/api';

export interface FareItem {
  id: string;
  origin: string;
  destCity: string;
  destination: string;
  distanceKm: number;
  hatchback: number;
  sedan: number;
  suv: number;
  discounted?: {
    hatchback: number;
    sedan: number;
    suv: number;
    twoWay?: {
      hatchback: number;
      sedan: number;
      suv: number;
    };
  };
}

export interface BookingPayload {
  passengerName: string;
  passengerPhone: string;
  pickupCity: string;
  dropCity: string;
  pickupDate: string;
  pickupTime: string;
  tripType: 'oneway' | 'roundtrip' | 'local';
  cabTier: 'hatchback' | 'sedan' | 'suv';
  pickupAddress: string;
  dropAddress?: string;
  estimatedFare: number;
  tokenAdvance?: number;
  paymentMode?: string;
}

export class MobileApiClient {
  private static authToken: string | null = null;

  static setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers as Record<string, string> || {})
        }
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.warn(`[API] Network error on ${endpoint}:`, error.message);
      throw new Error(error.message || 'Network connection failed. Please verify internet access.');
    }
  }

  // 1. Health & Database connectivity check
  static async getHealth() {
    return this.request<{ success: boolean; engine: string; database: any }>('/health');
  }

  // 2. Platform settings (helpline, WhatsApp, token rates)
  static async getSettings() {
    return this.request<{ success: boolean; settings: any }>('/settings');
  }

  // 3. Fares Directory (All 38 Bihar Districts)
  static async getFares() {
    return this.request<{ success: boolean; fares: FareItem[]; categories: any }>('/fares');
  }

  // 4. Send SMS OTP
  static async sendOtp(phone: string) {
    return this.request<{ success: boolean; message: string; sessionId?: string }>('/auth/otp', {
      method: 'POST',
      body: JSON.stringify({ action: 'send', phone })
    });
  }

  // 5. Verify SMS OTP
  static async verifyOtp(phone: string, otp: string) {
    return this.request<{ success: boolean; token?: string; user?: any; message?: string }>('/auth/otp', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', phone, otp })
    });
  }

  // 6. Instant Fare Lead Capture
  static async captureLead(payload: {
    phone: string;
    pickupCity: string;
    dropCity: string;
    tripType: string;
    selectedCab: string;
    source?: string;
  }) {
    return this.request<{ success: boolean; lead: any }>('/leads', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 7. Create Confirmed Booking (MongoDB)
  static async createBooking(payload: BookingPayload) {
    return this.request<{ success: boolean; bookingId: string; booking: any; whatsappDispatchUrl?: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 8. Fetch Rider Trips
  static async getPassengerTrips(phone: string) {
    return this.request<{ success: boolean; bookings: any[] }>(`/passenger/trips?phone=${encodeURIComponent(phone)}`);
  }

  // 9. Fetch Driver Assigned Rides & Ledger
  static async getDriverTrips(phone: string) {
    return this.request<{ success: boolean; bookings: any[]; driver?: any }>(`/driver/trips?phone=${encodeURIComponent(phone)}`);
  }

  // 10. Update Driver Location (GPS Broadcast)
  static async broadcastDriverLocation(driverPhone: string, coords: { lat: number; lng: number; heading?: number }) {
    return this.request<{ success: boolean }>('/driver/location', {
      method: 'POST',
      body: JSON.stringify({ phone: driverPhone, coords, timestamp: new Date().toISOString() })
    });
  }
}
