// FULL RESET seed: wipes ALL challenges and submissions, then loads the free path + premium questions.
// To just add new questions without losing user data, use:  node prisma/updateCurriculum.js
const { PrismaClient } = require('@prisma/client');
const { curriculum } = require('../data/curriculum');
const { premiumCurriculum } = require('../data/premium');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old challenges...');
  await prisma.submission.deleteMany();
  await prisma.challenge.deleteMany();

  console.log('Adding learning path + premium questions...');
  for (const { tests, ...step } of curriculum) {
    await prisma.challenge.create({
      // Path steps have no creator (creatorId null); that is how the roadmap tells them apart from company challenges.
      data: { ...step, category: 'CODING', deadline: new Date('2030-12-31'), creatorId: null },
    });
  }
  for (const { tests, ...q } of premiumCurriculum) {
    await prisma.challenge.create({ data: { ...q, deadline: new Date('2030-12-31'), creatorId: null } });
  }

  console.log(`Seeded ${curriculum.length} free steps + ${premiumCurriculum.length} premium questions 🎉`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
