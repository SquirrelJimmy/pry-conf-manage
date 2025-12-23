import { spawnSync } from 'node:child_process';
import path from 'node:path';

import 'dotenv/config';

import { hashPassword } from '../src/auth/password';

function ensureBetterSqlite3() {
  const script = path.join(__dirname, '..', 'scripts', 'ensure-better-sqlite3.mjs');
  const res = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

async function main() {
  ensureBetterSqlite3();

  // 运行时通过 ts-node 执行，因此这里可以 require 生成的 TS Client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('../src/generated/prisma/client');

  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';
  const displayName = process.env.DEFAULT_ADMIN_DISPLAY_NAME || '管理员';

  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { username },
    create: { username, passwordHash, displayName },
    update: { passwordHash, displayName },
  });

  await prisma.$disconnect();

  console.log(`[seed] 已确保默认用户存在: ${username}`);
  console.log(
    '[seed] 默认密码来自 DEFAULT_ADMIN_PASSWORD（为避免泄漏，seed 不会在日志中输出明文）',
  );
}

main().catch((e) => {
  console.error('[seed] 执行失败:', e);
  process.exit(1);
});
