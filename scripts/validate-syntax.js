const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let errors = 0;
let checked = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      checked++;
      try {
        execSync(`node --check "${full}"`, { stdio: 'pipe' });
      } catch (err) {
        console.error(`Syntax error in ${full}:`, err.stderr ? err.stderr.toString() : err.message);
        errors++;
      }
    }
  }
}

walk('.');
console.log(`Validation complete: Checked ${checked} JS files, ${errors} errors found.`);
process.exit(errors > 0 ? 1 : 0);
