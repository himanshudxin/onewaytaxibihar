const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/himan/.gemini/antigravity/brain/d19e8aba-9d53-4930-8d6e-d61fe536a54d';
const qrData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scratch', 'qr_expo_all.json'), 'utf8'));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OneWayTaxiBihar • 3-in-1 Universal App Preview Hub</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 antialiased p-3 sm:p-6 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">

    <!-- Top Status Banner -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">🚖</span>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">OneWayTaxiBihar • 3-in-1 Preview Hub</h1>
          <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">ALL 3 APPS READY</span>
        </div>
        <p class="text-slate-400 text-xs sm:text-sm mt-1">
          Access <strong>Passenger App</strong>, <strong>Driver Partner App</strong>, and <strong>Admin Operations Desk V2</strong> on Mobile & Web.
        </p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <a href="http://localhost:3000/" target="_blank" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5">
          <span>🌐 Passenger Web</span> →
        </a>
        <a href="http://localhost:3000/driver.html" target="_blank" class="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 font-bold text-xs rounded-xl border border-amber-600/50 transition-colors flex items-center gap-1.5">
          <span>🧑‍✈️ Driver Web</span> →
        </a>
        <a href="http://localhost:3000/admin.html" target="_blank" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5">
          <span>🛡️ Admin Desk</span> →
        </a>
      </div>
    </div>

    <!-- Section 1: Universal Mobile App Preview (Expo Go Tunnel) -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div class="flex flex-col md:flex-row items-center gap-6">
        
        <!-- Big High-Resolution QR Code -->
        <div class="w-60 h-60 bg-white p-3 rounded-2xl shadow-2xl border-2 border-emerald-500/50 flex-shrink-0 flex flex-col items-center justify-center">
          <img src="${qrData.qrTunnel}" alt="Universal Expo Go Tunnel QR" class="w-52 h-52 object-contain" />
          <span class="text-[10px] text-slate-800 font-bold mt-1 tracking-tight">SCAN WITH EXPO GO / CAMERA</span>
        </div>

        <!-- Details & Instructions -->
        <div class="flex-1 text-center md:text-left space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <span>⚡ Universal Live Tunnel</span> • Works on Jio/Airtel 5G & Any Wi-Fi
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-white">Universal 3-in-1 Mobile App</h2>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Scan this QR code using the <strong>Camera</strong> (iOS) or <strong>Expo Go app</strong> (Android). The app loads immediately on your physical phone with a floating <strong>[ Switch App ⇅ ]</strong> pill to switch between <strong>Passenger</strong>, <strong>Driver</strong>, and <strong>Admin</strong> in 1 tap!
          </p>

          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-slate-400 font-medium">Direct Expo Go URL:</span>
              <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">METRO 8081 ONLINE</span>
            </div>
            <div class="font-mono text-xs sm:text-sm text-emerald-400 font-bold select-all break-all">
              ${qrData.tunnelUrl}
            </div>
          </div>

          <div class="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
            <a href="${qrData.tunnelUrl}" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2">
              <span>📱 Open in Expo Go</span> →
            </a>
            <button onclick="navigator.clipboard.writeText('${qrData.tunnelUrl}'); alert('URL copied to clipboard!');" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2">
              <span>📋 Copy Expo Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: All 3 Mobile Applications Breakdown -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <span>📦</span> Available Applications (Switch via Floating Pill)
        </h3>
        <span class="text-xs text-slate-400">Integrated into a single universal bundle</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Passenger Mobile App Card -->
        <div class="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500 transition-colors shadow-lg">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">🚖</div>
              <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">DEFAULT</span>
            </div>
            <h4 class="text-white font-bold text-base">1. Passenger Mobile App</h4>
            <p class="text-slate-400 text-xs mt-2 leading-relaxed">
              • Guaranteed Outstation Cab Booking<br>
              • Dynamic Route Fare Matrix (Patna → Bihar)<br>
              • High-Visibility Schedule (<code class="text-emerald-400">DD-MMM-YYYY</code>)<br>
              • Live PNR Timeline & Dynamic Driver Card<br>
              • Self-Service DPDP Act Account Deletion
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-emerald-400 font-mono">com.onewaytaxibihar.passenger</span>
            <a href="http://localhost:3000/" target="_blank" class="text-slate-300 hover:text-emerald-400 font-bold">Web View →</a>
          </div>
        </div>

        <!-- Driver Partner App Card -->
        <div class="bg-slate-900 border border-amber-500/30 rounded-xl p-5 flex flex-col justify-between hover:border-amber-500 transition-colors shadow-lg">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">🧑‍✈️</div>
              <span class="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">BROADCAST ACTIVE</span>
            </div>
            <h4 class="text-white font-bold text-base">2. Driver Partner App</h4>
            <p class="text-slate-400 text-xs mt-2 leading-relaxed">
              • Chauffeur Duty Toggle (Online/Offline)<br>
              • Real-Time Broadcast Offers Feed<br>
              • 1-Tap <strong>⚡ CLAIM TRIP</strong> Atomic Locking<br>
              • Siren Sound Alert & GPS Telemetry<br>
              • Daily Earnings Ledger & Payout Requests
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-amber-400 font-mono">com.onewaytaxibihar.driver</span>
            <a href="http://localhost:3000/driver.html" target="_blank" class="text-slate-300 hover:text-amber-400 font-bold">Web View →</a>
          </div>
        </div>

        <!-- Admin Desk V2 Card -->
        <div class="bg-slate-900 border border-blue-500/30 rounded-xl p-5 flex flex-col justify-between hover:border-blue-500 transition-colors shadow-lg">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">🛡️</div>
              <span class="text-[10px] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">COMMAND V2</span>
            </div>
            <h4 class="text-white font-bold text-base">3. Admin Operations Desk</h4>
            <p class="text-slate-400 text-xs mt-2 leading-relaxed">
              • 5 Bihar Highway Corridors Radar<br>
              • Live Dispatch Workspace with Broadcast All<br>
              • Manual Overrides: Cancel & Mark Done<br>
              • Chauffeur KYC DL/RC Approval Pipeline<br>
              • Platform Margin vs Driver Payout Ledger
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-blue-400 font-mono">com.onewaytaxibihar.admin</span>
            <a href="http://localhost:3000/admin.html" target="_blank" class="text-slate-300 hover:text-blue-400 font-bold">Web View →</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Web Portals & Credentials -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <span>🔑</span> Web Access & Operator Credentials
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="font-bold text-emerald-400 text-sm">Passenger Web Portal</div>
          <p class="text-slate-400">Direct online outstation booking, route selector, fare quotes, and PNR tracking.</p>
          <div class="pt-2">
            <a href="http://localhost:3000/" target="_blank" class="text-emerald-400 font-mono text-[11px] underline block">http://localhost:3000/</a>
            <span class="text-slate-500 text-[10px] block mt-0.5">LAN: http://192.168.0.179:3000/</span>
          </div>
        </div>

        <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="font-bold text-amber-400 text-sm">Driver Web Portal</div>
          <p class="text-slate-400">Web counterpart for chauffeurs: live queue, 1-tap claim, trip execution.</p>
          <div class="pt-2">
            <a href="http://localhost:3000/driver.html" target="_blank" class="text-amber-400 font-mono text-[11px] underline block">http://localhost:3000/driver.html</a>
            <span class="text-slate-500 text-[10px] block mt-0.5">LAN: http://192.168.0.179:3000/driver.html</span>
          </div>
        </div>

        <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="font-bold text-blue-400 text-sm">Admin Operations Desk</div>
          <div class="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
            <div>User: <strong class="text-white">admin</strong></div>
            <div>Pass: <strong class="text-white">harharmahadev@1</strong></div>
          </div>
          <div class="pt-1">
            <a href="http://localhost:3000/admin.html" target="_blank" class="text-blue-400 font-mono text-[11px] underline block">http://localhost:3000/admin.html</a>
            <span class="text-slate-500 text-[10px] block mt-0.5">LAN: http://192.168.0.179:3000/admin.html</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Mobile Instructions -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <span>📲</span> How to Run All 3 Apps on Your Phone
      </h3>
      <ol class="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
        <li>Install <strong>Expo Go</strong> from Google Play Store or iOS App Store on your smartphone.</li>
        <li>Open <strong>Expo Go</strong> (or iOS Camera) and scan the QR code above, OR enter URL: <code class="text-emerald-400 font-mono">${qrData.tunnelUrl}</code>.</li>
        <li>The app will download the Metro bundle. You will see a floating button on your phone screen: <span class="bg-slate-800 text-white px-2 py-0.5 rounded font-bold">🚖 Passenger ⇅</span>.</li>
        <li>Tap that floating button anytime to open the <strong>App Switcher modal</strong> and immediately switch between:
          <ul class="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-400">
            <li><strong>🚖 Passenger Mobile App</strong> — Book rides, check PNR, track chauffeur.</li>
            <li><strong>🧑‍✈️ Driver Partner App</strong> — Go ON DUTY, receive broadcast offers, claim trips.</li>
            <li><strong>🛡️ Admin Operations Desk V2</strong> — Monitor live dispatch radar, force assign, manage fleet.</li>
          </ul>
        </li>
      </ol>
    </div>

  </div>
</body>
</html>`;

fs.writeFileSync(path.join(artifactDir, 'expogo_preview_hub.html'), html, 'utf8');
console.log('✅ Clean expogo_preview_hub.html generated successfully.');

