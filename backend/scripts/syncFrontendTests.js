// Regenerates frontend/src/data/testCases.js from backend/data/curriculum.js + premium.js
// Run from the backend folder:  node scripts/syncFrontendTests.js
const fs = require('fs');
const path = require('path');
const { curriculum } = require('../data/curriculum');
const { premiumCurriculum } = require('../data/premium');

const map = {};
for (const c of [...curriculum, ...premiumCurriculum]) map[c.title.trim().toLowerCase()] = c.tests;

const file = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'testCases.js');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file,
  '// AUTO-GENERATED from backend/data/curriculum.js. Do not edit by hand.\n' +
  '// Regenerate with: cd backend && node scripts/syncFrontendTests.js\n' +
  'export const TESTS_BY_TITLE = ' + JSON.stringify(map, null, 2) + ';\n');
console.log('Wrote', file);
