# pry-conf-manage

pnpm 管理的 monorepo：

- 服务端：NestJS + Prisma + SQLite（`apps/server`）
- 前端：React + React Router + Zustand + Vite（`apps/web`）

## 开发

安装依赖：

```bash
pnpm install
```

## Node 版本要求

- Prisma ORM v7 要求 Node.js **>= 20.19.0**（建议使用 22.12+ 或 24.x）
- 本项目不提供 `.nvmrc`，只要你的 Node 满足 Prisma 最小版本要求即可

准备服务端环境变量（SQLite 文件会生成在 `apps/server/prisma/dev.db`）：

```bash
cp apps/server/.env.example apps/server/.env
```

初始化数据库（生成 Prisma Client + 迁移）：

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

初始化数据库并播种默认用户（推荐一键）：

```bash
pnpm db:setup
```

启动（并行启动 server + web）：

```bash
pnpm dev
```

说明：`pnpm dev` 使用 `--stream` 输出，会在日志前加上包路径前缀，便于区分 `apps/server` 和 `apps/web` 的输出；当检测到 `better-sqlite3` ABI 不匹配时，也能更直观看到是服务端触发的自动重建。

## 目录结构

```text
apps/
  server/   NestJS API
  web/      React Web
packages/
  shared/   共享类型/工具（可选）
  sing-box-config/  sing-box schemas（前后端共享）
```

## Prisma Schema 组织

服务端 Prisma 使用 **schema 文件夹模式**，入口目录为 `apps/server/prisma/models/`，后续可以把不同 model 拆到多个 `.prisma` 文件里。

## better-sqlite3 自动重建

由于 `better-sqlite3` 属于原生模块（`.node`），当你切换 Node 版本后可能出现 ABI 不匹配。
服务端启动脚本已自动检测该情况：如果加载失败且疑似 ABI 不匹配，会自动执行 `npm rebuild better-sqlite3` 用“当前 Node 版本”重新构建。

## sing-box schemas 共享

`sing-box.config.full.jsonc` / `sing-box.config.schema.json` / `sing-box.config.template.schema.json` 这 3 个文件建议纳入 git 版本管理，供前后端共享使用。

- 存放位置：`packages/sing-box-config/schemas/`
- 同步命令：`pnpm schemas:sync:sing-box`
