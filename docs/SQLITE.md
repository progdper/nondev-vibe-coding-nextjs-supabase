# 파일 기반 SQLite로 로컬 개발하기

Supabase 가입·연결 없이 DB 저장 기능을 개발할 때 사용하는 선택 사항입니다. 데이터는 `prisma/sqlite/dev.db`에 저장되며 개발 서버·PC를 재시작해도 유지됩니다. 메모리 DB나 브라우저 저장소가 아닙니다. 여러 팀원의 PC에 있는 파일은 자동 공유되지 않습니다.

## 처음 시작

프로젝트 폴더에서 Node.js 24로 실행하세요.

```bash
npm ci
npm run dev
```

`npm run dev`와 별칭 `npm run dev:sqlite`는 포함된 SQLite 마이그레이션 중 아직 적용하지 않은 이력을 적용하고, Client를 생성한 뒤 개발 서버를 시작합니다. 새 파일이면 기본 users 테이블을 만듭니다. 별도 setup 명령을 먼저 실행할 필요는 없습니다. DB 준비에 실패하면 서버를 시작하지 않으므로 터미널의 오류를 확인하세요.

이미 적용한 이력은 반복 적용하지 않으며 DB를 초기화하지 않습니다. 다만 이후 추가된 마이그레이션 자체에 삭제·컬럼 변경이 포함될 수 있으므로, 새 이력을 만들거나 공유받으면 `npm run dev` 실행 전에 SQL과 데이터 보존 방침을 검토하세요. 자동 적용은 로컬 SQLite 개발 서버에만 해당하며 `npm run dev:supabase`는 마이그레이션을 자동 실행하지 않습니다. `npm run db:sqlite:setup`은 서버를 띄우지 않고 같은 DB 준비·Client 생성만 수행할 때 사용합니다.

Supabase용 `.env`나 CA가 필요하지 않습니다. SQLite CLI 설정은 `.env`를 로딩하지 않고 고정된 로컬 파일만 사용합니다. SQLite 앱 명령도 DB 모드를 지정하고 원격 DB 연결 변수를 빈 값으로 덮어써 원격 DB에 접속하지 않습니다. Next.js 자체는 환경 파일을 로딩할 수 있으므로 다른 설정·비밀값 관리까지 생략되는 것은 아닙니다. 운영용 `.env`는 보일러플레이트에 공유하지 마세요.

기본 첫 화면은 DB를 사용하지 않습니다. 서버 기능은 기존처럼 `src/lib/db.ts`의 `getDb()`를 사용하고, 선택한 명령에 따라 SQLite 또는 PostgreSQL 어댑터가 적용됩니다. SQLite 선택만으로 CRUD 화면·로그인이 만들어지는 것은 아닙니다.

## 명령 선택

SQLite·Supabase의 전체 명령 비교표, DB 변경 여부, 별칭과 실행 순서는 [실행 명령 안내](SCRIPTS.md)를 참고하세요. 기본 명령은 SQLite이며 Supabase는 :supabase 또는 db:supabase:\* 명령을 사용합니다.

Studio에서는 데이터가 바뀔 수 있습니다. 마이그레이션도 생성·실제 적용 범위를 확인한 뒤 실행하세요. `db:supabase:check`는 Supabase 전용 연결 검사이며 SQLite 확인에 사용하지 않습니다. `npm run db:check`는 기존 SQLite 파일을 읽기 전용으로 열어 SELECT 1을 실행합니다. DB 파일이 없으면 생성하지 않고 준비 명령을 안내하며 실패합니다. Node.js 24 내장 SQLite를 사용하므로 앱의 Prisma 어댑터·테이블 준비·CRUD 검증을 대신하지 않습니다. .env를 읽거나 Client를 생성하지 않습니다. SQLite 명령은 `VERCEL` 환경에서 차단합니다.

기존 `db:sqlite:generate`·`db:sqlite:validate`·`db:sqlite:migrate`·`db:sqlite:studio` 명령도 유지합니다. `db:migrate:deploy`는 포함된 이력만 적용하며 Client는 생성하지 않습니다. 서버 없이 이력 적용과 Client 생성까지 하려면 `db:sqlite:setup`을 사용하세요. `npm ci` 후에는 로컬에서 SQLite Client만 생성하고, DB·테이블 준비는 `npm run dev`에서 수행합니다. Vercel 설치는 Supabase Client를 생성합니다. 직접 `npx prisma`를 실행하면 루트 Supabase 설정을 읽으므로, 로컬 작업에는 위 npm 명령을 사용하세요.

## 파일과 모델 관리

- PostgreSQL 기준은 `prisma/supabase/schema.prisma`, SQLite 기준은 `prisma/sqlite/schema.prisma`입니다. SQLite에는 PostgreSQL 전용 `@db.Uuid`가 없지만 기본 id 값은 UUID 문자열로 생성됩니다.
- SQLite 이력은 `prisma/sqlite/migrations/`, PostgreSQL 이력은 `prisma/supabase/migrations/`로 분리합니다. SQLite 이력을 PostgreSQL 폴더로 복사하지 않습니다.
- 두 스키마는 별도로 관리하므로 공통 기능을 바꿀 때 필드·관계·제약·날짜 처리·API 타입의 일치 여부를 함께 확인합니다. 특정 DB만 지원하는 기능은 명시하고 전환 가능하다고 단정하지 않습니다.
- Client 출력은 `src/generated_prisma/`를 공유합니다. **같은 폴더에서 두 모드를 동시에 실행하지 마세요.** 서버를 종료한 뒤 대상 모드의 검사·개발·빌드 명령을 실행하면 필요한 Client가 다시 생성됩니다. 두 모드를 병렬로 쓰려면 폴더도 분리합니다.
- 일반 `npm run check`는 SQLite Client를 생성하며 `check:sqlite`도 같습니다. Supabase 검사에는 `npm run check:supabase`를 사용하고, 모드를 바꾼 뒤에는 기존 서버를 반드시 재시작합니다.
- DB 파일과 journal·WAL 파일은 Git에서 제외하고 마이그레이션 SQL만 공유합니다. DB 파일을 삭제하거나 초기화하는 명령은 기본으로 제공하지 않습니다. 보존이 필요하면 서버·Studio를 종료한 후 일관된 백업과 복구 절차를 확인합니다.

## SQLite 모델을 Supabase에서도 사용하려면

두 schema.prisma는 DB의 설계도이며 한쪽을 수정해도 다른 쪽은 자동으로 바뀌지 않습니다. SQLite에서 기능을 만든 뒤 Supabase에서도 사용하려면 에이전트에게 다음처럼 요청하세요.

> SQLite에서 만든 예약 기능을 Supabase에서도 사용하려고 합니다. 두 스키마와 관련 코드를 비교하고, Supabase에만 있는 모델·설정은 유지하면서 필요한 변경안과 영향을 먼저 보여 주세요. 승인 전에는 수정하지 말고, DB 접속·마이그레이션·데이터 이전·배포는 진행하지 마세요.

1. 에이전트가 두 스키마와 관련 코드·이력을 비교합니다. 파일 비교만으로 실제 DB 상태를 확인한 것은 아닙니다.
2. 옮길 모델·필드·관계와 PostgreSQL에 맞춰 조정할 타입·제약을 설명하고 변경안을 보여 줍니다. 전체 파일을 복사해 덮어쓰지 않습니다.
3. 변경안을 확인하고 승인하면 해당 범위만 Supabase 스키마에 반영합니다. Supabase에만 있는 내용이나 삭제 여부가 불명확한 항목은 별도로 확인합니다.
4. 승인된 범위에서 스키마 문법과 관련 코드 호환성을 검사하고, 확인한 결과와 미검증 항목을 알려 줍니다.

**스키마 수정만으로 Supabase에 테이블이 생기거나 SQLite 데이터가 옮겨지지는 않습니다.** 실제 DB 변경·데이터 이전·배포는 대상 환경과 데이터 보존 여부를 확인한 뒤 별도로 승인하여 진행합니다. SQLite 마이그레이션 파일은 Supabase 폴더로 복사하지 않습니다. 에이전트의 상세 작업 기준은 [DB 지침](../.agent/database.md#sqlite-모델-변경을-supabase에-반영)에 있습니다.

## Supabase·Vercel로 전환

1. 로컬 데이터를 버려도 되는지, 보존·이전해야 하는지 정합니다. DB 파일을 업로드한다고 PostgreSQL 데이터로 변환되지는 않습니다.
2. **별도 테스트 Supabase 프로젝트**와 연결 정보를 준비합니다. 기존 운영 `.env`를 테스트에 재사용하지 않습니다. [Supabase 설정](SUPABASE_SETUP.md)
3. PostgreSQL 스키마·타입·관계·제약과 생성 SQL을 검토하고 해당 DB용 마이그레이션을 승인 후 적용합니다. SQLite와 동일하게 동작한다고 가정하지 않습니다.
4. 데이터 보존이 필요하면 UUID·날짜·중복·관계를 포함한 이관·검증·실패 시 복구 계획을 먼저 세웁니다. 필요 없으면 빈 테스트 DB에서 시작하며 자동 이관은 하지 않습니다.
5. SQLite 서버를 종료하고 Supabase용 `npm run dev:supabase`, `npm run check:supabase`, `npm run build:supabase`로 전환해 실제 읽기·쓰기·권한을 별도로 검증합니다.
6. Vercel의 Build Command는 `npm run check:supabase && npm run build:supabase`로 설정하고, 앱에는 Supabase 연결을 등록합니다. `STARTER_DB_PROVIDER=sqlite`를 Vercel에 등록하지 않습니다. [배포 안내](VERCEL_DEPLOYMENT.md)

Vercel의 로컬 파일은 영구 공용 DB 저장소로 보장되지 않습니다. 로컬 파일 SQLite를 그대로 운영 DB로 배포하는 구성은 지원하지 않습니다. [Vercel 공식 안내](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel), [Prisma SQLite 안내](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite)

SQLite 어댑터는 네이티브 모듈을 사용합니다. 지원되는 Node.js·운영체제에 맞는 바이너리가 없으면 설치 시 빌드 도구가 필요할 수 있습니다. 모듈을 다른 OS에서 복사하지 말고 해당 환경에서 npm ci를 실행하세요. Windows 검증만으로 Linux·Vercel 검증을 완료했다고 보지 않습니다.

## 보일러플레이트의 로컬 검증 범위

Windows·Node.js 24의 임시 복사본에서 SQLite 스키마 검사·초기 테이블 생성·명령 재실행, 앱 getDb()를 통한 생성·조회·수정·삭제·UUID·날짜·고유 제약과 별도 프로세스에서의 데이터 유지를 확인했습니다. SQLite 모드의 타입·린트·서식·빌드와 요청 시 DB를 조회하는 임시 Next.js 경로의 로컬 HTTP 응답도 확인했습니다. 확인용 코드·데이터는 원본에 포함하지 않습니다.

이는 실제 회원가입·CRUD 화면·사용자 권한 검증이나 Supabase 데이터 이전·Vercel 배포 성공을 뜻하지 않습니다. Linux 네이티브 모듈 설치·실행도 별도 검증 대상입니다. 복사한 프로젝트는 자신의 모델·환경에서 다시 확인하세요.
