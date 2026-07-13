import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDatabase } from './client';

const { db, client } = createDatabase();
try {
  await migrate(db, { migrationsFolder: './database/migrations' });
  console.log('Database migrations complete.');
} finally { await client.end(); }
