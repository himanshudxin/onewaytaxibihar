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

    // --- THEME MANAGER (Req. 1: Dark Mode) ---
    initTheme() {
      const saved = localStorage.getItem('otb_theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
      
      const bindButtons = () => {
        const cur = document.documentElement.getAttribute('data-theme') || theme;
        this.updateThemeIcons(cur);
        document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
          if (!btn.dataset.themeBound) {
            btn.dataset.themeBound = 'true';
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              this.toggleTheme();
            });
          }
        });
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindButtons);
      } else {
        bindButtons();
      }

      return theme;
    }

    toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('otb_theme', next);
      this.updateThemeIcons(next);
      return next;
    }

    updateThemeIcons(theme) {
      document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
        btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        btn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        btn.innerHTML = theme === 'dark' 
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      });
    }

    // --- AUTO LOCATION DETECTION (Req. 3) ---
    calcHaversine(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    autoDetectLocation(callback) {
      const BIHAR_HUBS = [
        { name: 'Patna Airport (PAT)', lat: 25.5913, lng: 85.0877, radius: 5 },
        { name: 'Patna Junction', lat: 25.6025, lng: 85.1376, radius: 8 },
        { name: 'Danapur', lat: 25.6333, lng: 85.0500, radius: 10 },
        { name: 'Patna', lat: 25.5941, lng: 85.1376, radius: 30 },
        { name: 'Gaya', lat: 24.7914, lng: 85.0002, radius: 30 },
        { name: 'Bodh Gaya', lat: 24.6961, lng: 84.9870, radius: 15 },
        { name: 'Muzaffarpur', lat: 26.1209, lng: 85.3647, radius: 30 },
        { name: 'Darbhanga', lat: 26.1542, lng: 85.8918, radius: 30 },
        { name: 'Bhagalpur', lat: 25.2425, lng: 86.9842, radius: 30 },
        { name: 'Purnea', lat: 25.7771, lng: 87.4753, radius: 30 },
        { name: 'Begusarai', lat: 25.4182, lng: 86.1272, radius: 30 },
        { name: 'Arrah', lat: 25.5541, lng: 84.6644, radius: 25 },
        { name: 'Chapra', lat: 25.7848, lng: 84.7274, radius: 25 },
        { name: 'Motihari', lat: 26.6469, lng: 84.9089, radius: 30 },
        { name: 'Bettiah', lat: 26.8028, lng: 84.5028, radius: 30 },
        { name: 'Siwan', lat: 26.2196, lng: 84.3567, radius: 25 },
        { name: 'Saharsa', lat: 25.8835, lng: 86.6006, radius: 30 },
        { name: 'Samastipur', lat: 25.8628, lng: 85.7811, radius: 25 },
        { name: 'Sasaram', lat: 24.9528, lng: 84.0317, radius: 30 },
        { name: 'Ranchi', lat: 23.3441, lng: 85.3096, radius: 40 },
        { name: 'Varanasi', lat: 25.3176, lng: 82.9739, radius: 40 },
        { name: 'Deoghar', lat: 24.4826, lng: 86.7000, radius: 35 }
      ];

      // Check session cache first
      const cached = sessionStorage.getItem('otb_user_geo_location');
      if (cached && callback) {
        callback(cached, true);
        return;
      }

      if (!navigator.geolocation) {
        if (callback) callback('Patna', false);
        return;
      }

      navigator.geolocation.getCurrentPosition((pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        let matched = null;
        let minDistance = 999999;

        for (const hub of BIHAR_HUBS) {
          const dist = this.calcHaversine(uLat, uLng, hub.lat, hub.lng);
          if (dist < minDistance) {
            minDistance = dist;
            matched = hub;
          }
        }

        if (matched && minDistance <= 65) {
          sessionStorage.setItem('otb_user_geo_location', matched.name);
          if (callback) callback(matched.name, true);
        } else {
          if (callback) callback('Patna', false);
        }
      }, (err) => {
        if (callback) callback('Patna', false);
      }, { timeout: 6000, maximumAge: 300000 });
    }
  }

  window.BookingFlow = new BookingFlowController();
  // Auto-initialize theme on load
  window.BookingFlow.initTheme();
})();
