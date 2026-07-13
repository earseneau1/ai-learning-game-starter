import { seedStartupSprint } from './seed-lib';

seedStartupSprint().then(() => console.log('Startup Sprint content and sessions reset.')).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Reset failed.');
  process.exitCode = 1;
});
