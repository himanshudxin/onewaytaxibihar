const fs = require('fs');
const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error('File not found:', file);
  process.exit(1);
}
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
let count = 0;
lines.forEach((l, idx) => {
  if (emojiRegex.test(l)) {
    count++;
    console.log(`L${idx + 1}: ${l.trim()}`);
  }
});
console.log(`Total: ${count}`);

