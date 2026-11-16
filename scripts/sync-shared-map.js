const fs = require('fs');
let code = fs.readFileSync('mobile/apps/passenger/src/components/UberMapView.tsx', 'utf8');
code = code.replace(
  "import { useTheme } from '../../../../shared/theme/ThemeContext';",
  "import { useTheme } from '../theme/ThemeContext';"
);
fs.writeFileSync('mobile/shared/components/UberMapView.tsx', code, 'utf8');
console.log('Synchronized mobile/shared/components/UberMapView.tsx successfully');

