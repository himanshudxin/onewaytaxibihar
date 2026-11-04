const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'mobile', 'index.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/case 'passenger': return '.*?';/, "case 'passenger': return '🚖 Passenger';");
content = content.replace(/case 'driver': return '.*?';/, "case 'driver': return '🧑‍✈️ Driver Partner';");
content = content.replace(/case 'admin': return '.*?';/, "case 'admin': return '🛡️ Admin V2';");
content = content.replace(/default: return '.*?';/, "default: return '🚖 Passenger';");

content = content.replace(/<Text style=\{styles\.pillArrow\}>.*?<\/Text>/, '<Text style={styles.pillArrow}>⇅</Text>');
content = content.replace(/OneWayTaxiBihar .*? Preview Hub/, 'OneWayTaxiBihar • Preview Hub');

fs.writeFileSync(file, content, 'utf8');
console.log('✅ mobile/index.js cleaned up cleanly.');

