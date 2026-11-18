/**
 * OneWayTaxiBihar Shared Domain Types
 * Shared between Passenger App and Driver App
 */

export type TripType = 'one-way' | 'round-trip';

export type CabTierId = 'hatchback' | 'sedan' | 'suv' | 'sedan_prime' | 'innova_crysta';

export interface CabTier {
  id: CabTierId;
  title: string;
  models: string;
  price: number;
  badge: string;
  pax: string;
  bags: string;
  ac: boolean;
  driverAllowance?: number;
  tollEstimate?: number;
}

export type BookingStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'driver_en_route'
  | 'arrived'
  | 'started'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type PaymentMethod = 'driver_cash' | 'driver_upi' | 'advance_token' | 'full_prepaid' | 'advance_15_razorpay' | 'full_online_razorpay';
export type PaymentStatus = 'pending' | 'partially_paid' | 'completed' | 'refunded' | 'failed' | 'paid' | string;

export interface FareBreakdown {
  baseFare: number;
  distanceKm: number;
  durationHours: number;
  perKmRate: number;
  driverAllowance: number;
  tollCharges: number;
  stateTaxPermit: number;
  gstAmount: number;
  nightCharge: number;
  waitingChargePerMin: number;
  totalFare: number;
  advancePayable: number;
  balancePayableToDriver: number;
  currency: string;
}

export interface DriverAssignment {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPhotoUrl?: string;
  driverRating: number;
  totalTripsCompleted: number;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  vehicleColor: string;
  currentLat?: number;
  currentLng?: number;
  assignedAt: string;
}

export interface Booking {
  id: string;
  referenceNumber: string; // e.g. OTB-829142
  passengerName: string;
  passengerPhone: string;
  pickupCity: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropCity: string;
  dropAddress: string;
  dropLat?: number;
  dropLng?: number;
  tripType: TripType;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  passengerCount: number;
  cabTier: CabTierId;
  cabName: string;
  fareBreakdown: FareBreakdown;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  advancePaid?: number;
  balanceDue?: number;
  paymentTxnId?: string;
  status: BookingStatus;
  startOtp?: string; // 4-digit ride start OTP given to passenger
  driver?: DriverAssignment;
  assignedDriverId?: string | null;
  assignedDriverName?: string | null;
  assignedDriverPhone?: string | null;
  assignedDriverCarNo?: string | null;
  bookingStatus?: string;
  bookingId?: string;
  source?: string;
  bookingSource?: string;
  channel?: string;
  isApp?: boolean;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  notes?: string;
}

export type DriverVerificationStatus = 'unapplied' | 'pending' | 'approved' | 'needs_changes' | 'rejected';

export interface DriverDocuments {
  drivingLicenceNumber: string;
  drivingLicenceExpiry: string;
  drivingLicenceFrontUrl?: string;
  drivingLicenceBackUrl?: string;
  aadhaarNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlateNumber: string;
  vehicleRcUrl?: string;
  permitNumber?: string;
  permitExpiry?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  upiId?: string;
  notes?: string;
}

export interface DriverProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  profilePhotoUrl?: string;
  verificationStatus: DriverVerificationStatus;
  documents: DriverDocuments;
  rating: number;
  totalTrips: number;
  isDutyOnline: boolean;
  currentCity?: string;
  currentLat?: number;
  currentLng?: number;
  lastActive: string;
  walletBalance: number;
}

export interface TripOffer {
  id: string;
  bookingReference: string;
  pickupCity: string;
  pickupAddress: string;
  dropCity: string;
  dropAddress: string;
  distanceKm: number;
  pickupDate: string;
  pickupTime: string;
  cabTier: CabTierId;
  cabName: string;
  passengerName: string;
  passengerPhone: string;
  estimatedEarnings: number;
  totalFare: number;
  collectFromPassenger: number;
  expiresInSeconds: number;
  receivedAt: string;
  tripType?: string;
}

export interface DriverEarningsLedger {
  todayEarnings: number;
  weekEarnings: number;
  totalEarnings: number;
  completedTripsCount: number;
  payoutsPending: number;
  history: Array<{
    id: string;
    bookingReference: string;
    date: string;
    amount: number;
    platformFee: number;
    netEarnings: number;
    paymentMode: 'cash' | 'upi' | 'bank_transfer';
    status: 'settled' | 'pending';
  }>;
}

export interface UserSession {
  token: string;
  phone: string;
  role: 'passenger' | 'driver' | 'admin';
  name?: string;
  expiresAt: string;
}

export interface AdminOperator {
  id: string;
  username: string;
  name: string;
  role: 'owner' | 'manager' | 'dispatcher' | 'admin' | 'super_admin';
  phone?: string;
}

export interface AdminMetrics {
  totalBookings: number;
  activeRides: number;
  activeDrivers: number;
  pendingApplications: number;
  todayRevenue: number;
  completedTrips: number;
}

