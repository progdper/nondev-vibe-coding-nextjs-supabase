import { defineConfig } from 'prisma/config';
import { getSqliteUrl } from './src/lib/sqlite';

// Local SQLite never loads remote database credentials from .env.
export default defineConfig({
  schema: 'prisma/sqlite/schema.prisma',
  migrations: { path: 'prisma/sqlite/migrations' },
  datasource: { url: getSqliteUrl() },
});
