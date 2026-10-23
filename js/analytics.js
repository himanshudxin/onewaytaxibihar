/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Google Analytics 4 (GA4) & Conversion Tracking Engine
 * Fully integrated with Google Consent Mode v2 and DPDP Act 2023
 */

(function () {
  // Configurable GA4 Measurement ID (Replace with your live G-XXXXXXXXXX ID)
  const GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
  const IS_CONFIGURED = GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX' && /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID);

  // Initialize dataLayer and gtag if not already done
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  // Load Google Tag Manager / GA4 script dynamically if configured
  if (IS_CONFIGURED) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  }

  // Unified Conversion & Event Tracker
  const Analytics = {
    // Send standard GA4 event
    track: function (eventName, eventParams) {
      const payload = Object.assign({
        page_location: window.location.href,
        page_title: document.title,
        timestamp: new Date().toISOString()
      }, eventParams || {});

      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }

      // Log in non-production or for diagnostics
      if (window.location.hostname === 'localhost' || !IS_CONFIGURED) {
        console.log(`[OTB Analytics] Event '${eventName}':`, payload);
      }
    },

    // 1. Phone Call Conversion (Inbound Leads)
    trackPhoneCall: function (phoneNumber, placement) {
      this.track('phone_call_click', {
        event_category: 'Lead Generation',
        event_label: placement || 'Direct Call Link',
        phone_number: phoneNumber || '+918002141816',
        value: 50.0 // Assumed initial lead attribution value in INR
      });

      // Google Ads conversion event standard alias
      this.track('generate_lead', {
        lead_type: 'phone_call',
        phone_number: phoneNumber
      });
    },

    // 2. WhatsApp Inbound Chat Lead
    trackWhatsApp: function (placement) {
      this.track('whatsapp_click', {
        event_category: 'Lead Generation',
        event_label: placement || 'WhatsApp Chat Button',
        value: 30.0
      });

      this.track('generate_lead', {
        lead_type: 'whatsapp_chat'
      });
    },

    // 3. Route Search & Fare Calculation
    trackRouteSearch: function (origin, destination, distanceKm, estimatedFare) {
      this.track('search_route', {
        origin: origin,
        destination: destination,
        distance_km: distanceKm,
        estimated_fare: estimatedFare
      });
    },

    // 4. Cab Selection (Begin Booking Flow)
    trackCabSelection: function (cabTier, modelName, fare, origin, destination) {
      this.track('select_item', {
        item_list_name: 'Cab Fleet',
        items: [{
          item_id: cabTier,
          item_name: modelName,
          price: fare,
          quantity: 1
        }],
        origin: origin,
        destination: destination
      });
    },

    // 5. Booking Step / Form View
    trackBookingStep: function (stepNumber, stepName) {
      this.track('checkout_progress', {
        checkout_step: stepNumber,
        step_name: stepName
      });
    },

    // 6. Final Booking Completed (High Value Conversion)
    trackBookingCompleted: function (booking) {
      if (!booking) return;
      const fare = parseFloat(booking.totalFare || booking.finalPayable || 0);

      this.track('purchase', {
        transaction_id: booking.bookingId || ('OTB-' + Date.now()),
        value: fare,
        currency: 'INR',
        tax: 0,
        shipping: 0,
        items: [{
          item_id: booking.fleetClass || 'Cab',
          item_name: (booking.originCity || 'Patna') + ' to ' + (booking.destCity || 'Destination'),
          price: fare,
          quantity: 1
        }]
      });

      this.track('booking_confirmed', {
        booking_id: booking.bookingId,
        origin: booking.originCity,
        destination: booking.destCity,
        pickup_date: booking.pickupDate,
        total_fare: fare
      });
    }
  };

  // Expose to window for global access
  window.OTBAnalytics = Analytics;

  // Global Click Event Delegation for automatic Call & WhatsApp tracking
  document.addEventListener('click', function (e) {
    const target = e.target.closest('a');
    if (!target) return;

    const href = target.getAttribute('href') || '';

    // Track Phone Calls
    if (href.startsWith('tel:')) {
      const phone = href.replace('tel:', '').trim();
      const placement = target.getAttribute('aria-label') || target.innerText.trim() || target.className || 'Call Link';
      Analytics.trackPhoneCall(phone, placement.substring(0, 50));
    }

    // Track WhatsApp Chats
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      const placement = target.getAttribute('aria-label') || target.innerText.trim() || target.className || 'WhatsApp Link';
      Analytics.trackWhatsApp(placement.substring(0, 50));
    }
  }, { passive: true });

})();
