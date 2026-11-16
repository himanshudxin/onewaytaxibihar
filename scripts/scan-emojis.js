const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

const fileMap = {};

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.git' || f === 'assets') continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (emojiRegex.test(l)) {
          const rel = path.relative(path.join(__dirname, '..'), full);
          if (!fileMap[rel]) fileMap[rel] = [];
          fileMap[rel].push({ line: idx + 1, text: l.trim() });
        }
      });
    }
  }
}

scanDir(path.join(__dirname, '..', 'mobile', 'apps'));
scanDir(path.join(__dirname, '..', 'mobile', 'shared'));

console.log('Files with emojis:');
for (const [file, items] of Object.entries(fileMap)) {
  console.log(`\n=== ${file} (${items.length}) ===`);
  items.forEach(it => console.log(`  L${it.line}: ${it.text}`));
}
console.log(`\nTotal files: ${Object.keys(fileMap).length}`);
