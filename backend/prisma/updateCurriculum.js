// Safe curriculum update: ADDS new questions and re-orders the path.
// It does NOT delete anything, so users, XP, Premium and submissions are kept.
// Run from the backend folder:  node prisma/updateCurriculum.js
const { PrismaClient } = require('@prisma/client');
const { curriculum } = require('../data/curriculum');
const { premiumCurriculum } = require('../data/premium');
const prisma = new PrismaClient();

async function main() {
  let created = 0, updated = 0;

  // Free learning path: existing steps only get their new position, new steps are created.
  for (const { tests, ...step } of curriculum) {
    const existing = await prisma.challenge.findFirst({ where: { title: step.title } });
    if (existing) {
      await prisma.challenge.update({ where: { id: existing.id }, data: { order: step.order } });
      updated += 1;
    } else {
      await prisma.challenge.create({
        data: { ...step, category: 'CODING', deadline: new Date('2030-12-31'), creatorId: null },
      });
      created += 1;
      console.log(`  + added step ${step.order}: ${step.title}`);
    }
  }

  // Premium questions: created, or refreshed if they already exist (so edits in premium.js are picked up).
  let premiumCreated = 0, premiumRefreshed = 0;
  for (const { tests, ...q } of premiumCurriculum) {
    const existing = await prisma.challenge.findFirst({ where: { title: q.title, isPremium: true } });
    if (existing) {
      await prisma.challenge.update({ where: { id: existing.id }, data: q });
      premiumRefreshed += 1;
    } else {
      await prisma.challenge.create({ data: { ...q, deadline: new Date('2030-12-31'), creatorId: null } });
      premiumCreated += 1;
      console.log(`  + premium ${q.isBonus ? 'bonus' : q.company}: ${q.title}`);
    }
  }

  console.log(`\nFree path:  ${created} added, ${updated} re-ordered (${curriculum.length} steps).`);
  console.log(`Premium:    ${premiumCreated} added, ${premiumRefreshed} refreshed (${premiumCurriculum.length} questions).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
