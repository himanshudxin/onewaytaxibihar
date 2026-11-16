const fs = require('fs');
let content = fs.readFileSync('mobile/shared/components/UberMapView.tsx', 'utf8');
content = content.replace("import { useTheme } from '../theme/ThemeContext';", "import { useTheme } from '../../../../shared/theme/ThemeContext';");
fs.writeFileSync('mobile/apps/passenger/src/components/UberMapView.tsx', content, 'utf8');
console.log('Synchronized passenger UberMapView successfully');

