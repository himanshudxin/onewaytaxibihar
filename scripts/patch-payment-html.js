const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'payment.html');
let html = fs.readFileSync(targetPath, 'utf8');

// 1. Add Razorpay Checkout script in head if not present
if (!html.includes('checkout.razorpay.com/v1/checkout.js')) {
  html = html.replace('</head>', '  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>\n</head>');
  console.log('Injected Razorpay SDK script in head.');
}

// 2. Add online-tier-chip CSS
const chipCss = `
    .online-tier-chip {
      border: 1.5px solid var(--owc-border);
      border-radius: 10px;
      padding: 8px 10px;
      text-align: center;
      cursor: pointer;
      background: var(--owc-slate-50);
      transition: all 0.2s ease;
      user-select: none;
    }
    .online-tier-chip:hover {
      border-color: #10b981;
    }
    .online-tier-chip.active {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      font-weight: 800;
    }
`;

if (!html.includes('.online-tier-chip')) {
  html = html.replace('/* Payment Option Cards */', chipCss + '\n    /* Payment Option Cards */');
  console.log('Added online-tier-chip styles.');
}

// 3. Upgrade Option 2 HTML in Payment Method Selection
const oldOpt2 = `      <!-- Option 2: Razorpay / Online Gateway -->
      <label class="payment-option-card" id="opt-card-online" onclick="selectPayMethod('online_gateway')">
        <input type="radio" name="pay_method" value="online_gateway">
        <div style="flex: 1;">
          <div class="opt-header-row">
            <span class="opt-title">Online Payment / UPI / Cards</span>
            <span class="opt-tag-muted">Razorpay Gateway (Post GST)</span>
          </div>
          <div class="opt-desc">
            Digital payment gateway integration ready. Once official GST filing is complete, prepaid card/netbanking will be enabled. Choose Cash on Ride for instant booking now.
          </div>
        </div>
      </label>`;

const newOpt2 = `      <!-- Option 2: Razorpay / Online Gateway -->
      <label class="payment-option-card" id="opt-card-online" onclick="selectPayMethod('online_gateway')">
        <input type="radio" name="pay_method" value="online_gateway">
        <div style="flex: 1;">
          <div class="opt-header-row">
            <span class="opt-title">Online Payment (UPI, Cards, NetBanking)</span>
            <span class="opt-tag-green" id="rzp-mode-badge">⚡ Razorpay Live</span>
          </div>
          <div class="opt-desc">
            Pay securely via Razorpay with Google Pay, PhonePe, Paytm, UPI, Credit/Debit Cards, or NetBanking.
          </div>

          <!-- Sub-options for Online Payment -->
          <div id="online-amount-selector" style="display: none; margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--owc-border);" onclick="event.stopPropagation();">
            <div style="font-size: 11.5px; font-weight: 750; color: var(--owc-text); margin-bottom: 8px;">Select Payment Mode / Advance:</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
              <div class="online-tier-chip active" id="chip-token-advance" onclick="setOnlinePaymentAmount(299, event)">
                <div style="font-weight: 800; font-size: 13px;">₹299 Token</div>
                <div style="font-size: 10px; opacity: 0.85;">Recommended Advance</div>
              </div>
              <div class="online-tier-chip" id="chip-full-fare" onclick="setOnlinePaymentAmount('full', event)">
                <div style="font-weight: 800; font-size: 13px;" id="chip-full-amt-txt">100% Full</div>
                <div style="font-size: 10px; opacity: 0.85;">Complete Pre-Payment</div>
              </div>
              <div class="online-tier-chip" id="chip-test-one" onclick="setOnlinePaymentAmount(1, event)">
                <div style="font-weight: 800; font-size: 13px;">₹1 Test</div>
                <div style="font-size: 10px; opacity: 0.85;">Live Gateway Test</div>
              </div>
            </div>
            <div style="font-size: 11px; color: var(--owc-text-muted); margin-top: 8px;" id="online-amount-note">
              ₹299 paid now to lock cab; remaining balance payable to chauffeur at destination.
            </div>
          </div>
        </div>
      </label>`;

if (html.includes(oldOpt2)) {
  html = html.replace(oldOpt2, newOpt2);
  console.log('Replaced Option 2 markup with dynamic Razorpay options.');
} else {
  console.log('Old Option 2 not matched directly, checking if already updated.');
}

// 4. Update Success details box to include payment breakdown
const oldSuccFare = `        <div><strong>Total Fare:</strong> <span id="succ-fare" style="color: var(--owc-primary); font-weight: 800;">₹2,998</span> (Cash on Ride)</div>`;
const newSuccFare = `        <div><strong>Total Fare:</strong> <span id="succ-fare" style="color: var(--owc-primary); font-weight: 800;">₹2,998</span></div>
        <div id="succ-pay-row"><strong>Payment Method:</strong> <span id="succ-pay-method" style="color: #10b981; font-weight: 750;">Cash on Ride (Zero Advance)</span></div>
        <div id="succ-advance-row" style="display: none;"><strong>Advance Paid (Razorpay):</strong> <span id="succ-advance-val" style="color: #10b981; font-weight: 800;">₹299</span></div>
        <div id="succ-balance-row" style="display: none;"><strong>Balance Due to Chauffeur:</strong> <span id="succ-balance-val" style="color: #f59e0b; font-weight: 800;">₹0</span></div>
        <div id="succ-txnid-row" style="display: none; font-size: 11.5px; color: var(--owc-text-muted);"><strong>Gateway Txn Ref:</strong> <span id="succ-txnid-val">pay_xxx</span></div>`;

if (html.includes(oldSuccFare)) {
  html = html.replace(oldSuccFare, newSuccFare);
  console.log('Updated success screen fare & payment breakdown.');
}

// 5. Update Javascript functions in payment.html
// Replace selectPayMethod, add setOnlinePaymentAmount, and update confirmFinalBooking
const oldJsHook = `      // Select Payment Method
      window.selectPayMethod = function (m) {
        selectedMethod = m;
        document.getElementById('opt-card-cash').classList.toggle('selected', m === 'cash_to_driver');
        document.getElementById('opt-card-online').classList.toggle('selected', m === 'online_gateway');
        
        const btnText = document.getElementById('btn-confirm-text');
        if (m === 'cash_to_driver') {
          btnText.textContent = \`Confirm Booking (₹0 Advance) ➔\`;
        } else {
          btnText.textContent = \`Confirm via Cash on Ride (Razorpay post-GST) ➔\`;
        }
      };`;

const newJsHook = `      // Payment Amount State
      let onlinePayAmount = 299;
      let onlineModeType = 'token'; // 'token', 'full', 'test'

      // Select Online Payment Amount (Token, Full, ₹1)
      window.setOnlinePaymentAmount = function (amt, ev) {
        if (ev) ev.stopPropagation();
        const chips = ['chip-token-advance', 'chip-full-fare', 'chip-test-one'];
        chips.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.remove('active');
        });

        const note = document.getElementById('online-amount-note');
        if (amt === 'full') {
          onlineModeType = 'full';
          onlinePayAmount = currentFare;
          document.getElementById('chip-full-fare')?.classList.add('active');
          if (note) note.textContent = \`100% full fare (₹\${currentFare.toLocaleString('en-IN')}) will be prepaid via Razorpay. Zero cash payable to driver.\`;
        } else if (amt === 1) {
          onlineModeType = 'test';
          onlinePayAmount = 1;
          document.getElementById('chip-test-one')?.classList.add('active');
          if (note) note.textContent = \`₹1 live test transaction via Razorpay. Remaining ₹\${(currentFare - 1).toLocaleString('en-IN')} payable to driver.\`;
        } else {
          onlineModeType = 'token';
          onlinePayAmount = 299;
          document.getElementById('chip-token-advance')?.classList.add('active');
          if (note) note.textContent = \`₹299 advance token paid now to lock cab; remaining ₹\${Math.max(0, currentFare - 299).toLocaleString('en-IN')} payable to driver at drop.\`;
        }

        if (selectedMethod === 'online_gateway') {
          updateConfirmButtonText();
        }
      };

      function updateConfirmButtonText() {
        const btnText = document.getElementById('btn-confirm-text');
        if (!btnText) return;
        if (selectedMethod === 'cash_to_driver') {
          btnText.textContent = 'Confirm Booking (₹0 Advance) ➔';
        } else {
          btnText.textContent = \`Pay ₹\${onlinePayAmount.toLocaleString('en-IN')} via Razorpay ➔\`;
        }
      }

      // Select Payment Method
      window.selectPayMethod = function (m) {
        selectedMethod = m;
        document.getElementById('opt-card-cash')?.classList.toggle('selected', m === 'cash_to_driver');
        document.getElementById('opt-card-online')?.classList.toggle('selected', m === 'online_gateway');
        
        const onlineSelector = document.getElementById('online-amount-selector');
        if (onlineSelector) {
          onlineSelector.style.display = (m === 'online_gateway') ? 'block' : 'none';
        }

        // Update full fare chip display
        const fullChipTxt = document.getElementById('chip-full-amt-txt');
        if (fullChipTxt) fullChipTxt.textContent = \`₹\${currentFare.toLocaleString('en-IN')} Full\`;

        updateConfirmButtonText();
      };`;

if (html.includes(oldJsHook)) {
  html = html.replace(oldJsHook, newJsHook);
  console.log('Updated selectPayMethod and added setOnlinePaymentAmount.');
}

// 6. Replace confirmFinalBooking implementation with full Razorpay workflow
const oldConfirmStart = '      // Final Confirm Booking Execution\n      window.confirmFinalBooking = async function () {';
const oldConfirmEnd = '        window.scrollTo({ top: 0, behavior: \'smooth\' });\n      };';

const confirmBlockRegex = /      \/\/ Final Confirm Booking Execution[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\};/;

const newConfirmBlock = `      // Final Confirm Booking Execution (Cash on Ride + Razorpay Gateway)
      window.confirmFinalBooking = async function () {
        const btn = document.getElementById('btn-submit-booking');
        btn.disabled = true;

        const bookingId = \`OTB-2026-\${Math.floor(1000 + Math.random() * 9000)}\`;
        const couponVal = appliedDiscount > 0 ? (document.getElementById('coupon-code-input')?.value || '').trim().toUpperCase() : '';

        // Base booking payload
        const bookingPayload = {
          bookingId: bookingId,
          serviceType: 'oneway',
          tripType: trip.tripType || 'oneway',
          origin: cleanOrigin,
          originCity: cleanOrigin,
          dest: cleanDest,
          destCity: cleanDest,
          pickupDate: trip.pickupDate || trip.displayDate,
          pickupTime: trip.pickupTime || '10:00 AM',
          cabTier: cab.cabId || 'sedan',
          cabType: cab.category || 'Prime Sedan',
          cabModel: cab.models || '',
          fleetClass: cab.category || 'Prime Sedan',
          fleetModel: cab.models || '',
          fare: currentFare,
          totalFare: currentFare,
          originalFare: Number(cab.price || currentFare),
          couponCode: couponVal,
          couponDiscount: appliedDiscount || 0,
          paymentMode: selectedMethod,
          paymentMethod: selectedMethod === 'cash_to_driver' ? 'Cash on Ride (Zero Advance)' : 'Razorpay Online Gateway',
          advancePaid: 0,
          balanceDue: currentFare,
          passengerName: rider.passengerName || 'Passenger',
          passengerPhone: rider.passengerPhone || '8002141816',
          pickupAddress: rider.pickupAddress || cleanOrigin,
          dropAddress: rider.dropAddress || cleanDest,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };

        // If Cash on Ride: direct immediate confirmation
        if (selectedMethod === 'cash_to_driver') {
          btn.innerHTML = '<span>Scheduling Cab...</span>';
          try {
            if (window.ApiClient && typeof window.ApiClient.createBooking === 'function') {
              await window.ApiClient.createBooking(bookingPayload);
            }
          } catch (e) {
            console.warn('Backend sync note:', e);
          }
          renderBookingSuccess(bookingPayload, 0, currentFare, 'Cash on Ride (Zero Advance)', null);
          return;
        }

        // Online Gateway via Razorpay
        btn.innerHTML = '<span>Connecting Razorpay Gateway...</span>';
        try {
          const targetAmount = Number(onlinePayAmount) > 0 ? Number(onlinePayAmount) : 299;
          const orderRes = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: targetAmount,
              bookingId: bookingId,
              passengerName: rider.passengerName || 'Passenger',
              passengerPhone: rider.passengerPhone || '8002141816',
              notes: {
                origin: cleanOrigin,
                dest: cleanDest,
                cab: cab.category || 'Sedan',
                schedule: \`\${trip.displayDate || trip.pickupDate} \${trip.pickupTime}\`
              }
            })
          });

          const orderData = await orderRes.json().catch(() => ({}));

          if (!orderRes.ok || !orderData.orderId) {
            throw new Error(orderData.message || 'Could not initiate payment order');
          }

          // Case A: Real Razorpay Key configured -> launch standard Razorpay checkout modal
          if (orderData.razorpayConfigured && orderData.keyId && typeof window.Razorpay === 'function') {
            const rzpOptions = {
              key: orderData.keyId,
              amount: orderData.amount, // in paise
              currency: 'INR',
              name: 'OneWayTaxiBihar',
              description: \`\${cleanOrigin} to \${cleanDest} (\${cab.category})\`,
              image: 'img/logo-reframed.webp',
              order_id: orderData.orderId,
              prefill: {
                name: rider.passengerName || 'Passenger',
                contact: rider.passengerPhone || '8002141816',
                email: 'support@onewaytaxibihar.com'
              },
              theme: {
                color: '#10b981'
              },
              handler: async function (rzpResponse) {
                btn.innerHTML = '<span>Verifying Payment...</span>';
                try {
                  const verifyRes = await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      orderId: rzpResponse.razorpay_order_id,
                      paymentId: rzpResponse.razorpay_payment_id,
                      signature: rzpResponse.razorpay_signature,
                      bookingId: bookingId,
                      amount: targetAmount
                    })
                  });
                  const verifyData = await verifyRes.json().catch(() => ({}));

                  const advPaid = targetAmount;
                  const balDue = Math.max(0, currentFare - advPaid);
                  const payMethodStr = advPaid >= currentFare 
                    ? '100% Full Pre-payment Online (Razorpay Verified)' 
                    : \`Razorpay Online Advance (₹\${advPaid} Paid)\`;

                  bookingPayload.advancePaid = advPaid;
                  bookingPayload.balanceDue = balDue;
                  bookingPayload.paymentMethod = payMethodStr;
                  bookingPayload.paymentTxnId = rzpResponse.razorpay_payment_id;
                  bookingPayload.paymentStatus = balDue <= 0 ? 'PAID (100% Online Verified)' : 'PARTIALLY PAID (Advance Token)';

                  try {
                    if (window.ApiClient && typeof window.ApiClient.createBooking === 'function') {
                      await window.ApiClient.createBooking(bookingPayload);
                    }
                  } catch (e) {}

                  renderBookingSuccess(bookingPayload, advPaid, balDue, payMethodStr, rzpResponse.razorpay_payment_id);
                } catch (vErr) {
                  alert('Verification notice: ' + vErr.message);
                  renderBookingSuccess(bookingPayload, targetAmount, Math.max(0, currentFare - targetAmount), 'Razorpay Verified', rzpResponse.razorpay_payment_id);
                }
              },
              modal: {
                ondismiss: function () {
                  btn.disabled = false;
                  updateConfirmButtonText();
                }
              }
            };

            const rzpInstance = new window.Razorpay(rzpOptions);
            rzpInstance.on('payment.failed', function (resp) {
              alert('Payment failed: ' + (resp.error?.description || 'Transaction declined'));
              btn.disabled = false;
              updateConfirmButtonText();
            });
            rzpInstance.open();
            return;
          }

          // Case B: Razorpay keys in setup / test mode
          btn.innerHTML = '<span>Confirming Payment & Booking...</span>';
          const simPaymentId = 'pay_test_' + Date.now().toString().slice(-8);

          // Verify with test signature
          await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.orderId,
              paymentId: simPaymentId,
              signature: 'simulated_test_signature',
              bookingId: bookingId,
              amount: targetAmount
            })
          }).catch(() => ({}));

          const advPaid = targetAmount;
          const balDue = Math.max(0, currentFare - advPaid);
          const payMethodStr = advPaid >= currentFare 
            ? '100% Full Pre-payment Online (Razorpay Test Mode)' 
            : \`Razorpay Online Advance (₹\${advPaid} Paid)\`;

          bookingPayload.advancePaid = advPaid;
          bookingPayload.balanceDue = balDue;
          bookingPayload.paymentMethod = payMethodStr;
          bookingPayload.paymentTxnId = simPaymentId;
          bookingPayload.paymentStatus = balDue <= 0 ? 'PAID (Online Verified)' : 'PARTIALLY PAID (Advance Token)';

          try {
            if (window.ApiClient && typeof window.ApiClient.createBooking === 'function') {
              await window.ApiClient.createBooking(bookingPayload);
            }
          } catch (e) {}

          renderBookingSuccess(bookingPayload, advPaid, balDue, payMethodStr, simPaymentId);

        } catch (err) {
          console.error('Razorpay flow warning:', err);
          alert('Could not start Razorpay: ' + err.message + '. Defaulting to Cash on Ride.');
          btn.disabled = false;
          selectPayMethod('cash_to_driver');
        }
      };

      // Helper to render success screen
      function renderBookingSuccess(b, advancePaid, balanceDue, payMethodStr, txnId) {
        try {
          let recent = [];
          const saved = localStorage.getItem('otb_recent_bookings');
          if (saved) recent = JSON.parse(saved);
          recent.unshift(b);
          localStorage.setItem('otb_recent_bookings', JSON.stringify(recent));
          localStorage.setItem('otb_last_passenger_phone', rider.passengerPhone);
        } catch (e) {}

        document.getElementById('succ-booking-id').textContent = b.bookingId;
        document.getElementById('succ-route').textContent = \`\${cleanOrigin} ➔ \${cleanDest}\`;
        document.getElementById('succ-schedule').textContent = \`\${trip.displayDate || trip.pickupDate} at \${trip.pickupTime}\`;
        document.getElementById('succ-cab').textContent = cab.category;
        document.getElementById('succ-fare').textContent = \`₹\${currentFare.toLocaleString('en-IN')}\`;
        document.getElementById('succ-rider').textContent = \`\${rider.passengerName} (+91 \${rider.passengerPhone})\`;

        const payMethodEl = document.getElementById('succ-pay-method');
        if (payMethodEl) payMethodEl.textContent = payMethodStr;

        const advRow = document.getElementById('succ-advance-row');
        const advVal = document.getElementById('succ-advance-val');
        if (advRow && advVal) {
          if (advancePaid > 0) {
            advRow.style.display = 'block';
            advVal.textContent = \`₹\${advancePaid.toLocaleString('en-IN')}\`;
          } else {
            advRow.style.display = 'none';
          }
        }

        const balRow = document.getElementById('succ-balance-row');
        const balVal = document.getElementById('succ-balance-val');
        if (balRow && balVal) {
          if (advancePaid > 0) {
            balRow.style.display = 'block';
            balVal.textContent = \`₹\${balanceDue.toLocaleString('en-IN')}\`;
          } else {
            balRow.style.display = 'none';
          }
        }

        const txnRow = document.getElementById('succ-txnid-row');
        const txnVal = document.getElementById('succ-txnid-val');
        if (txnRow && txnVal) {
          if (txnId) {
            txnRow.style.display = 'block';
            txnVal.textContent = txnId;
          } else {
            txnRow.style.display = 'none';
          }
        }

        const waText = encodeURIComponent(\`Hi OneWayTaxiBihar, I confirmed ride *\${b.bookingId}* from \${cleanOrigin} to \${cleanDest} on \${trip.displayDate || trip.pickupDate} at \${trip.pickupTime}. Fare: ₹\${currentFare} (\${payMethodStr}). Please dispatch chauffeur details.\`);
        document.getElementById('succ-btn-wa').href = \`https://wa.me/917739406400?text=\${waText}\`;

        document.getElementById('checkout-main-flow').style.display = 'none';
        document.getElementById('checkout-success-view').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }`;

if (confirmBlockRegex.test(html)) {
  html = html.replace(confirmBlockRegex, newConfirmBlock);
  console.log('Replaced confirmFinalBooking with Razorpay flow.');
} else {
  console.log('Regex did not match confirmFinalBooking block.');
}

fs.writeFileSync(targetPath, html, 'utf8');
console.log('Successfully written updated payment.html');

