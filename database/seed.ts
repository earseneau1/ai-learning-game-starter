import { seedStartupSprint } from './seed-lib';

seedStartupSprint().then(() => console.log('Startup Sprint seed data loaded.')).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed.');
  process.exitCode = 1;
});
