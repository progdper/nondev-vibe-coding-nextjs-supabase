import 'server-only';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated_prisma/client';
import { createDatabaseConnectionConfig } from './database-tls';
import { getDatabaseEnv } from './env';
import { getSqliteUrl } from './sqlite';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getDb(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const provider = process.env.STARTER_DB_PROVIDER ?? 'supabase';
  if (!['sqlite', 'supabase'].includes(provider)) {
    throw new Error('DB 모드가 올바르지 않습니다. npm 실행 명령을 확인하세요.');
  }
  const adapter =
    provider === 'sqlite'
      ? new PrismaBetterSqlite3({ url: getSqliteUrl() })
      : new PrismaPg(
          createDatabaseConnectionConfig(getDatabaseEnv().DATABASE_URL),
        );
  const prisma = new PrismaClient({ adapter });
  globalForPrisma.prisma = prisma;
  return prisma;
}
