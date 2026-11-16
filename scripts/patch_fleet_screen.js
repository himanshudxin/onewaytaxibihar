const fs = require('fs');
const path = require('path');

const previewPath = path.join(__dirname, '../mobile/previews/uber-bolt-preview.html');
let html = fs.readFileSync(previewPath, 'utf8');

const targetStart = '<!-- SCREEN 3: 5-TIER FLEET & FARES -->';
const targetEnd = '<!-- SCREEN 4: SUMMARY & CHECKOUT -->';

const sIdx = html.indexOf(targetStart);
const eIdx = html.indexOf(targetEnd);

console.log('Fleet markers:', sIdx, eIdx);

if (sIdx !== -1 && eIdx !== -1) {
  const newFleetHtml = `<!-- SCREEN 3: 5-TIER FLEET & FARES (inDrive Outstation Style) -->
        <div id="view-fleet" class="screen-view" style="padding: 16px; padding-bottom: 95px; overflow-y: auto;">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="switchScreen('home')" style="width: 36px; height: 36px; border-radius: 10px; background: var(--input-bg); border: 1px solid var(--card-border); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div>
                <div style="font-size: 16px; font-weight: 800; color: var(--text-primary);">Select Outstation Vehicle</div>
                <div id="fleet-route-sub" style="font-size: 11.5px; color: var(--text-muted); margin-top: 1px;">Patna → Gaya (98.6 km) • AC Included</div>
              </div>
            </div>
            <button onclick="alert('All-Inclusive Bihar Outstation: Fuel, driver allowance & toll included. Zero return fee.');" style="width: 36px; height: 36px; border-radius: 10px; background: var(--input-bg); border: 1px solid var(--card-border); color: #F59E0B; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>

          <!-- Value Guarantee Strip -->
          <div style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style="font-size: 11.5px; font-weight: 700; color: #10B981;">Guaranteed Fixed Fare: Driver allowance & tolls included. Zero return fee.</span>
          </div>

          <!-- Fleet List Container -->
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            
            <!-- Tier 1: Hatchback -->
            <div class="fleet-card" id="card-hatchback" onclick="selectFleetTier(this, 'Hatchback', '₹2,080', '₹20/km')" style="background: var(--card-surface); border: 1.5px solid var(--card-border); border-radius: 14px; padding: 13px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s ease;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 52px; height: 38px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--card-border); display: flex; align-items: center; justify-content: center; font-size: 20px;">🚗</div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 800; color: var(--text-primary);">Hatchback</span>
                    <span style="font-size: 9.5px; font-weight: 900; background: var(--input-bg); color: var(--text-muted); padding: 2px 5px; border-radius: 4px;">BEST VALUE</span>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">WagonR, Tiago • 4 Seats • 2 Bags</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 17px; font-weight: 900; color: #F59E0B;">₹2,080</div>
                <div style="font-size: 10.5px; font-weight: 700; color: #10B981;">₹20/km</div>
              </div>
            </div>

            <!-- Tier 2: Sedan (Selected Default) -->
            <div class="fleet-card selected" id="card-sedan" onclick="selectFleetTier(this, 'Sedan', '₹2,288', '₹22/km')" style="background: var(--card-surface); border: 2px solid #F59E0B; border-radius: 14px; padding: 13px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(245,158,11,0.15);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 52px; height: 38px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--card-border); display: flex; align-items: center; justify-content: center; font-size: 20px;">🚕</div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 800; color: var(--text-primary);">Sedan</span>
                    <span style="font-size: 9.5px; font-weight: 900; background: #F59E0B; color: #0F172A; padding: 2px 6px; border-radius: 4px;">MOST POPULAR</span>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Dzire, Etios, Amaze • 4 Seats • 3 Bags</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 17px; font-weight: 900; color: #F59E0B;">₹2,288</div>
                <div style="font-size: 10.5px; font-weight: 700; color: #10B981;">₹22/km</div>
              </div>
            </div>

            <!-- Tier 3: Executive Sedan -->
            <div class="fleet-card" id="card-execsedan" onclick="selectFleetTier(this, 'Executive Sedan', '₹2,704', '₹26/km')" style="background: var(--card-surface); border: 1.5px solid var(--card-border); border-radius: 14px; padding: 13px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s ease;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 52px; height: 38px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--card-border); display: flex; align-items: center; justify-content: center; font-size: 20px;">🏎️</div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 800; color: var(--text-primary);">Executive Sedan</span>
                    <span style="font-size: 9.5px; font-weight: 900; background: var(--input-bg); color: var(--text-muted); padding: 2px 5px; border-radius: 4px;">PREMIUM</span>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Ciaz, City, Verna • 4 Seats • 4 Bags</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 17px; font-weight: 900; color: #F59E0B;">₹2,704</div>
                <div style="font-size: 10.5px; font-weight: 700; color: #10B981;">₹26/km</div>
              </div>
            </div>

            <!-- Tier 4: XUV -->
            <div class="fleet-card" id="card-xuv" onclick="selectFleetTier(this, 'XUV (6+1)', '₹2,808', '₹27/km')" style="background: var(--card-surface); border: 1.5px solid var(--card-border); border-radius: 14px; padding: 13px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s ease;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 52px; height: 38px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--card-border); display: flex; align-items: center; justify-content: center; font-size: 20px;">🚙</div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 800; color: var(--text-primary);">Family XUV</span>
                    <span style="font-size: 9.5px; font-weight: 900; background: var(--input-bg); color: var(--text-muted); padding: 2px 5px; border-radius: 4px;">6+1 SEATER</span>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Ertiga, Carens, Scorpio • 6 Seats • 5 Bags</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 17px; font-weight: 900; color: #F59E0B;">₹2,808</div>
                <div style="font-size: 10.5px; font-weight: 700; color: #10B981;">₹27/km</div>
              </div>
            </div>

            <!-- Tier 5: Luxury XUV -->
            <div class="fleet-card" id="card-luxuryxuv" onclick="selectFleetTier(this, 'Luxury XUV', '₹3,536', '₹34/km')" style="background: var(--card-surface); border: 1.5px solid var(--card-border); border-radius: 14px; padding: 13px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s ease;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 52px; height: 38px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--card-border); display: flex; align-items: center; justify-content: center; font-size: 20px;">✨</div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 800; color: var(--text-primary);">Innova Crysta</span>
                    <span style="font-size: 9.5px; font-weight: 900; background: #D97706; color: #fff; padding: 2px 6px; border-radius: 4px;">VIP LUXURY</span>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Innova Crysta Captain Seats • 7 Seats</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 17px; font-weight: 900; color: #F59E0B;">₹3,536</div>
                <div style="font-size: 10.5px; font-weight: 700; color: #10B981;">₹34/km</div>
              </div>
            </div>

          </div>

          <!-- Fixed Bottom Action Bar -->
          <div style="position: fixed; bottom: 0; left: 0; right: 0; max-width: 440px; margin: 0 auto; background: var(--card-surface); border-top: 1px solid var(--card-border); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; z-index: 10;">
            <div>
              <div style="font-size: 10px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px;">TOTAL GUARANTEED FARE</div>
              <div id="fleet-selected-price" style="font-size: 19px; font-weight: 900; color: var(--text-primary); margin-top: 1px;">₹2,288</div>
              <div id="fleet-selected-name" style="font-size: 11px; color: #10B981; font-weight: 700;">Sedan • Tolls & Driver Included</div>
            </div>

            <button onclick="confirmFleetSelection()" style="padding: 12px 20px; border-radius: 12px; background: #F59E0B; color: #0F172A; font-weight: 900; font-size: 13.5px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(245,158,11,0.3);">
              <span id="fleet-confirm-btn-text">Confirm Sedan</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        `;

  html = html.substring(0, sIdx) + newFleetHtml + html.substring(eIdx);
}

// Add selectFleetTier and confirmFleetSelection functions
if (!html.includes('function selectFleetTier(')) {
  const fleetJs = `
    var currentSelectedTierName = 'Sedan';
    var currentSelectedTierPrice = '₹2,288';

    function selectFleetTier(card, name, fare, rate) {
      document.querySelectorAll('.fleet-card').forEach(function(c) {
        c.style.borderColor = 'var(--card-border)';
        c.style.borderWidth = '1.5px';
        c.style.boxShadow = 'none';
      });
      card.style.borderColor = '#F59E0B';
      card.style.borderWidth = '2px';
      card.style.boxShadow = '0 4px 14px rgba(245,158,11,0.2)';
      currentSelectedTierName = name;
      currentSelectedTierPrice = fare;

      var pEl = document.getElementById('fleet-selected-price');
      if (pEl) pEl.textContent = fare;
      var nEl = document.getElementById('fleet-selected-name');
      if (nEl) nEl.textContent = name + ' • Tolls & Driver Included';
      var btnEl = document.getElementById('fleet-confirm-btn-text');
      if (btnEl) btnEl.textContent = 'Confirm ' + name;
    }

    function confirmFleetSelection() {
      switchScreen('booking');
      var bTitle = document.getElementById('booking-tier-title');
      if (bTitle) bTitle.textContent = currentSelectedTierName + ' (' + currentSelectedTierPrice + ')';
    }
  `;

  html = html.replace('function selectTier(', `${fleetJs}\n    function selectTier(`);
}

fs.writeFileSync(previewPath, html, 'utf8');
console.log('Successfully applied inDrive outstation fleet screen!');
