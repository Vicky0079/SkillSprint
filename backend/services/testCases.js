// Test cases for the INSTANT (local) grader.
// They now come from backend/data/curriculum.js (one single source of truth),
// matched by the exact challenge title. Challenges without tests can't be verified
// by the local grader, so it can never give them full marks.
const { curriculum } = require('../data/curriculum');
const { premiumCurriculum } = require('../data/premium');

const TESTS_BY_TITLE = new Map([...curriculum, ...premiumCurriculum].map((c) => [c.title.trim().toLowerCase(), c.tests]));

const getTestCases = (title) => {
  if (!title) return [];
  return TESTS_BY_TITLE.get(title.trim().toLowerCase()) || [];
};

module.exports = { getTestCases };
