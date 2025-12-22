#!/usr/bin/env node
/**
 * 从 GitHub 拉取 sing-box 指定 tag 的 docs/configuration 文档到本地目录。
 *
 * 目标：
 * - 不依赖 git（不 clone、不 sparse checkout）
 * - 文档落地到被 .gitignore 忽略的目录（默认 .cache/singbox-config-docs/）
 *
 * 用法：
 *   node scripts/fetch-sing-box-docs.mjs
 *   node scripts/fetch-sing-box-docs.mjs --tag v1.12.13 --out .cache/singbox-config-docs
 *
 * 可选环境变量：
 *   GITHUB_TOKEN=...  （提高 API 额度，避免匿名限流）
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULTS = {
  owner: 'SagerNet',
  repo: 'sing-box',
  tag: 'v1.12.13',
  sourcePath: 'docs/configuration',
  outDir: '.cache/singbox-config-docs',
  clean: true,
  extractSchemasTo: 'packages/sing-box-config/schemas',
  onlySchemas: false,
};

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--tag') {
      args.tag = argv[index + 1];
      index++;
      continue;
    }
    if (token === '--out') {
      args.outDir = argv[index + 1];
      index++;
      continue;
    }
    if (token === '--owner') {
      args.owner = argv[index + 1];
      index++;
      continue;
    }
    if (token === '--repo') {
      args.repo = argv[index + 1];
      index++;
      continue;
    }
    if (token === '--path') {
      args.sourcePath = argv[index + 1];
      index++;
      continue;
    }
    if (token === '--no-clean') {
      args.clean = false;
      continue;
    }
    if (token === '--extract-schemas-to') {
      args.extractSchemasTo = argv[index + 1];
      index++;
      continue;
    }
    if (token === '--no-extract-schemas') {
      args.extractSchemasTo = null;
      continue;
    }
    if (token === '--only-schemas') {
      args.onlySchemas = true;
      continue;
    }
  }
  return args;
}

function printHelp() {
  console.log(`fetch-sing-box-docs

从 GitHub 下载 sing-box 指定 tag 的配置文档（默认：docs/configuration）到本地目录。

用法：
  node scripts/fetch-sing-box-docs.mjs [options]

选项：
  --tag <tag>        Git tag（默认：${DEFAULTS.tag}）
  --out <dir>        输出目录（默认：${DEFAULTS.outDir}）
  --owner <owner>    仓库 owner（默认：${DEFAULTS.owner}）
  --repo <repo>      仓库 repo（默认：${DEFAULTS.repo}）
  --path <path>      仓库内目录（默认：${DEFAULTS.sourcePath}）
  --no-clean         不清空输出目录（默认会清空重建）
  --extract-schemas-to <dir>  同步 3 个重要 schema 到目录（默认：${DEFAULTS.extractSchemasTo}）
  --no-extract-schemas        不同步那 3 个 schema 文件
  --only-schemas     只下载 3 个重要 schema（不递归下载全部 docs/configuration）
  -h, --help         显示帮助

环境变量：
  GITHUB_TOKEN       可选，提高 GitHub API 额度，减少匿名限流风险
`);
}

function normalizePathForGitIgnore(p) {
  const normalized = p.replaceAll('\\', '/').replace(/^\.\/+/, '');
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

async function ensureGitIgnoreHasDir(outDir) {
  if (normalizePathForGitIgnore(outDir).startsWith('.cache/')) {
    try {
      const current = await fs.readFile('.gitignore', 'utf8');
      const lines = current.split(/\r?\n/).map((l) => l.trim());
      if (lines.includes('.cache')) return;
      if (lines.includes('.cache/')) return;
    } catch {
      // ignore and fallback to append logic below
    }
  }

  const entry = normalizePathForGitIgnore(outDir);
  let current = '';
  try {
    current = await fs.readFile('.gitignore', 'utf8');
  } catch {
    await fs.writeFile('.gitignore', `${entry}\n`, 'utf8');
    console.warn(`[docs] ⚠️ 已创建 .gitignore 并添加：${entry}`);
    return;
  }

  const lines = current.split(/\r?\n/).map((l) => l.trim());
  if (lines.includes(entry.trim())) return;

  const next = current.endsWith('\n') ? current : `${current}\n`;
  await fs.writeFile('.gitignore', `${next}\n${entry}\n`, 'utf8');
  console.warn(`[docs] ⚠️ 已在 .gitignore 添加：${entry}`);
}

async function rmrf(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function mkdirp(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function createGitHubHeaders() {
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'pry-conf-manage-docs-fetcher',
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: createGitHubHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `[docs] 请求失败: ${res.status} ${res.statusText}\nURL: ${url}\n${text}`,
    );
  }
  return res.json();
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: createGitHubHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `[docs] 下载失败: ${res.status} ${res.statusText}\nURL: ${url}\n${text}`,
    );
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function listContentsRecursive({ owner, repo, ref, dirPath }) {
  const apiUrl = new URL(
    `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}`,
  );
  apiUrl.searchParams.set('ref', ref);

  const data = await fetchJson(apiUrl.toString());
  if (!Array.isArray(data)) {
    throw new Error(
      `[docs] 预期返回数组（目录 listing），实际返回：${JSON.stringify(data).slice(0, 200)}`,
    );
  }

  const files = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    if (item.type === 'file') {
      files.push(item);
      continue;
    }
    if (item.type === 'dir') {
      const nested = await listContentsRecursive({
        owner,
        repo,
        ref,
        dirPath: item.path,
      });
      files.push(...nested);
    }
  }
  return files;
}

async function getContentsItem({ owner, repo, ref, filePath }) {
  const apiUrl = new URL(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
  );
  apiUrl.searchParams.set('ref', ref);
  const data = await fetchJson(apiUrl.toString());
  if (!data || typeof data !== 'object') {
    throw new Error(`[docs] 无法获取文件信息: ${filePath}`);
  }
  if (data.type !== 'file') {
    throw new Error(`[docs] 目标不是文件: ${filePath}`);
  }
  return data;
}

function relativeToSourcePath(sourcePath, fullPath) {
  const normalizedSource = sourcePath.replaceAll('\\', '/').replace(/^\/+/, '');
  const normalizedFull = fullPath.replaceAll('\\', '/').replace(/^\/+/, '');
  if (normalizedFull === normalizedSource) return '';
  if (normalizedFull.startsWith(`${normalizedSource}/`)) {
    return normalizedFull.slice(normalizedSource.length + 1);
  }
  return normalizedFull;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const outDir = args.outDir;
  await ensureGitIgnoreHasDir(outDir);

  if (args.clean) {
    await rmrf(outDir);
  }
  await mkdirp(outDir);

  const importantSchemas = [
    'sing-box.config.full.jsonc',
    'sing-box.config.schema.json',
    'sing-box.config.template.schema.json',
  ];

  const files = args.onlySchemas
    ? await Promise.all(
        importantSchemas.map((filename) =>
          getContentsItem({
            owner: args.owner,
            repo: args.repo,
            ref: args.tag,
            filePath: `${args.sourcePath}/${filename}`,
          }),
        ),
      )
    : await listContentsRecursive({
        owner: args.owner,
        repo: args.repo,
        ref: args.tag,
        dirPath: args.sourcePath,
      });

  if (files.length === 0) {
    throw new Error(
      `[docs] 未找到任何文件：${args.owner}/${args.repo}@${args.tag} -> ${args.sourcePath}`,
    );
  }

  let downloaded = 0;
  for (const file of files) {
    const rel = relativeToSourcePath(args.sourcePath, file.path);
    const targetPath = path.join(outDir, rel);

    await mkdirp(path.dirname(targetPath));

    const downloadUrl = file.download_url;
    if (!downloadUrl) {
      throw new Error(`[docs] 缺少 download_url: ${JSON.stringify(file)}`);
    }
    const buf = await fetchBuffer(downloadUrl);
    await fs.writeFile(targetPath, buf);

    downloaded++;
    if (downloaded % 20 === 0 || downloaded === files.length) {
      console.log(`[docs] ${downloaded}/${files.length} 已写入`);
    }
  }

  const meta = {
    repo: `${args.owner}/${args.repo}`,
    tag: args.tag,
    sourcePath: args.sourcePath,
    outDir: args.outDir,
    fetchedAt: new Date().toISOString(),
    fileCount: files.length,
  };
  await fs.writeFile(
    path.join(outDir, '.source.json'),
    JSON.stringify(meta, null, 2),
    'utf8',
  );

  if (args.extractSchemasTo) {
    const extractDir = args.extractSchemasTo;
    await mkdirp(extractDir);

    for (const filename of importantSchemas) {
      const from = path.join(outDir, filename);
      const to = path.join(extractDir, filename);

      if (!(await fileExists(from))) {
        console.warn(
          `[docs] ⚠️ 未在 ${outDir}/ 找到 ${filename}，跳过提取（可能 upstream 目录结构不同）`,
        );
        continue;
      }

      const buf = await fs.readFile(from);
      await fs.writeFile(to, buf);
      console.log(`[docs] ✅ 已提取 ${filename} -> ${extractDir}/`);
    }

    const gitkeepPath = path.join(extractDir, '.gitkeep');
    if (await fileExists(gitkeepPath)) {
      await fs.rm(gitkeepPath, { force: true });
    }

    const extractMeta = {
      repo: `${args.owner}/${args.repo}`,
      tag: args.tag,
      sourcePath: args.sourcePath,
      extractedFiles: importantSchemas,
      extractedAt: new Date().toISOString(),
    };
    await fs.writeFile(
      path.join(extractDir, '.source.json'),
      JSON.stringify(extractMeta, null, 2),
      'utf8',
    );
  }

  console.log(
    `[docs] ✅ 已同步 ${args.owner}/${args.repo}@${args.tag} ${args.sourcePath} -> ${outDir}/`,
  );
}

await main();
