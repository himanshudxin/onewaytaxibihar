/**
 * Live Trip Tracking & Verification Engine
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Real-time database status sync, verified lifecycle updates, and passenger privacy protection.
 */

class TripTrackingManager {
  constructor() {
    this.currentTrip = null;
    this.pollInterval = null;
    this.statusMap = {
      "NEW": { title: "Booking Request Received", subtitle: "Our dispatch desk is reviewing vehicle availability in your area.", progress: 15 },
      "REQUESTED": { title: "Booking Request Received", subtitle: "Our dispatch desk is assigning the best commercial cab for your route.", progress: 20 },
      "CONFIRMED": { title: "Booking Confirmed", subtitle: "Cab confirmed. Dedicated chauffeur being dispatched to your location.", progress: 35 },
      "DRIVER ASSIGNED": { title: "Chauffeur Assigned", subtitle: "Professional driver assigned with verified commercial permit & AC cab.", progress: 50 },
      "DRIVER_ASSIGNED": { title: "Chauffeur Assigned", subtitle: "Professional driver assigned with verified commercial permit & AC cab.", progress: 50 },
      "ACCEPTED": { title: "Chauffeur Confirmed & Dispatched", subtitle: "Driver has accepted your trip and is heading to your doorstep.", progress: 65 },
      "ON THE WAY": { title: "Chauffeur En Route", subtitle: "Driver is on the way to your pickup doorstep. AC pre-cooling on.", progress: 75 },
      "DRIVER ARRIVING": { title: "Chauffeur Arriving", subtitle: "Chauffeur is arriving at your doorstep in Patna/Bihar.", progress: 80 },
      "ARRIVED": { title: "Chauffeur Arrived at Pickup Doorstep", subtitle: "Please verify cab number and share your 4-digit OTP to start journey.", progress: 85 },
      "TRIP STARTED": { title: "Trip In Progress • Cruising on Highway", subtitle: "Safe highway journey with FASTag automated clearance and clean AC.", progress: 95 },
      "COMPLETED": { title: "Trip Safely Completed", subtitle: "Arrived at destination. Thank you for choosing OneWayTaxiBihar!", progress: 100 },
      "CANCELLED": { title: "Trip Cancelled", subtitle: "Booking was cancelled. ₹0 cancellation fee charged.", progress: 0 }
    };
  }

  async startTrip(booking) {
    if (!booking) return;
    this.currentTrip = booking;

    const modal = document.getElementById("trip-tracking-modal");
    if (!modal) return;

    this.renderTrackingModal();
    modal.classList.add("active");

    // Fetch initial status immediately from server
    await this.fetchLiveStatus();

    // Poll server every 10 seconds for real status updates
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.fetchLiveStatus();
    }, 10000);
  }

  stopTracking() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    const modal = document.getElementById("trip-tracking-modal");
    if (modal) modal.classList.remove("active");
  }

  async fetchLiveStatus() {
    if (!this.currentTrip) return;
    const bId = this.currentTrip.bookingId || this.currentTrip.tripId;
    const phone = this.currentTrip.passengerPhone || (window.currentUser ? window.currentUser.phone : "");

    try {
      if (window.ApiClient && ApiClient.getTrackingStatus) {
        const res = await ApiClient.getTrackingStatus(bId, phone);
        if (res && res.success && res.trip) {
          this.syncTripState(res.trip);
        }
      }
    } catch (err) {
      console.warn("[Tracking] Status poll error:", err.message);
    }
  }

  syncTripState(serverTrip) {
    if (!serverTrip) return;
    this.currentTrip = { ...this.currentTrip, ...serverTrip };
    this.updateTrackingUI();
  }

  renderTrackingModal() {
    if (!this.currentTrip) return;
    const b = this.currentTrip;
    const d = b.driver || b.driverDetails || {
      name: "Assigning Chauffeur...",
      vehicleModel: b.cabTier ? `${b.cabTier.toUpperCase()} Cab` : "Commercial Cab",
      vehicleNumber: "Dispatching",
      rating: 4.9,
      trips: 100
    };

    const bId = b.bookingId || b.tripId || "OTB-BOOKING";
    const otp = b.tripOtp || "---";

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt("tracking-trip-id", bId);
    setTxt("tracking-otp", otp);
    setTxt("tracking-route-label", `${b.originCity || b.origin || 'Patna'} ➔ ${b.destCity || b.destination || 'Bihar'}`);
    setTxt("tracking-pickup-address", b.pickupAddress || `${b.originCity || 'Patna'}, Bihar`);
    setTxt("tracking-drop-address", b.dropAddress || `${b.destCity || 'Destination'}, Bihar`);
    setTxt("tracking-fare-total", `₹${Number(b.totalFare || b.finalFare || 2198).toLocaleString("en-IN")}`);
    setTxt("tracking-payment-method", b.paymentMethod || "Cash to Chauffeur");

    // Driver details
    setTxt("tracking-driver-avatar", (d.name || "D").charAt(0).toUpperCase());
    setTxt("tracking-driver-name", d.name || "Dispatch Desk Assigning Driver");
    setTxt("tracking-driver-badge", d.phone ? "Verified Chauffeur" : "Dispatch in Progress");
    setTxt("tracking-driver-rating", d.phone ? `★ ${d.rating || 4.9} Verified` : "Assigned shortly");
    setTxt("tracking-car-details", `${d.vehicleModel || 'Commercial Cab'} • ${d.vehicleNumber || 'Plate Assigned on Confirmation'}`);
    setTxt("tracking-driver-languages", "Bhojpuri, Hindi, Maithili");

    this.updateTrackingUI();
  }

  updateTrackingUI() {
    if (!this.currentTrip) return;
    const statusUpper = (this.currentTrip.bookingStatus || "NEW").toUpperCase();
    const cur = this.statusMap[statusUpper] || {
      title: `Trip Status: ${statusUpper}`,
      subtitle: "OneWayTaxiBihar centralized dispatch monitoring your ride.",
      progress: 50
    };

    const statusTitle = document.getElementById("tracking-status-title");
    const statusSubtitle = document.getElementById("tracking-status-subtitle");
    const progressBar = document.getElementById("tracking-progress-bar-fill");
    const carIcon = document.getElementById("tracking-moving-car-icon");

    if (statusTitle) statusTitle.textContent = cur.title;
    if (statusSubtitle) statusSubtitle.textContent = cur.subtitle;
    if (progressBar) progressBar.style.width = `${cur.progress}%`;
    if (carIcon) carIcon.style.left = `${Math.min(cur.progress, 94)}%`;

    if (statusUpper === "COMPLETED") {
      const invoiceBtn = document.getElementById("open-invoice-btn");
      if (invoiceBtn) invoiceBtn.style.display = "inline-flex";
      if (this.pollInterval) clearInterval(this.pollInterval);
    }
  }

  shareTripWhatsApp() {
    if (!this.currentTrip) return;
    const b = this.currentTrip;
    const d = b.driver || b.driverDetails || {};
    const text = encodeURIComponent(
      `*OneWayTaxiBihar Live Trip Tracking*\n` +
      `Booking ID: ${b.bookingId || b.tripId}\n` +
      `Route: ${b.originCity || b.origin} ➔ ${b.destCity || b.destination}\n` +
      `Chauffeur: ${d.name || 'Assigned'} (${d.vehicleNumber || 'Verified'})\n` +
      `Trip OTP: ${b.tripOtp || 'N/A'}\n` +
      `Total Fare: ₹${b.totalFare || b.finalFare} (All-Inclusive)\n` +
      `Live status on onewaytaxibihar.com`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  triggerSOS() {
    alert("EMERGENCY SAFETY ALERT\n\nBihar State Emergency Response Support System (ERSS-112) is available immediately. OneWayTaxiBihar 24x7 Safety Helpdesk: +91 80021 41816.");
  }

  simulateCaptainCall() {
    if (!this.currentTrip) return;
    const d = this.currentTrip.driver || this.currentTrip.driverDetails;
    if (d && d.phone) {
      window.location.href = `tel:${d.phone.replace(/\D/g, '')}`;
    } else {
      window.location.href = "tel:8002141816";
    }
  }

  openInvoiceModal() {
    if (!this.currentTrip) return;
    const bId = this.currentTrip.bookingId || this.currentTrip.tripId;
    if (window.openInvoiceModal) {
      window.openInvoiceModal();
      const inputId = document.getElementById("invoice-lookup-id");
      const inputPhone = document.getElementById("invoice-lookup-phone");
      if (inputId) inputId.value = bId;
      if (inputPhone && this.currentTrip.passengerPhone) {
        inputPhone.value = this.currentTrip.passengerPhone.replace(/\D/g, '').slice(-10);
      }
      if (window.lookupTaxInvoice) window.lookupTaxInvoice();
    }
  }

  printInvoice() {
    window.print();
  }
}

// Global singleton instance
window.tripTracker = new TripTrackingManager();
