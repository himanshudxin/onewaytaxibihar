const fs = require('fs');

const fares = JSON.parse(fs.readFileSync('data/patna_fares.json', 'utf8'));
console.log('Loaded', fares.length, 'destinations from patna_fares.json');

// Let's build the complete upgraded fare-chart.html
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Patna One-Way &amp; Two-Way Taxi Fare Chart 2026 | Rates for 98 Destinations across Bihar, UP, Jharkhand &amp; Bengal</title>
  <meta name="description" content="Official 2026 One-Way and Round-Trip cab fare chart from Patna to 98 destinations across Bihar districts, UP, Jharkhand and Bengal. Transparent rates, per-km costing, zero return penalties, and all-inclusive toll pricing.">
  <meta name="keywords" content="patna taxi fare chart, one way cab patna rates, patna to gaya cab fare, patna to muzaffarpur cab fare, patna to varanasi cab rate, bihar outstation cab per km rate">
  <link rel="canonical" href="https://onewaytaxibihar.com/fare-chart.html">

  <!-- Open Graph -->
  <meta property="og:title" content="Patna One-Way &amp; Round-Trip Taxi Fare Chart 2026 | OneWayTaxiBihar">
  <meta property="og:description" content="View fixed, transparent one-way and two-way taxi fares from Patna to 98 destinations across Bihar, UP, Jharkhand &amp; West Bengal. Save up to ₹400 on return trips.">
  <meta property="og:url" content="https://onewaytaxibihar.com/fare-chart.html">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://onewaytaxibihar.com/img/logo-reframed.png">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">

  <!-- Google Fonts: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --primary: #059669;
      --primary-dark: #047857;
      --primary-light: #10b981;
      --primary-subtle: #ecfdf5;
      --navy: #0f172a;
      --navy-light: #1e293b;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-600: #475569;
      --slate-900: #0f172a;
      --font-main: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-main);
      color: var(--navy);
      background-color: #f8fafc;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Header */
    .site-header {
      background: #ffffff;
      border-bottom: 1px solid var(--slate-200);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .header-inner {
      max-width: 1240px;
      margin: 0 auto;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--navy);
      font-weight: 900;
      font-size: 20px;
      letter-spacing: -0.5px;
    }
    .brand-symbol {
      background: #059669;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-accent { color: #059669; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .btn-nav-outline {
      border: 1px solid var(--slate-200);
      background: white;
      color: var(--slate-600);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-nav-outline:hover { border-color: var(--primary); color: var(--primary); }
    .btn-nav-book {
      background: var(--primary);
      color: white;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-nav-book:hover { background: var(--primary-dark); }

    /* Hero */
    .fare-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 48px 20px 42px;
      text-align: center;
      position: relative;
    }
    .fare-hero-content { max-width: 900px; margin: 0 auto; }
    .fare-starting-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 16px;
    }
    .fare-title {
      font-size: clamp(26px, 4vw, 38px);
      font-weight: 900;
      letter-spacing: -0.6px;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    .fare-subtitle {
      font-size: 16px;
      color: #94a3b8;
      margin-bottom: 14px;
      font-weight: 600;
    }
    .fare-intro {
      font-size: 14px;
      color: #cbd5e1;
      max-width: 760px;
      margin: 0 auto 22px;
      line-height: 1.6;
    }
    .fare-pills-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    .fare-pill {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 650;
      color: #e2e8f0;
    }
    .fare-actions-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn-call-hero, .btn-wa-hero {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 750;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-call-hero { background: #059669; color: white; }
    .btn-call-hero:hover { background: #047857; }
    .btn-wa-hero { background: #25d366; color: white; }
    .btn-wa-hero:hover { background: #20ba59; }

    /* AI Transparency Banner */
    .ai-strip-banner {
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 14px;
      padding: 18px 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      align-items: center;
    }
    .ai-strip-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ai-strip-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    /* Main Container */
    .fare-container {
      max-width: 1240px;
      margin: -24px auto 60px;
      padding: 0 20px;
      position: relative;
      z-index: 20;
    }

    /* Filter & Controls Card */
    .fare-controls-card {
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 16px;
      padding: 20px 24px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.05);
      margin-bottom: 24px;
    }

    /* Trip Mode (One-Way vs Two-Way) Toggle */
    .trip-mode-selector-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 18px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--slate-100);
    }
    .trip-mode-toggle {
      display: inline-flex;
      background: #f1f5f9;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 4px;
      gap: 4px;
    }
    .trip-toggle-btn {
      background: transparent;
      border: none;
      padding: 9px 18px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 750;
      color: #64748b;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .trip-toggle-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .trip-toggle-btn.active.twoway {
      color: #059669;
    }
    .twoway-save-badge {
      background: #d1fae5;
      color: #059669;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 9999px;
      border: 1px solid #a7f3d0;
    }

    /* Region Filter Chips */
    .region-filter-bar {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      margin-bottom: 16px;
      scrollbar-width: thin;
    }
    .region-chip {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      padding: 7px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .region-chip:hover {
      border-color: #059669;
      color: #059669;
    }
    .region-chip.active {
      background: #0f172a;
      border-color: #0f172a;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
    }

    /* Search & Vehicle Filter Row */
    .controls-search-row {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      align-items: center;
    }
    .fare-search-box {
      flex: 1;
      min-width: 260px;
      position: relative;
    }
    .fare-search-input {
      width: 100%;
      padding: 11px 16px 11px 38px;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 13.5px;
      background: #ffffff;
      color: #0f172a;
      outline: none;
      transition: all 0.15s;
    }
    .fare-search-input:focus {
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
    }
    .fare-search-icon {
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
    }
    .fare-filter-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .filter-tab-btn {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 9px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 750;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s;
    }
    .filter-tab-btn.active {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
    }

    /* Counter Bar */
    .route-counter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
    }

    /* Table Wrap */
    .fare-table-wrap {
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      margin-bottom: 30px;
    }
    .fare-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }
    .fare-table thead tr {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      color: #334155;
    }
    .fare-table th {
      padding: 14px 16px;
      font-weight: 800;
      white-space: nowrap;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .fare-table tbody tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.12s;
    }
    .fare-table tbody tr:hover {
      background: #f8fafc;
    }
    .fare-table td {
      padding: 13px 16px;
      vertical-align: middle;
    }

    .dest-name-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dest-name {
      font-weight: 800;
      color: #0f172a;
      font-size: 14px;
    }
    .dest-meta {
      font-size: 11.5px;
      color: #64748b;
    }
    .dest-region-tag {
      display: inline-block;
      font-size: 10.5px;
      font-weight: 750;
      padding: 1px 6px;
      border-radius: 4px;
      width: fit-content;
      margin-top: 2px;
    }
    .dest-region-tag.bihar-dist { background: #e0f2fe; color: #0369a1; }
    .dest-region-tag.bihar-tourist { background: #fef3c7; color: #b45309; }
    .dest-region-tag.up { background: #ede9fe; color: #6d28d9; }
    .dest-region-tag.jharkhand { background: #fce7f3; color: #be185d; }
    .dest-region-tag.bengal { background: #dcfce7; color: #15803d; }

    .distance-cell {
      font-family: var(--font-mono);
      font-weight: 700;
      color: #334155;
      font-size: 13px;
    }
    .duration-sub {
      font-size: 11px;
      color: #64748b;
      display: block;
      margin-top: 1px;
    }

    .fare-price-cell {
      font-weight: 800;
      font-family: var(--font-mono);
      white-space: nowrap;
    }
    .price-amount {
      font-size: 15px;
      font-weight: 800;
      display: block;
    }
    .price-per-km-tag {
      font-size: 10.5px;
      font-weight: 750;
      color: #059669;
      background: #ecfdf5;
      padding: 1px 5px;
      border-radius: 3px;
      display: inline-block;
      margin-top: 2px;
    }
    .fare-price-cell.hatchback .price-amount { color: #0284c7; }
    .fare-price-cell.sedan .price-amount { color: #059669; }
    .fare-price-cell.exec-sedan .price-amount { color: #2563eb; }
    .fare-price-cell.suv .price-amount { color: #7c3aed; }
    .fare-price-cell.lux-suv .price-amount { color: #db2777; }

    .market-cell {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
    }
    .market-tag {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fee2e2;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 11.5px;
      display: block;
      width: fit-content;
    }
    .market-savings {
      font-size: 10.5px;
      color: #059669;
      font-weight: 750;
      margin-top: 2px;
      display: block;
    }

    .btn-table-book {
      background: #059669;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 750;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .btn-table-book:hover { background: #047857; }

    /* Policy & Disclaimers */
    .policy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .policy-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 22px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .policy-card-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .policy-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 13px;
      color: #475569;
      line-height: 1.7;
    }
    .policy-list li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 8px;
    }
    .policy-list li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #059669;
      font-weight: 800;
    }
    .policy-list.excluded li::before {
      content: "✕";
      color: #dc2626;
      font-weight: 800;
    }
    .disclaimer-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 16px 20px;
      font-size: 13px;
      line-height: 1.6;
      color: #92400e;
      margin-bottom: 24px;
    }

    /* Footer */
    .site-footer {
      background: #0f172a;
      color: #94a3b8;
      border-top: 1px solid #1e293b;
    }
  </style>

  <!-- Structured Data: Patna One-Way Taxi Service & FAQPage (98 Offers) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TaxiService",
        "name": "OneWayTaxiBihar Patna Intercity One-Way & Round-Trip Fare Chart 2026",
        "provider": {
          "@type": "LocalBusiness",
          "name": "OneWayTaxiBihar",
          "telephone": "+918002141816",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Boring Road",
            "addressLocality": "Patna",
            "addressRegion": "Bihar",
            "postalCode": "800001",
            "addressCountry": "IN"
          }
        },
        "areaServed": ["Bihar", "Uttar Pradesh", "Jharkhand", "West Bengal"],
        "serviceType": "Intercity Outstation Taxi Service",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "lowPrice": "1499",
          "highPrice": "10998",
          "offerCount": "98"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is included in the Patna one-way taxi fare?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The quoted one-way fare includes vehicle hire charges, fuel for the entire journey, driver food and allowance, and doorstep pickup/drop within municipal limits with zero return trip penalty."
            }
          },
          {
            "@type": "Question",
            "name": "How does the two-way (round-trip) cab fare discount work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "For two-way round-trip journeys, OneWayTaxiBihar offers a flat ₹400 instant deduction from double the one-way fare: Two-Way Fare = (One-Way Fare × 2) − ₹400."
            }
          },
          {
            "@type": "Question",
            "name": "Are highway tolls and FASTag included in this fare chart?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "All FASTag highway toll plaza taxes are transparently calculated and included in the quoted booking voucher with zero surprise driver demands."
            }
          }
        ]
      }
    ]
  }
  </script>
</head>
<body>

  <!-- Navigation Header -->
  <header class="site-header">
    <div class="header-inner container">
      <a href="/" class="brand-logo" aria-label="OneWayTaxiBihar Home">
        <span class="brand-symbol">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
        </span>
        <span class="brand-name">OneWayTaxi<span class="brand-accent">Bihar</span></span>
      </a>
      <div class="header-actions">
        <a href="tel:+918002141816" class="btn-nav-outline" style="text-decoration:none;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>Helpline: 80021 41816</span>
        </a>
        <a href="/#booking-hero" class="btn-nav-book">Book Outstation Cab</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="fare-hero">
    <div class="fare-hero-content">
      <div class="fare-starting-tag">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>98 Connected Intercity Hubs</span>
      </div>
      <h1 class="fare-title">Patna Intercity One-Way &amp; Round-Trip Fare Chart</h1>
      <div class="fare-subtitle">Dedicated Outstation Taxi Rates Across Bihar, Uttar Pradesh, Jharkhand &amp; West Bengal</div>
      <p class="fare-intro">
        Explore transparent fixed rates and accurate per-KM costing for 98 major districts, pilgrimage spots, and transit hubs originating from Patna. Pay exclusively for the distance you travel with zero return-trip penalties on one-way rides, or save ₹400 instantly on two-way round-trips.
      </p>

      <div class="fare-pills-row">
        <div class="fare-pill">📍 Pickup: Patna City / Airport / Junction</div>
        <div class="fare-pill">🛣️ 98 Direct Intercity Destinations</div>
        <div class="fare-pill">🚗 Hatchback, Sedan, Exec &amp; Innova</div>
        <div class="fare-pill">⚡ Instant Dispatch &amp; Doorstep Transfer</div>
      </div>

      <div class="fare-actions-row">
        <a href="tel:+918002141816" class="btn-call-hero">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>Call 80021 41816</span>
        </a>
        <a href="https://wa.me/917739406400?text=Hi%20OneWayTaxiBihar,%20I%20want%20to%20inquire%20about%20Patna%20intercity%20cab%20fares" target="_blank" rel="noopener noreferrer" class="btn-wa-hero">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>WhatsApp Instant Booking</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Interactive Controls & Table Container -->
  <main class="fare-container">

    <!-- AI Transparency Strip -->
    <div class="ai-strip-banner">
      <div class="ai-strip-item">
        <div class="ai-strip-icon" style="background: #e0f2fe; color: #0284c7;">🛣️</div>
        <div>
          <div style="font-weight: 800; font-size: 14px; color: #0f172a;">Real Road Kilometers</div>
          <div style="font-size: 12px; color: #64748b;">Source-checked highway navigation</div>
        </div>
      </div>
      <div class="ai-strip-item">
        <div class="ai-strip-icon" style="background: #d1fae5; color: #059669;">💰</div>
        <div>
          <div style="font-weight: 800; font-size: 14px; color: #0f172a;">Save ₹400 on Round-Trips</div>
          <div style="font-size: 12px; color: #64748b;">Formula: (One-Way × 2) − ₹400</div>
        </div>
      </div>
      <div class="ai-strip-item">
        <div class="ai-strip-icon" style="background: #fef3c7; color: #d97706;">⚡</div>
        <div>
          <div style="font-weight: 800; font-size: 14px; color: #0f172a;">Fixed Price Guarantee</div>
          <div style="font-size: 12px; color: #64748b;">Zero return fare on one-way trips</div>
        </div>
      </div>
    </div>

    <!-- Controls Card -->
    <div class="fare-controls-card">
      
      <!-- 1. Trip Mode Toggle (One-Way vs Two-Way) -->
      <div class="trip-mode-selector-wrap">
        <div>
          <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; display: block; margin-bottom: 4px;">SELECT JOURNEY TYPE</span>
          <div class="trip-mode-toggle" role="tablist" aria-label="Journey Type">
            <button type="button" class="trip-toggle-btn active" id="btn-toggle-oneway" onclick="setTripTypeFilter('oneway')">
              <span>🟢 One-Way (Flat Fare)</span>
            </button>
            <button type="button" class="trip-toggle-btn twoway" id="btn-toggle-twoway" onclick="setTripTypeFilter('twoway')">
              <span>🔁 Two-Way / Round-Trip</span>
              <span class="twoway-save-badge">Save ₹400</span>
            </button>
          </div>
        </div>

        <div style="font-size: 12px; color: #64748b; text-align: right;">
          <span id="trip-mode-note">Displaying verified single-direction one-way fares with zero dead mileage charges.</span>
        </div>
      </div>

      <!-- 2. Region Filter Chips -->
      <div>
        <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; display: block; margin-bottom: 8px;">FILTER BY REGION / STATE</span>
        <div class="region-filter-bar" role="tablist" aria-label="Region Filter">
          <button type="button" class="region-chip active" data-region="all" onclick="setRegionFilter('all')">All Destinations (98)</button>
          <button type="button" class="region-chip" data-region="Bihar districts" onclick="setRegionFilter('Bihar districts')">Bihar Districts (37)</button>
          <button type="button" class="region-chip" data-region="Bihar tourist destinations" onclick="setRegionFilter('Bihar tourist destinations')">Tourist &amp; Pilgrim (16)</button>
          <button type="button" class="region-chip" data-region="Uttar Pradesh" onclick="setRegionFilter('Uttar Pradesh')">Uttar Pradesh (15)</button>
          <button type="button" class="region-chip" data-region="Jharkhand" onclick="setRegionFilter('Jharkhand')">Jharkhand (15)</button>
          <button type="button" class="region-chip" data-region="West Bengal" onclick="setRegionFilter('West Bengal')">West Bengal (15)</button>
        </div>
      </div>

      <!-- 3. Search Bar & Vehicle Tier Tabs -->
      <div class="controls-search-row">
        <div class="fare-search-box">
          <svg class="fare-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="fare-search" class="fare-search-input" placeholder="Search destination (e.g. Gaya, Varanasi, Ranchi, Muzaffarpur, Rajgir, Ayodhya)..." aria-label="Search destination" oninput="filterFares()">
        </div>

        <div class="fare-filter-tabs" role="tablist" aria-label="Vehicle Category Filter">
          <button type="button" class="filter-tab-btn active" data-tier="all" onclick="setCategoryFilter('all')">All Cabs</button>
          <button type="button" class="filter-tab-btn" data-tier="hatchback" onclick="setCategoryFilter('hatchback')">Hatchback</button>
          <button type="button" class="filter-tab-btn" data-tier="sedan" onclick="setCategoryFilter('sedan')">Sedan</button>
          <button type="button" class="filter-tab-btn" data-tier="execSedan" onclick="setCategoryFilter('execSedan')">Executive Sedan</button>
          <button type="button" class="filter-tab-btn" data-tier="suv" onclick="setCategoryFilter('suv')">SUV (Ertiga)</button>
          <button type="button" class="filter-tab-btn" data-tier="luxSuv" onclick="setCategoryFilter('luxSuv')">Luxury SUV (Innova)</button>
        </div>
      </div>
    </div>

    <!-- Active Route Counter Bar -->
    <div class="route-counter-bar">
      <div id="route-counter">Showing 98 Destinations from Patna</div>
      <div style="font-size: 12px; color: #94a3b8;">* All fares in INR (₹) • Tolls &amp; FASTag Included</div>
    </div>

    <!-- Table -->
    <div class="fare-table-wrap">
      <table class="fare-table" id="fares-table">
        <thead>
          <tr>
            <th style="min-width: 190px;">Destination (From Patna)</th>
            <th style="min-width: 100px;">Distance &amp; Time</th>
            <th class="col-hatchback" style="min-width: 135px;">
              Hatchback
              <span style="display:block; font-size:10px; font-weight:600; color:#64748b;">WagonR / Tiago</span>
            </th>
            <th class="col-sedan" style="min-width: 135px;">
              Prime Sedan
              <span style="display:block; font-size:10px; font-weight:600; color:#64748b;">Dzire / Etios / Aura</span>
            </th>
            <th class="col-exec-sedan" style="min-width: 140px;">
              Executive Sedan
              <span style="display:block; font-size:10px; font-weight:600; color:#64748b;">Honda City / Ciaz</span>
            </th>
            <th class="col-suv" style="min-width: 140px;">
              SUV / 6-Seater
              <span style="display:block; font-size:10px; font-weight:600; color:#64748b;">Ertiga / Triber</span>
            </th>
            <th class="col-lux-suv" style="min-width: 145px;">
              Luxury SUV
              <span style="display:block; font-size:10px; font-weight:600; color:#64748b;">Innova Crysta</span>
            </th>
            <th style="min-width: 150px;">
              Market Rate
              <span style="display:block; font-size:10px; font-weight:600; color:#64748b;">Traditional Round-Trip</span>
            </th>
            <th style="min-width: 110px; text-align: center;">Action</th>
          </tr>
        </thead>
        <tbody id="fare-table-body">
          <!-- Populated by JavaScript -->
        </tbody>
      </table>
    </div>

    <!-- Note on distance & confirmation -->
    <div class="disclaimer-box" style="margin-bottom: 36px;">
      <strong>⚠️ Distance &amp; Confirmation Note:</strong>
      All distances listed above are highway navigation distances between Patna and destination centers based on official state tourism, NHAI road networks, and government transit datasets. Route fares are fixed for city-to-city transfers with zero return fare on one-way trips. Please confirm exact doorstep coordinates at booking.
    </div>

    <!-- Policy Section -->
    <section style="margin-bottom: 40px;">
      <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 20px;">Fare Policy &amp; Terms</h2>
      
      <div class="policy-grid">
        <div class="policy-card">
          <div class="policy-card-title">
            <span style="color: #059669;">✓</span>
            <span>What's Included</span>
          </div>
          <ul class="policy-list">
            <li><strong>Fuel:</strong> 100% fuel for the quoted intercity journey.</li>
            <li><strong>Vehicle Hire:</strong> Sanitized commercial permit AC vehicle charges.</li>
            <li><strong>Driver Allowance:</strong> Chauffeur food &amp; daily allowance included.</li>
            <li><strong>Doorstep Transfers:</strong> Pickup and drop-off within agreed municipal limits.</li>
          </ul>
        </div>

        <div class="policy-card">
          <div class="policy-card-title">
            <span style="color: #dc2626;">✕</span>
            <span>Tolls &amp; Clear Disclosures</span>
          </div>
          <ul class="policy-list excluded">
            <li><strong>All tolls, bridge taxes, and FASTag charges</strong> are transparently disclosed and included in the quoted booking.</li>
            <li><strong>Zero Hidden Extra Demands:</strong> No driver tip coercion or surprise charges at toll plazas.</li>
            <li><strong>State road permits:</strong> Handled seamlessly for interstate trips to UP, Jharkhand, and Bengal.</li>
          </ul>
        </div>

        <div class="policy-card">
          <div class="policy-card-title">
            <span style="color: #0284c7;">💳</span>
            <span>Booking &amp; Round-Trip Savings</span>
          </div>
          <ul class="policy-list">
            <li><strong>Round-Trip Formula:</strong> Two-Way Fare = (One-Way × 2) − ₹400 instant savings!</li>
            <li><strong>Token Required:</strong> ₹200–₹499 to confirm vehicle dispatch.</li>
            <li><strong>Cash or UPI on Ride:</strong> Full balance payable directly to chauffeur upon arrival.</li>
            <li><strong>Free Cancellation:</strong> Cancel any time before driver dispatch with zero fee.</li>
          </ul>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="container footer-content" style="padding: 40px 16px; text-align: center;">
      <div style="font-weight: 800; font-size: 18px; color: white; margin-bottom: 8px;">OneWayTaxiBihar Mobility Solutions</div>
      <p style="font-size: 12.5px; color: #94a3b8; max-width: 600px; margin: 0 auto 10px;">Dedicated intercity mobility network offering flat-rate one-way and two-way outstation cabs across Patna and 98 destinations in East India.</p>
      <p style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">
        Follow us: <a href="https://www.facebook.com/onewaytaxibihar" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; font-weight: 700; margin-right: 12px;">Facebook</a> • <a href="https://www.instagram.com/onewaytaxibihar" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; font-weight: 700; margin-left: 12px;">Instagram</a>
      </p>
      <div style="font-size: 12px; color: #64748b;">Central Helpline: +91 80021 41816 • WhatsApp: +91 77394 06400 • Boring Road, Patna, Bihar</div>
    </div>
  </footer>

  <!-- Master Data & Interactive Engine -->
  <script src="/js/route-gate.js"></script>
  <script>
    const PATNA_FARES_DATA = ${JSON.stringify(fares, null, 2)};

    let currentTierFilter = 'all';
    let currentRegionFilter = 'all';
    let currentTripType = 'oneway'; // 'oneway' | 'twoway'

    function getEstDuration(distKm) {
      if (!distKm) return '—';
      const hours = Math.floor(distKm / 46);
      const mins = Math.round((distKm % 46) * 1.3);
      return (hours > 0 ? hours + 'h ' : '') + (mins > 0 ? mins + 'm' : '15m');
    }

    function renderFaresTable(items) {
      const tbody = document.getElementById('fare-table-body');
      const counter = document.getElementById('route-counter');
      if (!tbody) return;

      if (!items || items.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="9" style="text-align: center; padding: 40px 16px; color: #64748b;">
              <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">No destinations matched your filter</div>
              <div style="font-size: 13px;">Looking for a custom outstation destination? Call our Patna Central Desk at <a href="tel:+918002141816" style="color: #059669; font-weight: 700;">+91 80021 41816</a></div>
            </td>
          </tr>
        \`;
        if (counter) counter.textContent = 'Showing 0 Destinations';
        return;
      }

      if (counter) {
        counter.textContent = \`Showing \${items.length} Destination\${items.length === 1 ? '' : 's'} (\${currentTripType === 'twoway' ? 'Round-Trip / Two-Way' : 'One-Way'})\`;
      }

      tbody.innerHTML = items.map(f => {
        const isTwoWay = currentTripType === 'twoway';
        const hatchPrice = isTwoWay ? (f.twoWay?.hatchback || (f.hatchback * 2 - 400)) : f.hatchback;
        const sedanPrice = isTwoWay ? (f.twoWay?.sedan || (f.sedan * 2 - 400)) : f.sedan;
        const execPrice = isTwoWay ? (f.twoWay?.execSedan || (f.execSedan * 2 - 400)) : (f.execSedan || f.sedan + 250);
        const suvPrice = isTwoWay ? (f.twoWay?.suv || (f.suv * 2 - 400)) : f.suv;
        const luxSuvPrice = isTwoWay ? (f.twoWay?.luxSuv || (f.luxSuv * 2 - 400)) : (f.luxSuv || f.sedan + 700);

        const hatchDisplay = hatchPrice ? \`₹\${hatchPrice.toLocaleString('en-IN')}\` : '—';
        const sedanDisplay = sedanPrice ? \`₹\${sedanPrice.toLocaleString('en-IN')}\` : '—';
        const execDisplay = execPrice ? \`₹\${execPrice.toLocaleString('en-IN')}\` : '—';
        const suvDisplay = suvPrice ? \`₹\${suvPrice.toLocaleString('en-IN')}\` : '—';
        const luxSuvDisplay = luxSuvPrice ? \`₹\${luxSuvPrice.toLocaleString('en-IN')}\` : '—';

        const hatchPerKm = f.distanceKm && hatchPrice ? (hatchPrice / (isTwoWay ? f.distanceKm * 2 : f.distanceKm)).toFixed(2) : null;
        const sedanPerKm = f.distanceKm && sedanPrice ? (sedanPrice / (isTwoWay ? f.distanceKm * 2 : f.distanceKm)).toFixed(2) : null;
        const execPerKm = f.distanceKm && execPrice ? (execPrice / (isTwoWay ? f.distanceKm * 2 : f.distanceKm)).toFixed(2) : null;
        const suvPerKm = f.distanceKm && suvPrice ? (suvPrice / (isTwoWay ? f.distanceKm * 2 : f.distanceKm)).toFixed(2) : null;
        const luxSuvPerKm = f.distanceKm && luxSuvPrice ? (luxSuvPrice / (isTwoWay ? f.distanceKm * 2 : f.distanceKm)).toFixed(2) : null;

        let regionTagClass = 'bihar-dist';
        if (f.region === 'Bihar tourist destinations') regionTagClass = 'bihar-tourist';
        else if (f.region === 'Uttar Pradesh') regionTagClass = 'up';
        else if (f.region === 'Jharkhand') regionTagClass = 'jharkhand';
        else if (f.region === 'West Bengal') regionTagClass = 'bengal';

        const duration = getEstDuration(f.distanceKm);
        const marketFormatted = f.marketComparison ? \`₹\${f.marketComparison}\` : '—';

        return \`
          <tr data-id="\${f.id}">
            <td>
              <div class="dest-name-wrap">
                <span class="dest-name">\${escapeHtml(f.destination)}</span>
                <span class="dest-meta">\${escapeHtml(f.district || f.destCity)}</span>
                <span class="dest-region-tag \${regionTagClass}">\${escapeHtml(f.region)}</span>
              </div>
            </td>
            <td>
              <div class="distance-cell">\${f.distanceKm ? f.distanceKm + ' KM' : '—'}</div>
              <span class="duration-sub">~\${duration}</span>
            </td>
            <td class="fare-price-cell hatchback col-hatchback">
              <span class="price-amount">\${hatchDisplay}</span>
              \${hatchPerKm ? \`<span class="price-per-km-tag">₹\${hatchPerKm}/km</span>\` : ''}
            </td>
            <td class="fare-price-cell sedan col-sedan">
              <span class="price-amount">\${sedanDisplay}</span>
              \${sedanPerKm ? \`<span class="price-per-km-tag">₹\${sedanPerKm}/km</span>\` : ''}
            </td>
            <td class="fare-price-cell exec-sedan col-exec-sedan">
              <span class="price-amount">\${execDisplay}</span>
              \${execPerKm ? \`<span class="price-per-km-tag">₹\${execPerKm}/km</span>\` : ''}
            </td>
            <td class="fare-price-cell suv col-suv">
              <span class="price-amount">\${suvDisplay}</span>
              \${suvPerKm ? \`<span class="price-per-km-tag">₹\${suvPerKm}/km</span>\` : ''}
            </td>
            <td class="fare-price-cell lux-suv col-lux-suv">
              <span class="price-amount">\${luxSuvDisplay}</span>
              \${luxSuvPerKm ? \`<span class="price-per-km-tag">₹\${luxSuvPerKm}/km</span>\` : ''}
            </td>
            <td class="market-cell">
              <span class="market-tag">\${marketFormatted}</span>
              <span class="market-savings">\${isTwoWay ? 'Save ₹400 Guaranteed' : 'Zero Return Fare'}</span>
            </td>
            <td style="text-align: center;">
              <button type="button" class="btn-table-book" onclick="bookRoute('\${escapeHtml(f.destCity)}', '\${escapeHtml(f.destination)}')">
                <span>Book Cab</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </td>
          </tr>
        \`;
      }).join('');

      applyColumnVisibility();
    }

    function escapeHtml(str) {
      if (str == null) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function applyColumnVisibility() {
      const isHatch = currentTierFilter === 'hatchback';
      const isSedan = currentTierFilter === 'sedan';
      const isExec = currentTierFilter === 'execSedan';
      const isSuv = currentTierFilter === 'suv';
      const isLux = currentTierFilter === 'luxSuv';

      document.querySelectorAll('.col-hatchback').forEach(el => el.style.display = (currentTierFilter === 'all' || isHatch) ? '' : 'none');
      document.querySelectorAll('.col-sedan').forEach(el => el.style.display = (currentTierFilter === 'all' || isSedan) ? '' : 'none');
      document.querySelectorAll('.col-exec-sedan').forEach(el => el.style.display = (currentTierFilter === 'all' || isExec) ? '' : 'none');
      document.querySelectorAll('.col-suv').forEach(el => el.style.display = (currentTierFilter === 'all' || isSuv) ? '' : 'none');
      document.querySelectorAll('.col-lux-suv').forEach(el => el.style.display = (currentTierFilter === 'all' || isLux) ? '' : 'none');
    }

    function filterFares() {
      const q = (document.getElementById('fare-search')?.value || '').toLowerCase().trim();
      const filtered = PATNA_FARES_DATA.filter(f => {
        // Region filter
        if (currentRegionFilter !== 'all' && f.region !== currentRegionFilter) {
          return false;
        }

        // Search filter
        if (!q) return true;
        return (f.destination && f.destination.toLowerCase().includes(q)) ||
               (f.destCity && f.destCity.toLowerCase().includes(q)) ||
               (f.district && f.district.toLowerCase().includes(q)) ||
               (f.region && f.region.toLowerCase().includes(q));
      });
      renderFaresTable(filtered);
    }

    function setTripTypeFilter(type) {
      currentTripType = type;
      document.getElementById('btn-toggle-oneway')?.classList.toggle('active', type === 'oneway');
      document.getElementById('btn-toggle-twoway')?.classList.toggle('active', type === 'twoway');
      
      const noteEl = document.getElementById('trip-mode-note');
      if (noteEl) {
        noteEl.textContent = type === 'twoway'
          ? 'Displaying round-trip fares with flat ₹400 instant savings deducted from double the one-way fare.'
          : 'Displaying verified single-direction one-way fares with zero return dead-mileage charges.';
      }
      filterFares();
    }

    function setRegionFilter(region) {
      currentRegionFilter = region;
      document.querySelectorAll('.region-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-region') === region);
      });
      filterFares();
    }

    function setCategoryFilter(tier) {
      currentTierFilter = tier;
      document.querySelectorAll('.filter-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tier') === tier);
      });
      applyColumnVisibility();
    }

    function bookRoute(destCity, fullDestination) {
      const chosenTier = (currentTierFilter !== 'all') ? currentTierFilter : 'sedan';
      if (typeof window.openRouteFareUnlockModal === 'function') {
        window.openRouteFareUnlockModal('Patna', destCity || fullDestination, chosenTier, currentTripType);
      } else {
        const query = new URLSearchParams({
          from: 'Patna',
          to: destCity || fullDestination,
          type: currentTripType || 'oneway',
          cab: chosenTier
        });
        window.location.href = '/cabs?' + query.toString();
      }
    }

    // Try fetching live updated fares from server, fallback to embedded dataset
    fetch('/api/fares')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.fares) && data.fares.length > 0) {
          PATNA_FARES_DATA.length = 0;
          PATNA_FARES_DATA.push(...data.fares);
          filterFares();
        }
      })
      .catch(() => {});

    // Initial render
    renderFaresTable(PATNA_FARES_DATA);
  </script>
</body>
</html>
`;

fs.writeFileSync('fare-chart.html', htmlContent, 'utf8');
console.log('Successfully upgraded fare-chart.html with 98 destinations and AI costing engine!');
