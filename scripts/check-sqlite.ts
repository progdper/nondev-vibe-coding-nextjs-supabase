import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { getSqliteUrl } from '../src/lib/sqlite';

function main(): void {
  let db: DatabaseSync | undefined;

  try {
    const file = getSqliteUrl().slice('file:'.length);
    if (!existsSync(file)) {
      console.error(
        'SQLite DB 파일이 없습니다. npm run dev 또는 npm run db:sqlite:setup으로 먼저 준비하세요.',
      );
      process.exitCode = 1;
      return;
    }

    db = new DatabaseSync(file, { readOnly: true });
    const result = db.prepare('SELECT 1 AS connection_test').get();
    if (result?.connection_test !== 1) {
      throw new Error('Unexpected query result');
    }
    console.log('성공 · SQLite 읽기 전용 연결과 SELECT 1 조회');
    console.log(
      'DB 파일 생성·테이블·데이터·마이그레이션 변경은 수행하지 않았습니다.',
    );
  } catch {
    console.error(
      'SQLite 연결 점검에 실패했습니다. Vercel에서는 사용할 수 없습니다. 로컬 DB 파일의 형식·접근 권한과 Node.js 24 사용 여부를 확인하세요.',
    );
    process.exitCode = 1;
  } finally {
    try {
      db?.close();
    } catch {
      console.error('점검용 SQLite 연결을 종료하지 못했습니다.');
      process.exitCode = 1;
    }
  }
}

main();
