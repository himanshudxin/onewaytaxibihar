/**
 * OneWayTaxiBihar Unified Fleet & Dispatch Sync Service
 * Connects Passenger booking, Admin dispatching, and Driver trip execution in real-time
 */

import { StorageService } from './storage';
import { Booking, DriverProfile, TripOffer } from '../types';

export const INITIAL_DRIVERS: any[] = [];

export const INITIAL_BOOKINGS: Booking[] = [];

class FleetSyncManager {
  private listeners: Set<() => void> = new Set();
  private bookings: Booking[] = [];
  private drivers: any[] = [];
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const storedBookings = await StorageService.getJson<Booking[] | null>('otb_all_bookings', null);
        if (storedBookings && storedBookings.length > 0) {
          // Filter out any legacy mock data from earlier sessions
          const cleanList = storedBookings.filter(b => 
            b.id !== 'bkg_914820' && b.referenceNumber !== 'OTB-914820' &&
            b.id !== 'bkg_883192' && b.referenceNumber !== 'OTB-883192' &&
            b.id !== 'bkg_772910' && b.referenceNumber !== 'OTB-772910' &&
            b.passengerName !== 'Manoj Kumar'
          );
          const map = new Map<string, Booking>();
          cleanList.forEach(b => map.set(b.referenceNumber || b.id, b));
          this.bookings.forEach(b => map.set(b.referenceNumber || b.id, b));
          this.bookings = Array.from(map.values());
        }

        const storedDrivers = await StorageService.getJson<any[] | null>('otb_all_drivers', null);
        if (storedDrivers && storedDrivers.length > 0) {
          const map = new Map<string, any>();
          storedDrivers.forEach(d => map.set(d.id || d.phone, d));
          this.drivers.forEach(d => map.set(d.id || d.phone, d));
          this.drivers = Array.from(map.values());
        }
      } catch (e) {
        // Keep in-memory defaults
      }
      this.initialized = true;
      this.notify();
    })();

    return this.initPromise;
  }

  setBookings(newBookings: Booking[]): void {
    const cleanList = (newBookings || []).filter(b =>
      b.id !== 'bkg_914820' && b.referenceNumber !== 'OTB-914820' &&
      b.id !== 'bkg_883192' && b.referenceNumber !== 'OTB-883192' &&
      b.id !== 'bkg_772910' && b.referenceNumber !== 'OTB-772910' &&
      b.passengerName !== 'Manoj Kumar'
    );
    this.bookings = cleanList;
    this.persist();
    this.notify();
  }

  setDrivers(newDrivers: any[]): void {
    this.drivers = [...(newDrivers || [])];
    this.persist();
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) {}
    });
  }

  private async persist(): Promise<void> {
    try {
      await StorageService.setJson('otb_all_bookings', this.bookings);
      await StorageService.setJson('otb_all_drivers', this.drivers);
    } catch (e) {}
  }

  // ==========================================
  // BOOKINGS SYNC
  // ==========================================

  getBookings(): Booking[] {
    return [...this.bookings];
  }

  getBookingById(idOrRef: string): Booking | undefined {
    return this.bookings.find(b => b.id === idOrRef || b.referenceNumber === idOrRef);
  }

  async addBooking(booking: Booking): Promise<Booking> {
    await this.init();

    const formattedBooking: Booking = {
      ...booking,
      id: booking.id || `bkg_${Date.now()}`,
      referenceNumber: booking.referenceNumber || `OTB-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'confirmed', // Confirmed, waiting for chauffeur allotment
      assignedDriverId: null,
      startOtp: booking.startOtp || `${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: booking.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bookings = [formattedBooking, ...this.bookings.filter(b => b.id !== formattedBooking.id && b.referenceNumber !== formattedBooking.referenceNumber)];
    await this.persist();
    this.notify();
    return formattedBooking;
  }

  // ==========================================
  // DISPATCH & DRIVER ASSIGNMENT
  // ==========================================

  async assignDriver(bookingIdOrRef: string, driverIdOrPhone: string): Promise<boolean> {
    const bIdx = this.bookings.findIndex(b => b.id === bookingIdOrRef || b.referenceNumber === bookingIdOrRef);
    if (bIdx === -1) return false;

    const drv = this.drivers.find(d => d.id === driverIdOrPhone || d.phone === driverIdOrPhone);
    if (!drv) return false;

    const currentBooking = this.bookings[bIdx];
    const driverId = drv.id || `drv_${drv.phone}`;
    const driverName = drv.name || drv.fullName || 'Chauffeur';
    const driverPhone = drv.phone;
    const vehiclePlateNumber = drv.vehicleNumber || drv.documents?.vehiclePlateNumber || 'BR 01 PB 8291';
    const vehicleModel = drv.vehicleModel || drv.documents?.vehicleModel || 'Dzire Tour';

    const updatedBooking: Booking = {
      ...currentBooking,
      assignedDriverId: driverId,
      status: 'driver_assigned',
      updatedAt: new Date().toISOString(),
      driver: {
        driverId,
        driverName,
        driverPhone,
        driverRating: drv.rating || 4.88,
        totalTripsCompleted: drv.totalTrips || 342,
        vehicleMake: drv.vehicleMake || 'Maruti Suzuki',
        vehicleModel,
        vehiclePlateNumber,
        vehicleColor: 'Silver Metallic',
        assignedAt: new Date().toISOString()
      }
    };

    // Attach driver details for quick display across all screens
    (updatedBooking as any).assignedDriverName = driverName;
    (updatedBooking as any).assignedDriverPhone = driverPhone;
    (updatedBooking as any).assignedDriverCarNo = vehiclePlateNumber;
    (updatedBooking as any).bookingStatus = 'ASSIGNED';

    this.bookings[bIdx] = updatedBooking;
    await this.persist();
    this.notify();
    return true;
  }

  async updateTripStatus(bookingIdOrRef: string, status: Booking['status'] | string): Promise<boolean> {
    const bIdx = this.bookings.findIndex(b => b.id === bookingIdOrRef || b.referenceNumber === bookingIdOrRef);
    if (bIdx === -1) return false;

    const b = this.bookings[bIdx];
    const rawStatus = (status || '').toLowerCase();
    
    let normalizedStatus: Booking['status'] = 'confirmed';
    if (rawStatus === 'completed' || rawStatus.includes('complete')) {
      normalizedStatus = 'completed';
    } else if (rawStatus === 'in_progress' || rawStatus === 'started' || rawStatus.includes('start')) {
      normalizedStatus = 'started';
    } else if (rawStatus === 'arrived') {
      normalizedStatus = 'arrived';
    } else if (rawStatus === 'driver_en_route' || rawStatus.includes('route')) {
      normalizedStatus = 'driver_en_route';
    } else if (rawStatus === 'driver_assigned' || rawStatus === 'assigned') {
      normalizedStatus = 'driver_assigned';
    } else if (rawStatus === 'cancelled') {
      normalizedStatus = 'cancelled';
    }

    b.status = normalizedStatus;
    (b as any).bookingStatus = normalizedStatus.toUpperCase();
    b.updatedAt = new Date().toISOString();

    if (normalizedStatus === 'completed') {
      b.paymentStatus = 'paid';
      // Credit driver stats
      if (b.assignedDriverId) {
        const d = this.drivers.find(drv => drv.id === b.assignedDriverId || drv.phone === b.assignedDriverId);
        if (d) {
          d.totalTrips = (d.totalTrips || 0) + 1;
        }
      }
    }

    this.bookings[bIdx] = { ...b };
    await this.persist();
    this.notify();
    return true;
  }

  // ==========================================
  // DRIVER QUERY METHODS
  // ==========================================

  getDrivers(): any[] {
    return [...this.drivers];
  }

  getDriverOffer(driverPhone: string): TripOffer | null {
    const cleanP = driverPhone.replace(/\D/g, '').slice(-10);
    // Find any booking assigned to this chauffeur that is in 'driver_assigned' stage (pending driver acceptance)
    const match = this.bookings.find(b => {
      const isMyDriver = b.assignedDriverId === `drv_${cleanP}` || (b as any).assignedDriverPhone === cleanP;
      const s = (b.status || '').toLowerCase();
      const bs = ((b as any).bookingStatus || '').toLowerCase();
      return isMyDriver && (s === 'driver_assigned' || s === 'assigned' || bs === 'ASSIGNED');
    });

    if (!match) return null;

    const totalFare = Number(match.fareBreakdown?.totalFare || (match as any).price || 2198);
    const estEarnings = Math.round(totalFare * 0.85);

    return {
      id: `offer_${match.id || match.referenceNumber}`,
      bookingReference: match.referenceNumber,
      pickupCity: match.pickupCity,
      pickupAddress: match.pickupAddress || 'Patna Junction, Gate 1',
      dropCity: match.dropCity,
      dropAddress: match.dropAddress || `${match.dropCity} Main Chowk`,
      distanceKm: match.fareBreakdown?.distanceKm || 104,
      pickupDate: match.pickupDate,
      pickupTime: match.pickupTime,
      cabTier: match.cabTier,
      cabName: match.cabName,
      passengerName: match.passengerName,
      passengerPhone: match.passengerPhone,
      estimatedEarnings: estEarnings,
      totalFare,
      collectFromPassenger: totalFare,
      expiresInSeconds: 30,
      receivedAt: new Date().toISOString()
    };
  }

  getDriverActiveTrip(driverPhone: string): Booking | null {
    const cleanP = driverPhone.replace(/\D/g, '').slice(-10);
    const match = this.bookings.find(b => {
      const isMyDriver = b.assignedDriverId === `drv_${cleanP}` || (b as any).assignedDriverPhone === cleanP;
      const s = (b.status || '').toLowerCase();
      const bs = ((b as any).bookingStatus || '').toLowerCase();
      const isActiveState = ['started', 'in_progress', 'arrived', 'driver_en_route'].includes(s) ||
                            ['started', 'in_progress', 'arrived', 'on the way'].includes(bs);
      return isMyDriver && isActiveState;
    });
    return match || null;
  }

  async verifyDriver(driverIdOrPhone: string, status: 'approved' | 'rejected' | 'needs_changes', notes?: string): Promise<boolean> {
    const cleanP = driverIdOrPhone.replace(/\D/g, '').slice(-10);
    const dIdx = this.drivers.findIndex(d => d.id === driverIdOrPhone || d.phone === driverIdOrPhone || d.phone === cleanP);
    if (dIdx === -1) return false;

    const isApproved = status === 'approved';
    this.drivers[dIdx] = {
      ...this.drivers[dIdx],
      isVerified: isApproved,
      status: isApproved ? 'approved' : status,
      verificationNotes: notes || this.drivers[dIdx].verificationNotes
    };

    await this.persist();
    this.notify();
    return true;
  }

  async toggleDriverDuty(driverPhone: string, isOnline: boolean): Promise<boolean> {
    const cleanP = driverPhone.replace(/\D/g, '').slice(-10);
    const dIdx = this.drivers.findIndex(d => d.phone === driverPhone || d.phone === cleanP);
    if (dIdx === -1) return false;

    this.drivers[dIdx] = {
      ...this.drivers[dIdx],
      dutyStatus: isOnline ? 'ON_DUTY' : 'OFF_DUTY',
      isDutyOnline: isOnline,
      isAvailable: isOnline
    };

    await this.persist();
    this.notify();
    return true;
  }

  async registerDriver(data: any): Promise<any> {
    const cleanP = (data.phone || '').replace(/\D/g, '').slice(-10);
    const newDriver = {
      id: `drv_${cleanP}`,
      name: data.fullName || 'New Driver',
      fullName: data.fullName || 'New Driver',
      phone: cleanP,
      vehicleModel: data.vehicleModel || 'Commercial Taxi',
      vehicleNumber: data.vehiclePlateNumber || 'Plate Pending',
      fleetTier: 'sedan',
      licenseNumber: data.drivingLicenceNumber || 'BR-Pending',
      rating: 5.0,
      totalTrips: 0,
      isVerified: false,
      status: 'pending',
      dutyStatus: 'OFF_DUTY',
      isDutyOnline: false,
      isAvailable: false,
      documents: {
        drivingLicenceNumber: data.drivingLicenceNumber,
        vehiclePlateNumber: data.vehiclePlateNumber,
        vehicleModel: data.vehicleModel
      }
    };

    this.drivers = [newDriver, ...this.drivers.filter(d => d.phone !== cleanP)];
    await this.persist();
    this.notify();
    return newDriver;
  }

  updateDriverLocation(driverPhoneOrId: string, coords: { lat: number; lng: number; heading?: number }): void {
    const cleanP = driverPhoneOrId.replace(/\D/g, '').slice(-10);
    const driver = this.drivers.find(d => d.id === driverPhoneOrId || d.phone === driverPhoneOrId || d.phone === cleanP);
    if (driver) {
      driver.currentLat = coords.lat;
      driver.currentLng = coords.lng;
      driver.heading = coords.heading || 0;
      driver.lastLocationUpdate = new Date().toISOString();
    }
    const activeBooking = this.bookings.find(b => 
      (b.assignedDriverId === driverPhoneOrId || b.assignedDriverId === `drv_${cleanP}` || (b as any).assignedDriverPhone === cleanP) &&
      !['completed', 'cancelled'].includes((b.status || '').toLowerCase())
    );
    if (activeBooking) {
      if (!activeBooking.driver) {
        activeBooking.driver = {
          driverId: driver ? driver.id : `drv_${cleanP}`,
          driverName: driver ? driver.name : 'Assigned Chauffeur',
          driverPhone: cleanP,
          driverRating: 4.9,
          totalTripsCompleted: 45,
          vehicleMake: 'Maruti',
          vehicleModel: driver ? driver.vehicleModel : 'Prime Sedan',
          vehiclePlateNumber: driver ? driver.vehicleNumber : 'BR 01 PB 8291',
          vehicleColor: 'White',
          assignedAt: new Date().toISOString(),
          currentLat: coords.lat,
          currentLng: coords.lng
        };
      } else {
        activeBooking.driver.currentLat = coords.lat;
        activeBooking.driver.currentLng = coords.lng;
      }
    }
    this.notify();
  }
}

export const FleetSyncService = new FleetSyncManager();
