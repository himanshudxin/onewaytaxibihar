const fs = require('fs');
const path = require('path');
const prdFile = path.join(__dirname, '..', 'PRD.md');
const updateFile = path.join(__dirname, 'prd-update.txt');

let prd = fs.readFileSync(prdFile, 'utf8');
const updateText = fs.readFileSync(updateFile, 'utf8');

const anchor = '### Phase 33: 19-Point Production-Readiness Master Suite';
const endAnchor = '## 3. Ralph Loop Acceptance Criteria';

const startIdx = prd.indexOf(anchor);
const endIdx = prd.indexOf(endAnchor);

if (startIdx !== -1 && endIdx !== -1) {
  prd = prd.slice(0, startIdx) + updateText + '\n\n' + prd.slice(endIdx);
  fs.writeFileSync(prdFile, prd, 'utf8');
  console.log('✅ PRD.md updated with completed Phase 33 (19 requirements) and Phase 34 (Broadcast Dispatch).');
} else {
  console.log('❌ Anchors not found in PRD.md');
}

