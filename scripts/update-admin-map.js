const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Add map legend next to Recenter Map
const searchButton = '<button type="button" class="btn btn-secondary btn-sm" onclick="initDispatchMap(true)">';
const replacementLegend = `<span style="font-size: 11px; font-weight: 700; color: #64748b; margin-right: 8px;">
                <span style="color:#059669;">●</span> Ready Chauffeur &nbsp;|&nbsp; <span style="color:#f59e0b;">●</span> Unassigned Ride &nbsp;|&nbsp; <span style="color:#2563eb;">●</span> In Transit
              </span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="initDispatchMap(true)">`;

if (content.includes(searchButton) && !content.includes('Ready Chauffeur')) {
  content = content.replace(searchButton, replacementLegend);
  console.log('✓ Added map legend to admin.html');
}

// 2. Add driver markers in renderDispatchWorkspace()
const targetMarkerPush = `        _dispatchMarkers.push(marker);
      });`;

const driverMarkerCode = `        _dispatchMarkers.push(marker);
      });

      // Add pins for active and available verified drivers
      (_allDrivers || []).filter(d => d.status === 'available' || d.isAvailable || d.dutyStatus === 'ON_DUTY').forEach((d, idx) => {
        const cityKey = (d.currentCity || d.city || 'patna').toLowerCase().split(" ")[0];
        const baseCoords = BIHAR_COORDS[cityKey] || [25.5941, 85.1376];
        // Jitter slightly so driver pins don't overlap exactly with hub centers
        const latJitter = ((idx % 5) - 2) * 0.015;
        const lngJitter = (((idx * 3) % 5) - 2) * 0.015;
        const driverCoords = [baseCoords[0] + latJitter, baseCoords[1] + lngJitter];

        const dMarker = L.circleMarker(driverCoords, {
          radius: 9,
          fillColor: '#059669',
          color: '#ffffff',
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(_dispatchMap);

        dMarker.bindPopup(\`
          <div style="font-size:12px; font-family:sans-serif;">
            <strong style="color:#059669;">🚗 \${escapeHtml(d.name || 'Driver Partner')}</strong><br>
            Vehicle: \${escapeHtml(d.vehicleModel || 'Cab')} (\${escapeHtml(d.vehicleNumber || 'Commercial')})<br>
            Location: <strong>\${escapeHtml(d.currentCity || d.city || 'Patna Hub')}</strong><br>
            Status: <span style="color:#059669; font-weight:700;">● READY FOR DISPATCH</span><br>
            Phone: <a href="tel:\${escapeHtml(d.phone)}">\${escapeHtml(d.phone)}</a>
          </div>
        \`);
        _dispatchMarkers.push(dMarker);
      });`;

if (content.includes(targetMarkerPush) && !content.includes('Add pins for active and available verified drivers')) {
  content = content.replace(targetMarkerPush, driverMarkerCode);
  console.log('✓ Added driver markers to admin.html');
} else {
  // Try CRLF version
  const targetCRLF = `        _dispatchMarkers.push(marker);\r\n      });`;
  if (content.includes(targetCRLF) && !content.includes('Add pins for active and available verified drivers')) {
    content = content.replace(targetCRLF, driverMarkerCode.replace(/\n/g, '\r\n'));
    console.log('✓ Added driver markers to admin.html (CRLF)');
  }
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('admin.html successfully updated.');

