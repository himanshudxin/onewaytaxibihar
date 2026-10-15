/**
 * OneWayTaxiBihar.com - Enterprise Customer Booking Flow Controller
 * Handles Multi-Step State Persistence, Authoritative API Communication,
 * Strict Phone Validation, OTP Gate & Recovery States, and Analytics Tracking.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'otb_active_trip_v2';
  const ANALYTICS_KEY = 'otb_analytics_events';

  class BookingFlowController {
    constructor() {
      this.state = this.loadState();
    }

    loadState() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Check expiry (4 hours)
          if (parsed && parsed.savedAt && (Date.now() - parsed.savedAt < 4 * 60 * 60 * 1000)) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('[BookingFlow] Storage read notice:', e.message);
      }

      return {
        origin: null,
        dest: null,
        date: this.getTodayDateString(),
        time: '08:30 AM',
        phone: '',
        availableFares: null,
        selectedCab: null,
        passenger: {
          name: '',
          phone: '',
          altPhone: '',
          pickupAddress: '',
          notes: '',
          paymentPreference: 'cash'
        },
        confirmedBooking: null,
        otpAttempts: 0,
        savedAt: Date.now()
      };
    }

    saveState() {
      this.state.savedAt = Date.now();
      try {
        const serialized = JSON.stringify(this.state);
        sessionStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (e) {
        console.warn('[BookingFlow] Storage write notice:', e.message);
      }
    }

    getTodayDateString() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${month}-${day}`;
    }

    // --- ANALYTICS EVENT TRACKING (Req. 29) ---
    track(eventName, data = {}) {
      const event = {
        name: eventName,
        data,
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      };
      console.log(`[OTB Analytics] 📊 ${eventName}`, data);

      try {
        const logs = JSON.parse(sessionStorage.getItem(ANALYTICS_KEY) || '[]');
        logs.push(event);
        if (logs.length > 50) logs.shift();
        sessionStorage.setItem(ANALYTICS_KEY, JSON.stringify(logs));
      } catch (e) {}

      // Dispatch Custom DOM Event for external trackers (GTM, Meta Pixel)
      window.dispatchEvent(new CustomEvent('otb_event', { detail: event }));
    }

    // --- STEP 1: HOMEPAGE TRIP SEARCH ---
    saveTripSearch(origin, dest, date, time, rawPhone) {
      const cleanPhone = String(rawPhone || '').replace(/\D/g, '').slice(-10);
      this.state.origin = origin;
      this.state.dest = dest;
      this.state.date = date || this.getTodayDateString();
      this.state.time = time || '08:30 AM';
      this.state.phone = cleanPhone;
      if (!this.state.passenger) this.state.passenger = {};
      this.state.passenger.phone = cleanPhone;

      this.saveState();
      this.track('Fare checked', {
        from: origin?.name || origin,
        to: dest?.name || dest,
        date: this.state.date,
        time: this.state.time
      });
    }

    async fetchFares(originName, destName) {
      try {
        const origin = originName || this.state.origin?.name || this.state.origin || 'Patna';
        const dest = destName || this.state.dest?.name || this.state.dest || 'Gaya';
        const res = await fetch('/api/fares/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, dest, tripType: 'oneway' })
        });
        if (!res.ok) throw new Error('Server returned ' + res.status);
        const data = await res.json();
        if (data.success && data.fares) {
          this.state.availableFares = data.fares;
          this.state.distanceKm = data.distanceKm;
          this.saveState();
          return data;
        }
      } catch (err) {
        console.warn('[BookingFlow] Fare calculation notice:', err.message);
      }
      return null;
    }

    // --- STEP 2: CAB SELECTION ---
    selectCab(cabData) {
      this.state.selectedCab = cabData;
      this.saveState();
      this.track('Cab selected', {
        category: cabData.category || cabData.tier,
        fare: cabData.fare
      });
    }

    // --- STEP 3: PASSENGER DETAILS ---
    savePassengerDetails(details) {
      this.state.passenger = {
        ...this.state.passenger,
        ...details
      };
      this.saveState();
      this.track('Passenger details completed', {
        name: details.name,
        paymentPreference: details.paymentPreference
      });
    }

    // --- STEP 4: SEND OTP ---
    async sendOtp() {
      const phone = this.state.phone || this.state.passenger.phone;
      const name = this.state.passenger.name || 'Valued Passenger';

      if (!phone || phone.length !== 10) {
        throw new Error('Valid 10-digit mobile number required');
      }

      this.track('Book Now clicked', { phone, cab: this.state.selectedCab?.category });

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Unable to dispatch verification code');
      }

      this.track('OTP sent', { phone });
      return data;
    }

    // --- STEP 5: VERIFY OTP & CONFIRM BOOKING ---
    async verifyOtpAndBook(otpCode) {
      const phone = this.state.phone || this.state.passenger.phone;
      const name = this.state.passenger.name || 'Valued Passenger';

      if (!otpCode || String(otpCode).trim().length !== 6) {
        throw new Error('Please enter complete 6-digit OTP');
      }

      // 1. Verify OTP with Server
      const otpRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: String(otpCode).trim(), name })
      });

      const otpData = await otpRes.json();
      if (!otpRes.ok || !otpData.success) {
        this.state.otpAttempts = (this.state.otpAttempts || 0) + 1;
        this.saveState();
        this.track('OTP failed', { phone, attempts: this.state.otpAttempts });
        throw new Error(otpData.message || 'Invalid or expired OTP code');
      }

      this.track('OTP verified', { phone });

      // 2. Create Confirmed Booking on Server
      const trip = this.state;
      const originName = trip.origin?.name || trip.origin || 'Patna';
      const destName = trip.dest?.name || trip.dest || 'Bihar Outstation';

      const bookingPayload = {
        originCity: originName,
        destCity: destName,
        pickupAddress: trip.passenger.pickupAddress || `${originName} Municipal limits`,
        dropAddress: `${destName} Town / Drop Location`,
        pickupDate: trip.date,
        pickupTime: trip.time,
        cabTier: trip.selectedCab?.tier || 'sedan',
        cabCategory: trip.selectedCab?.category || 'Executive Sedan',
        totalFare: trip.selectedCab?.fare || 1999,
        passengerName: trip.passenger.name,
        passengerPhone: `+91 ${phone}`,
        passengerEmail: trip.passenger.email || '',
        specialInstructions: [trip.passenger.notes, trip.passenger.altPhone ? `Alt Phone: ${trip.passenger.altPhone}` : ''].filter(Boolean).join(' • '),
        paymentMethod: trip.passenger.paymentPreference === 'advance' ? 'Razorpay Token Advance (20%)' : 'Cash to Driver (Zero Advance)',
        source: 'ONLINE_PORTAL',
        status: 'CONFIRMED'
      };

      const bookRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': otpData.token ? `Bearer ${otpData.token}` : ''
        },
        body: JSON.stringify(bookingPayload)
      });

      const bookData = await bookRes.json();
      if (!bookRes.ok || !bookData.success) {
        throw new Error(bookData.message || 'Unable to register booking confirmation');
      }

      const confirmed = bookData.booking || bookData;
      this.state.confirmedBooking = confirmed;
      this.saveState();

      this.track('Booking confirmed', {
        bookingId: confirmed.bookingId || confirmed.id,
        fare: confirmed.totalFare || confirmed.fare
      });

      return confirmed;
    }

    clearActiveTrip() {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  window.BookingFlow = new BookingFlowController();
})();
