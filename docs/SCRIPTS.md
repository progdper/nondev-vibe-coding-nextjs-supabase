# SQLite·Supabase 실행 명령 안내

이 문서는 원본 보일러플레이트의 `package.json` scripts와 실행 코드를 기준으로 작성했습니다. 복사한 프로젝트에서 명령을 추가·변경했다면 실제 파일을 먼저 확인하세요. 아래 예시는 package.json이 있는 프로젝트 폴더에서 Node.js 24로 실행합니다. Windows PowerShell과 Linux에서 같은 npm 명령을 사용합니다.

**기본 명령은 SQLite, Supabase는 별도 이름으로 선택합니다.** DB 모드는 인증 방식과 별개이며, SQLite를 선택해도 이미 구현한 Supabase Auth가 로컬 인증으로 바뀌지 않습니다. 원본 보일러플레이트에는 가입·로그인·CRUD 화면과 테스트 실행 명령이 없습니다.

## 1. 개발·검사·빌드·실행

| 용도             | SQLite 기본         | Supabase 전용                | 명령의 기본 처리                                                                                                           |
| ---------------- | ------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 개발 서버        | `npm run dev`       | `npm run dev:supabase`       | SQLite는 미적용 이력 적용 → Client 생성 → 서버 실행. Supabase는 Client 생성 → 서버 실행이며 이력을 자동 적용하지 않습니다. |
| 타입 검사        | `npm run typecheck` | `npm run typecheck:supabase` | 해당 DB의 Client·Next.js 타입 생성 후 TypeScript 검사                                                                      |
| 종합 검사        | `npm run check`     | `npm run check:supabase`     | 해당 타입 검사 → lint → format:check 순서로 진행하며 실패하면 다음 단계는 실행하지 않습니다.                               |
| 배포용 파일 생성 | `npm run build`     | `npm run build:supabase`     | 해당 DB의 Client 생성 후 Next.js 빌드. 마이그레이션은 실행하지 않습니다.                                                   |
| 빌드 결과 실행   | `npm run start`     | `npm run start:supabase`     | 같은 DB 모드에서 만든 빌드 결과를 실행합니다. Client·테이블·빌드 결과를 자동 생성하지 않습니다.                            |

Client는 Prisma가 DB를 다루는 데 사용하는 자동 생성 코드입니다. typecheck·check·build는 `src/generated_prisma/`·`.next/`·`next-env.d.ts`·`tsconfig.tsbuildinfo` 등을 생성·갱신할 수 있습니다. 검사 통과는 실제 DB 접속·가입·예약·배포 검증을 뜻하지 않습니다.

위 표는 명령 자체의 준비 처리를 설명합니다. 이후 추가한 화면·서버 코드가 실행될 때 DB나 인증·외부 서비스에 접근할 수 있으므로, 빌드·서버 실행을 무조건 DB 미접속 명령이라고 판단하지 마세요.

## 2. DB 관리 명령

| 용도                | SQLite 기본                                 | Supabase 전용                                        | DB·파일에 미치는 영향                                                                                                                            |
| ------------------- | ------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Client 생성         | `npm run db:generate`                       | `npm run db:supabase:generate`                       | Client 파일을 생성·갱신합니다. DB 접속·테이블 변경은 하지 않습니다.                                                                              |
| 스키마 문법 검사    | `npm run db:validate`                       | `npm run db:supabase:validate`                       | 스키마 문법·설정을 확인합니다. 실제 DB 연결 검사는 아니며 DB를 변경하지 않습니다.                                                                |
| 읽기 전용 연결 검사 | `npm run db:check`                          | `npm run db:supabase:check`                          | SQLite는 기존 파일에서 SELECT 1, Supabase는 앱 SELECT 1과 Prisma의 스키마 조회를 수행합니다. DB·테이블·데이터·스키마 파일은 변경하지 않습니다.   |
| 개발 이력 생성·적용 | `npm run db:migrate:dev -- --name 변경이름` | `npm run db:supabase:migrate:dev -- --name 변경이름` | 이력 파일 생성과 개발 DB 변경을 수행합니다. SQLite 명령은 이후 Client도 생성합니다. Supabase는 완료 후 db:supabase:generate를 별도로 실행합니다. |
| 포함된 이력 적용    | `npm run db:migrate:deploy`                 | `npm run db:supabase:migrate:deploy`                 | 아직 적용하지 않은 이력을 해당 DB에 적용합니다. 새 이력이나 Client를 생성하지 않습니다.                                                          |
| DB 관리 화면        | `npm run db:studio`                         | `npm run db:supabase:studio`                         | Prisma Studio를 엽니다. 화면에서 데이터를 편집·삭제하면 DB가 변경됩니다.                                                                         |

SQLite 연결 검사에서 파일이 없으면 생성하지 않고 실패와 준비 방법을 안내합니다. `db:validate`나 `db:check` 성공만으로 테이블 준비·앱의 Prisma 어댑터·CRUD·인증·권한 검증을 완료했다고 판단하지 않습니다.

마이그레이션은 기존 데이터에 영향을 줄 수 있습니다. 실행 전에 대상 DB·SQL·데이터 보존·백업·복구 방침을 확인하세요. `migrate dev`에서 초기화 제안이 나와도 임의로 승인하지 않습니다. Supabase 운영 DB에는 개발 마이그레이션·reset·db push를 사용하지 않습니다. 검토된 운영 이력 반영은 별도 승인 후 진행합니다. 자세한 절차는 [Supabase 안내](SUPABASE_SETUP.md)와 [DB 지침](../.agent/database.md)을 따릅니다.

## 3. 공통 명령과 설치 후 자동 처리

| 명령                   | 역할과 영향                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm ci`               | package-lock.json 기준으로 의존성을 설치합니다. 기존 node_modules를 새로 구성하며 설치 후 postinstall을 실행합니다.                                    |
| `npm run lint`         | ESLint로 검사합니다. 자동 수정 옵션은 포함하지 않습니다.                                                                                               |
| `npm run format:check` | Prettier 서식만 검사합니다.                                                                                                                            |
| `npm run format`       | Prettier 대상 파일의 서식을 실제로 수정합니다. 변경 내용을 확인한 뒤 사용하세요.                                                                       |
| `postinstall`          | 설치 후 자동 실행되는 scripts 항목입니다. 로컬은 SQLite, VERCEL 환경은 Supabase Client를 생성합니다. DB 생성·마이그레이션·데이터 쓰기는 하지 않습니다. |

설치만 마쳤다면 SQLite 테이블은 아직 준비되지 않았을 수 있습니다. `npm run dev`가 자동 준비하거나, 서버 없이 준비하려면 아래 `db:sqlite:setup`을 사용합니다. Supabase 설치도 실제 테이블을 자동 생성하지 않습니다.

## 4. 기존 SQLite 별칭과 준비 명령

기본 명령으로 충분하며, 아래 SQLite 이름도 호환용으로 유지합니다.

| SQLite 명령                                    | 같은 역할의 기본 명령                       |
| ---------------------------------------------- | ------------------------------------------- |
| `npm run dev:sqlite`                           | `npm run dev`                               |
| `npm run build:sqlite`                         | `npm run build`                             |
| `npm run start:sqlite`                         | `npm run start`                             |
| `npm run typecheck:sqlite`                     | `npm run typecheck`                         |
| `npm run check:sqlite`                         | `npm run check`                             |
| `npm run db:sqlite:generate`                   | `npm run db:generate`                       |
| `npm run db:sqlite:validate`                   | `npm run db:validate`                       |
| `npm run db:sqlite:migrate -- --name 변경이름` | `npm run db:migrate:dev -- --name 변경이름` |
| `npm run db:sqlite:studio`                     | `npm run db:studio`                         |

`npm run db:sqlite:setup`은 **로컬 이력 적용 후 Client 생성**까지 하고 서버는 시작하지 않습니다. 따라서 이력만 적용하는 `db:migrate:deploy`와 처리 범위가 다릅니다. 새 DB 파일·테이블을 만들 수 있고, 새로 추가된 이력이 있으면 기존 DB에도 적용합니다. 초기화 명령은 아니지만 적용 SQL의 데이터 영향은 검토해야 합니다.

## 5. 상황별 실행 순서

### SQLite로 처음 개발

```bash
npm ci
npm run dev
```

개발 서버는 켜 둡니다. SQLite 파일은 재시작해도 유지됩니다. 개발 서버가 필요 없고 DB 준비·연결만 확인하려면 다음을 실행합니다.

```bash
npm run db:sqlite:setup
npm run db:check
```

### SQLite 검사와 빌드 결과 확인

개발 서버를 종료한 뒤 실행하세요. DB를 사용하는 화면이라면 먼저 로컬 이력이 적용되어 있어야 합니다. 아래 검사·빌드는 DB를 자동 준비하지 않습니다.

```bash
npm run check
npm run build
npm run start
```

### Supabase 개발

먼저 [Supabase 설정](SUPABASE_SETUP.md)에 따라 별도 테스트 프로젝트·인증서·연결 정보를 준비합니다. DB 선택과 인증 선택은 [시작 안내](SETUP.md)를 따릅니다. 필요한 개발 테이블은 대상·변경안을 확인하고 승인된 이력으로 따로 준비하세요. 연결 정보가 준비됐을 때 다음을 실행합니다.

```bash
npm run db:supabase:validate
npm run db:supabase:check
npm run dev:supabase
```

개발 모델을 변경했다면 별도로 승인된 범위에서 `npm run db:supabase:migrate:dev -- --name 변경이름`을 실행하고, 완료 후 `npm run db:supabase:generate`로 Client를 생성해 서버를 재시작합니다. 위 순서를 자동 운영 마이그레이션으로 사용하지 않습니다.

### Supabase 빌드·실행과 Vercel

```bash
npm run check:supabase
npm run build:supabase
npm run start:supabase
```

Vercel에서는 Install Command를 `npm ci`, Build Command를 다음으로 설정합니다. Next.js 배포 런타임은 Vercel이 관리하므로 위 start:supabase를 별도 Vercel 시작 명령으로 등록하는 절차는 아닙니다.

```bash
npm run check:supabase && npm run build:supabase
```

이 명령은 Supabase 마이그레이션을 실행하지 않습니다. 실제 설정·배포·DB 반영 절차는 [Vercel 안내](VERCEL_DEPLOYMENT.md)를 따릅니다. 파일 SQLite를 Vercel 운영 DB로 배포하는 구성은 지원하지 않습니다.

## 6. DB 모드를 바꿀 때

1. 기존 개발·실행 서버와 Studio를 종료합니다.
2. 대상 DB의 모델·타입·관계·이력과 데이터 보존·이전 필요성을 확인합니다. 모드 변경은 데이터 자동 이전이 아닙니다.
3. 대상 모드의 검사·빌드·개발 명령을 사용합니다. start는 새로 생성하지 않으므로 반드시 같은 모드의 build 후 실행합니다.
4. 실제 인증·권한·읽기·쓰기를 선택한 테스트 환경에서 별도로 확인합니다.

두 모드는 `src/generated_prisma/`와 `.next/` 출력을 공유합니다. 마지막에 생성·빌드한 모드의 결과로 바뀌므로 같은 폴더에서 동시에 실행하지 마세요. SQLite 모델은 `prisma/sqlite/schema.prisma`, Supabase 모델은 `prisma/supabase/schema.prisma`를 사용합니다. 직접 npx prisma를 실행하면 루트 `prisma.config.ts`의 Supabase 설정이 선택되므로 로컬 작업에는 위 npm 명령을 사용하세요.

SQLite용 DB 명령은 실제 .env 없이 동작하지만 Next.js 명령은 환경 파일을 읽을 수 있습니다. 이미 운영 .env가 있는 프로젝트의 앱 검증에는 실제 환경 파일을 제외한 별도 작업 복사본을 사용하세요. 비밀값을 채팅·로그·저장소에 공개하지 않습니다.

[시작 안내](SETUP.md) · [프로젝트 확인표](CUSTOMIZE_PROJECT.md) · [SQLite 상세 안내](SQLITE.md) · [Supabase 연결](SUPABASE_SETUP.md)
