const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/himan/.gemini/antigravity/brain/d19e8aba-9d53-4930-8d6e-d61fe536a54d';
const qrData = JSON.parse(fs.readFileSync('scratch/qr_expo_all.json', 'utf8'));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OneWay Taxi Bihar • Universal Expo Go Preview Hub</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 antialiased p-3 sm:p-6 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">

    <!-- Top Status Banner -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">🚀</span>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">Universal Expo Go Mobile Preview Hub</h1>
          <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">ALL 3 APPS LIVE</span>
        </div>
        <p class="text-slate-400 text-xs sm:text-sm mt-1">
          Preview <strong>Passenger</strong>, <strong>Driver Partner</strong>, and <strong>Admin Desk V2</strong> live in Expo Go on your phone.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <a href="http://localhost:3000/" target="_blank" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5">
          <span>🌐 Web Portal</span> ➔
        </a>
        <a href="http://localhost:3000/admin.html" target="_blank" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5">
          <span>🛡️ Web Admin</span> ➔
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
            Scan this QR code using the <strong>Camera</strong> (iOS) or <strong>Expo Go app</strong> (Android). With the active ngrok tunnel, the app loads immediately on your physical phone with a floating <strong>[ Switch App ▾ ]</strong> pill to switch between Passenger, Driver, and Admin!
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
              <span>📲 Open in Expo Go</span> ➔
            </a>
            <button onclick="navigator.clipboard.writeText('${qrData.tunnelUrl}'); alert('Copied Expo Tunnel URL to clipboard!');" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5">
              <span>📋 Copy Link</span>
            </button>
            <span class="px-3 py-2 text-[11px] text-slate-400 font-mono flex items-center bg-slate-950/50 rounded-xl border border-slate-800/80">
              LAN: ${qrData.lanUrl}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Universal App Switcher Guide -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">🔄</span>
        <h3 class="text-base font-bold text-white">How to Preview All 3 Apps on Your Phone</h3>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed mb-4">
        Once loaded in Expo Go, an unobtrusive floating switcher badge <strong>[ 📱 Switch App ▾ ]</strong> is pinned at the top right of your phone screen. Tap it anytime to jump between:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Passenger App Card -->
        <div class="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">🚖</div>
              <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">DEFAULT</span>
            </div>
            <h4 class="text-white font-bold text-sm">Passenger Mobile App</h4>
            <p class="text-slate-400 text-xs mt-1 leading-relaxed">
              Outstation cab booking, dynamic route fare matrix calculator, live booking timeline, active PNR details, and DPDP Act account erasure.
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono">
            com.onewaytaxibihar.passenger
          </div>
        </div>

        <!-- Driver Partner App Card -->
        <div class="bg-slate-950 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500 transition-colors">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">👨‍✈️</div>
              <span class="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">RADAR ACTIVE</span>
            </div>
            <h4 class="text-white font-bold text-sm">Driver Partner App</h4>
            <p class="text-slate-400 text-xs mt-1 leading-relaxed">
              Chauffeur duty toggle (Online/Offline), 30-second priority trip offer modal with audio chime, background GPS telemetry, and daily earnings ledger with instant payouts.
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-mono">
            com.onewaytaxibihar.driver
          </div>
        </div>

        <!-- Admin Desk V2 Card -->
        <div class="bg-slate-950 border border-blue-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500 transition-colors">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">🛡️</div>
              <span class="text-[10px] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">DASHBOARD V2</span>
            </div>
            <h4 class="text-white font-bold text-sm">Admin Operations Desk</h4>
            <p class="text-slate-400 text-xs mt-1 leading-relaxed">
              Live Bihar corridor dispatch radar (NH-22, NH-77, NH-57, NH-31, NH-19), pending driver KYC approvals, 1-tap fast driver allotment modal, and platform commission ledger.
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-blue-400 font-mono">
            com.onewaytaxibihar.admin
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Step-by-Step Connection Instructions -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <span>📋</span> Quick Start Guide for Android & iOS
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
        <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
            <span>🤖</span> Android Instructions
          </div>
          <ol class="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
            <li>Open the <strong>Expo Go</strong> app on your Android device.</li>
            <li>Tap <strong>Scan QR code</strong> and scan the green QR code above.</li>
            <li>Alternatively, tap <strong>Enter URL manually</strong> and paste:
              <code class="text-emerald-400 block mt-1 select-all font-mono text-[11px]">${qrData.tunnelUrl}</code>
            </li>
            <li>The app will download the Metro bundle and open instantly!</li>
          </ol>
        </div>

        <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="font-bold text-blue-400 text-sm flex items-center gap-1.5">
            <span>🍎</span> iOS Instructions
          </div>
          <ol class="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
            <li>Open the native <strong>Camera app</strong> on your iPhone.</li>
            <li>Point the camera at the QR code above.</li>
            <li>Tap the yellow notification banner <strong>"Open in Expo Go"</strong>.</li>
            <li>Or copy the link and open via Expo Go's clipboard prompt.</li>
          </ol>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;

fs.writeFileSync(path.join(artifactDir, 'expogo_preview_hub.html'), html, 'utf8');
console.log('Successfully wrote expogo_preview_hub.html');

