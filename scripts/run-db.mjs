import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const [requestedProvider, command, ...args] = process.argv.slice(2);
// Vercel installation must generate the deployment Client, not local SQLite.
const provider =
  requestedProvider === 'auto' && command === 'generate'
    ? process.env.VERCEL
      ? 'supabase'
      : 'sqlite'
    : requestedProvider;
const commands = [
  'dev',
  'build',
  'start',
  'typecheck',
  'generate',
  'validate',
  'setup',
  'deploy',
  'migrate',
  'studio',
];

if (!['supabase', 'sqlite'].includes(provider) || !commands.includes(command)) {
  throw new Error(
    '지원하지 않는 DB 실행 명령입니다. docs/SQLITE.md를 확인하세요.',
  );
}
if (provider === 'sqlite' && process.env.VERCEL) {
  throw new Error('로컬 SQLite 명령은 Vercel에서 사용할 수 없습니다.');
}
if (
  provider !== 'sqlite' &&
  ['setup', 'deploy', 'migrate', 'studio'].includes(command)
) {
  throw new Error('이 명령은 로컬 SQLite 전용입니다.');
}
if (
  provider === 'sqlite' &&
  ['deploy', 'migrate', 'studio'].includes(command) &&
  args.some((arg) => /^--(?:config|schema|url|from|to)/.test(arg))
) {
  throw new Error('SQLite 명령에서 연결 대상·설정 경로를 덮어쓸 수 없습니다.');
}

const env = { ...process.env, STARTER_DB_PROVIDER: provider };
if (provider === 'sqlite') {
  // Prevent Next.js dotenv loading from overriding the isolated DB mode.
  env.DATABASE_URL = '';
  env.DIRECT_URL = '';
  env.SHADOW_DATABASE_URL = '';
}
const config =
  provider === 'sqlite' ? 'prisma.sqlite.config.ts' : 'prisma.config.ts';

async function run(module, cliArgs) {
  const child = spawn(process.execPath, [require.resolve(module), ...cliArgs], {
    stdio: 'inherit',
    env,
    windowsHide: true,
  });
  const stop = () => child.kill('SIGTERM');
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  try {
    const code = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    });
    if (code !== 0) process.exit(code);
  } finally {
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
  }
}

const prisma = (...cliArgs) =>
  run('prisma/build/index.js', [...cliArgs, '--config', config]);

if (command === 'generate' || command === 'validate') {
  await prisma(command);
} else if (command === 'deploy') {
  await prisma('migrate', 'deploy', ...args);
} else if (command === 'setup') {
  // Applies only checked-in migrations to the fixed local SQLite file.
  await prisma('migrate', 'deploy');
  await prisma('generate');
} else if (command === 'migrate') {
  await prisma('migrate', 'dev', ...args);
  await prisma('generate');
} else if (command === 'studio') {
  await prisma('studio', ...args);
} else if (command === 'start') {
  await run('next/dist/bin/next', ['start', ...args]);
} else {
  if (provider === 'sqlite' && command === 'dev') {
    await prisma('migrate', 'deploy');
  }
  await prisma('generate');
  if (command === 'typecheck') {
    await run('next/dist/bin/next', ['typegen']);
    await run('typescript/bin/tsc', ['--noEmit']);
  } else {
    await run('next/dist/bin/next', [command, ...args]);
  }
}
