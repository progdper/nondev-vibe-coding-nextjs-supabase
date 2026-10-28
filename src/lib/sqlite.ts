import { resolve } from 'node:path';

export function getSqliteUrl(): string {
  if (process.env.VERCEL) {
    throw new Error(
      '로컬 SQLite는 Vercel에서 사용할 수 없습니다. Supabase 연결을 설정하세요.',
    );
  }
  return `file:${resolve(process.cwd(), 'prisma/sqlite/dev.db').replaceAll('\\', '/')}`;
}
