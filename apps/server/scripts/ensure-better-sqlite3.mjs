import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function canLoadBetterSqlite3() {
  try {
    const Database = require('better-sqlite3');
    // better-sqlite3 的 native binding 可能在 new Database 时才触发加载，
    // 所以这里必须做一次最小化实例化来捕获 ABI 不匹配问题。
    const db = new Database(':memory:');
    db.close();
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function isLikelyAbiMismatch(error) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('NODE_MODULE_VERSION') ||
    message.includes('ERR_DLOPEN_FAILED') ||
    message.includes('was compiled against a different Node.js version')
  );
}

const first = canLoadBetterSqlite3();
if (first.ok) {
  process.exit(0);
}

const message = first.error instanceof Error ? first.error.message : String(first.error);
if (!isLikelyAbiMismatch(first.error)) {
  console.error('[ensure-better-sqlite3] 无法加载 better-sqlite3：');
  console.error(message);
  process.exit(1);
}

console.warn('[ensure-better-sqlite3] 检测到 better-sqlite3 与当前 Node ABI 不匹配，准备自动重建。');
console.warn(`[ensure-better-sqlite3] Node: ${process.version}, ABI: ${process.versions.modules}`);
console.warn('[ensure-better-sqlite3] 原始错误：');
console.warn(message);
console.warn('[ensure-better-sqlite3] 尝试在 better-sqlite3 包目录执行重建（prebuild-install / node-gyp）。');

let betterSqlite3Dir = null;
try {
  const pkgJson = require.resolve('better-sqlite3/package.json');
  betterSqlite3Dir = path.dirname(pkgJson);
} catch {
  // ignore
}

let rebuilt = { status: 1 };

if (betterSqlite3Dir) {
  const binDir = path.join(betterSqlite3Dir, 'node_modules', '.bin');
  const prebuildCmd = path.join(
    binDir,
    process.platform === 'win32' ? 'prebuild-install.cmd' : 'prebuild-install',
  );
  const nodeGypCmd = path.join(
    binDir,
    process.platform === 'win32' ? 'node-gyp.cmd' : 'node-gyp',
  );

  console.warn(`[ensure-better-sqlite3] 包目录：${betterSqlite3Dir}`);
  console.warn('[ensure-better-sqlite3] 执行：prebuild-install');
  rebuilt = spawnSync(prebuildCmd, [], {
    cwd: betterSqlite3Dir,
    stdio: 'inherit',
    shell: false,
  });

  if (rebuilt.status !== 0) {
    console.warn('[ensure-better-sqlite3] prebuild-install 失败，回退执行：node-gyp rebuild --release');
    rebuilt = spawnSync(nodeGypCmd, ['rebuild', '--release'], {
      cwd: betterSqlite3Dir,
      stdio: 'inherit',
      shell: false,
    });
  }
} else {
  const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  console.warn('[ensure-better-sqlite3] 无法定位 better-sqlite3 包目录，回退执行：pnpm rebuild better-sqlite3');
  rebuilt = spawnSync(pnpmCmd, ['rebuild', 'better-sqlite3'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

if (rebuilt.status !== 0) {
  console.error('[ensure-better-sqlite3] 自动重建失败。');
  console.error('请确认：');
  console.error('- 当前终端的 Node 版本就是你运行服务端的 Node 版本（例如 24.8.0）');
  console.error('- 本机具备原生编译环境（macOS: Xcode Command Line Tools）');
  process.exit(rebuilt.status ?? 1);
}

const second = canLoadBetterSqlite3();
if (second.ok) {
  console.log('[ensure-better-sqlite3] 重建成功。');
  process.exit(0);
}

console.error('[ensure-better-sqlite3] 已重建但仍无法加载 better-sqlite3：');
console.error(second.error instanceof Error ? second.error.message : String(second.error));
process.exit(1);
