const fs = require('fs');
const content = fs.readFileSync('mobile/previews/passenger-app-preview.html', 'utf8');

const idx = content.indexOf('class="bottom-tabs-nav"');
console.log('=== BOTTOM TABS COMPLETE ===');
console.log(content.slice(idx, idx + 2200));
