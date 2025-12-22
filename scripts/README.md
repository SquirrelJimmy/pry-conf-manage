# scripts

该目录用于存放 **workspace 级别** 的自定义脚本（跨包复用 / 一键编排）。

## fetch-sing-box-docs

不依赖 git，从 GitHub API 拉取 `SagerNet/sing-box` 的 `docs/configuration` 文档到本地目录。

默认输出目录为 `.cache/singbox-config-docs/`（该目录已在 `.gitignore` 忽略，不参与版本管理）。

```bash
pnpm docs:sing-box
```

## sing-box schemas（前后端共享）

以下 3 个文件通常是前后端共享的关键资产，建议 **纳入 git 版本管理**（固定版本、可审计、CI 可复现）：

- `sing-box.config.full.jsonc`
- `sing-box.config.schema.json`
- `sing-box.config.template.schema.json`

本仓库把它们落在 workspace 包 `@pry/sing-box-config` 的 `schemas/` 下：

- `packages/sing-box-config/schemas/`

同步命令（会从上游下载 docs，并将上述 3 个文件提取到 `packages/sing-box-config/schemas/`；docs 输出目录仍保持忽略）：

```bash
pnpm schemas:sync:sing-box
```

说明：该命令默认只拉取这 3 个文件（更快），不递归下载全部 docs。

自定义 tag / 输出目录：

```bash
node scripts/fetch-sing-box-docs.mjs --tag v1.12.13 --out .cache/singbox-config-docs
```

可选：设置 `GITHUB_TOKEN` 提高 API 额度，避免匿名限流。
