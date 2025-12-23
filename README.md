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

说明：登录接口会使用 `apps/server/.env` 中的 `JWT_SECRET` 签发 `accessToken`（开发环境可直接用示例值，生产环境请替换为强随机密钥）。

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

说明：`pnpm dev` 使用 `--stream` 输出，会在日志前加上包路径前缀，便于区分 `apps/server` 和 `apps/web` 的输出。

## 目录结构

```text
apps/
  server/   NestJS API
  web/      React Web
packages/
  shared/   共享类型/工具（可选）
  sing-box-config/  sing-box schemas（前后端共享）
```

## 前端代码组织（apps/web）

前端遵循“页面是页面、组件是组件”的目录规范，不额外加一层 `ui/` 目录（拒绝 `src/ui`）。

核心约定：

- 页面模块放在 `apps/web/src/pages/` 下，并且“一个页面一个目录”
  - 页面入口文件统一命名为 `page.tsx`
  - 示例：`apps/web/src/pages/login/page.tsx`
- 页面内的局部组件放在对应页面目录下的 `components/` 中，并且“一组件一个目录”
  - 形如：`apps/web/src/pages/<页面名>/components/<组件名>/xxx.tsx`
  - 示例：`apps/web/src/pages/login/components/LoginForm/index.tsx`（示例路径）
- 全局复用组件放在 `apps/web/src/components/` 下，并且“一组件一个目录”
  - 形如：`apps/web/src/components/<组件名>/xxx.tsx`
  - 示例：`apps/web/src/components/AppLogo/index.tsx`（示例路径）
- 全局 Hooks 放在 `apps/web/src/hooks/` 下，并且“一个 hook 一个目录”
  - 命名统一为 `use<名字>`
  - 入口文件统一命名为 `index.ts`
  - 形如：`apps/web/src/hooks/use<名字>/index.ts`
  - 该 hook 的辅助方法、类型、常量等放在同目录下（例如 `utils.ts` / `types.ts`）
- 布局统一放在 `apps/web/src/layouts/`（如后台框架布局）
- 页面局部 Hooks 的组织方式与全局一致，但放在页面目录内
  - 形如：`apps/web/src/pages/<页面名>/hooks/use<名字>/index.ts`

推荐的目录一览：

```text
apps/web/src/
  api/          请求 hooks（SWR / mutation）
  auth/         路由鉴权相关（RequireAuth 等）
  components/   全局组件（components/<组件名>/...）
  hooks/        全局 hooks（hooks/use<名字>/...）
  layouts/      布局（AdminLayout 等）
  lib/          基础工具（requestJson、swrFetcher 等）
  pages/        页面模块（pages/<页面名>/page.tsx）
  stores/       Zustand 状态
  router.tsx    路由表
  main.tsx      入口（含 antd / SWRConfig）
```

## Prisma Schema 组织

服务端 Prisma 使用 **schema 文件夹模式**，入口目录为 `apps/server/prisma/models/`，后续可以把不同 model 拆到多个 `.prisma` 文件里。

## better-sqlite3 自动重建

由于 `better-sqlite3` 属于原生模块（`.node`），当你切换 Node 版本后可能出现 ABI 不匹配。
本项目不把“自动重建”强绑在 `dev` 启动命令里（避免引入额外的不确定性）。当你遇到 ABI 不匹配报错时，请在当前 Node 版本下手动重建：

```bash
pnpm -C apps/server rebuild better-sqlite3
```

若你的环境里 `pnpm rebuild` 不生效，也可以：

```bash
pnpm -C apps/server exec npm rebuild better-sqlite3
```

## sing-box schemas 共享

`sing-box.config.full.jsonc` / `sing-box.config.schema.json` / `sing-box.config.template.schema.json` 这 3 个文件建议纳入 git 版本管理，供前后端共享使用。

- 存放位置：`packages/sing-box-config/schemas/`
- 同步命令：`pnpm schemas:sync:sing-box`
