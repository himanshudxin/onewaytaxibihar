const fs = require('fs');
const path = require('path');

const OLD_VER = '20261116_v45_desk_otp';
const NEW_VER = '20261116_v45_desk_otp';

function bumpInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.expo' || file === '.agents') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      bumpInDir(fullPath);
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(OLD_VER)) {
        const updated = content.replaceAll(OLD_VER, NEW_VER);
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Updated cache version in: ${fullPath}`);
      }
    }
  }
}

bumpInDir('.');
console.log('Finished bumping version string.');
