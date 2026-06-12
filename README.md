# PaperTrack 论文投稿管家

PaperTrack 是一个面向个人长期维护的论文投稿管理系统，用来管理完整版论文、投稿格式版本、格式模板、投稿对象、投稿记录、文件、提醒、日历事项、统计复盘和下一步投稿建议。

项目当前不包含登录系统，使用 Postgres 持久化业务数据，使用 Vercel Blob 持久化文件本体，适合个人 Vercel 项目部署使用。

## 主要功能

- 完整版论文管理：维护论文标题、作者、研究方向、摘要、关键词、字数、当前版本和状态。
- 新增论文上传识别：支持上传 `pdf`、`doc`、`docx`，文件保存到持久化对象存储，并自动识别标题、摘要、关键词和估算字数。
- 研究方向标签：新增论文时支持选择已有方向，也支持输入自定义方向并复用。
- 论文版本：支持常用版本和自定义版本名称。
- 投稿对象评价：记录会议、论坛、期刊的学术价值、费用压力、投稿难度、是否值得再次投稿等信息。
- 投稿记录与拒稿复盘：记录投稿进度、结果、拒稿原因、审稿意见、自我复盘和修改计划。
- 下一步投稿建议：基于规则生成中文建议，并支持按类型、优先级、完成状态筛选。
- 文件管理：管理论文母版、投稿版、回执、录用通知、拒稿邮件、审稿意见等文件，支持查看、下载、替换、删除和历史版本保留。
- 日历视图：展示截稿、会议、录用通知、返修、审稿提醒、费用和格式检查等时间节点。
- 数据导出：支持导出论文、版本、模板、投稿对象、投稿记录、费用统计、拒稿统计、文件记录和建议为 CSV。
- 统计复盘：首页和统计页展示投稿命中率、拒稿原因、高优先级建议、文件数量、费用压力等信息。

## 技术栈

- Next.js 13 App Router
- React 18
- TypeScript
- Prisma
- Postgres
- Tailwind CSS
- mammoth / pdf-parse 用于基础文档解析
- Vercel Blob 用于线上持久化文件存储

## 本地运行

推荐使用 Node.js 20 或更高版本，并先准备一个 Postgres 数据库连接串。

```bash
npm install
cp .env.example .env.local
# 修改 .env.local 里的 DATABASE_URL
npm run db:deploy
npm run db:seed
npm run dev
```

启动后打开：

```text
http://localhost:3000
```

## 常用命令

```bash
npm run dev          # 启动本地开发服务
npm run build        # 生产构建检查
npm run vercel-build # Vercel 构建：先执行数据库迁移，再构建 Next.js
npm run start        # 启动生产服务
npm run db:generate  # 生成 Prisma Client
npm run db:init      # 执行 Prisma migration
npm run db:deploy    # 执行 Prisma migration
npm run db:push      # 将 schema 直接推送到数据库，适合本地快速调试
npm run db:seed      # 写入示例数据
npm run db:reset     # 重置数据库并写入示例数据
```

## 数据库说明

项目使用 Prisma + Postgres。业务数据、论文记录、文件记录、投稿记录和版本关系都会保存在 `DATABASE_URL` 指向的持久化数据库里。

数据库结构定义在：

```text
prisma/schema.prisma
```

Prisma migration 在：

```text
prisma/migrations
```

`prisma/init.sql` 是早期 SQLite 版本遗留的初始化文件，当前线上部署不再使用。

本地或线上都需要设置：

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
npm run db:deploy
npm run dev
```

## 上传识别说明

新增完整版论文页面支持上传：

- `.pdf`
- `.doc`
- `.docx`

系统会尝试识别：

- 论文标题
- 摘要
- 关键词
- 正文字数
- 文件名
- 文件类型
- 文件链接或本地路径

识别后不会直接保存论文，而是进入“识别结果确认”状态。用户可以继续修改标题、摘要、关键词、字数、研究方向、当前版本、作者和备注，再点击保存。

文件管理页也支持直接上传文件。上传后会记录：

- 文件名
- 文件类型
- 文件大小
- MIME 类型
- 存储服务
- 存储路径
- 查看 URL
- 下载 URL
- 版本号
- 上传时间
- 关联论文、投稿格式版本或投稿记录

编辑已有文件记录时，如果选择新文件，会创建新的文件版本，并将旧文件保留为历史版本，不会直接覆盖。

## Vercel 部署说明

项目已加入 Vercel 部署所需的 Prisma 处理：

```json
"postinstall": "prisma generate"
"vercel-build": "prisma migrate deploy && next build"
```

`vercel.json` 会让 Vercel 执行 `npm run vercel-build`，部署时先把 migration 应用到 Postgres，再构建页面。

注意：

- 线上环境必须配置 Postgres `DATABASE_URL`，项目不会再回退到 Vercel `/tmp` 临时数据库。
- 线上文件本体使用 Vercel Blob 持久化保存，数据库只保存文件信息、Blob 路径、查看 URL 和下载 URL。
- Vercel Blob 使用新版 OIDC 默认认证，代码使用 SDK 默认认证方式，不会在 SDK 方法里手动传 token。
- 上传接口使用 `put(file.name, file, { access: "private", addRandomSuffix: true })`。
- 新增论文页上传文件后会立即创建一条未关联的文件记录；即使刷新新增论文页面，也可以在 `/files` 找回该文件。保存论文时，系统会把这条文件记录绑定到新论文。
- 本地开发如果没有拉取 Vercel 环境变量，会回退到 `public/uploads`，仅用于本地调试。

推荐在 Vercel Marketplace 绑定 Prisma Postgres、Neon 或 Supabase Postgres，然后确认项目环境变量包含：

```text
DATABASE_URL=你的 Postgres 连接串
BLOB_STORE_ID=你的 Blob Store ID
BLOB_WEBHOOK_PUBLIC_KEY=Blob Webhook 公钥
```

Vercel 后台操作顺序：

1. 进入项目的 Storage / Marketplace。
2. 新建并绑定 Prisma Postgres、Neon 或 Supabase Postgres。
3. 确认项目 Environment Variables 里有 `DATABASE_URL`。如果平台只提供了其他名称的 Postgres 连接串，需要手动新增一条 `DATABASE_URL` 指向同一个连接串。
4. 确认 Blob Store 已绑定，且存在 `BLOB_STORE_ID` 和 `BLOB_WEBHOOK_PUBLIC_KEY`。
5. 重新部署项目。部署时会执行 `prisma migrate deploy` 自动建表。

本地开发请运行：

```bash
vercel link
vercel env pull .env.local
```

## 页面入口

- `/dashboard`：首页仪表盘
- `/papers`：完整版论文库
- `/papers/new`：新增完整版论文
- `/venues`：投稿对象
- `/submissions`：投稿记录
- `/suggestions`：下一步建议
- `/files`：文件管理
- `/calendar`：日历视图
- `/export`：数据导出
- `/timeline`：时间线提醒
- `/stats`：统计复盘

## 项目结构

```text
src/app              页面、路由和服务端 actions
src/components       通用界面组件和表单组件
src/lib              Prisma、字段选项、规则建议、文档识别等逻辑
prisma               数据模型、migration、种子数据
public               静态资源和本地上传文件目录
```

## 使用建议

1. 先在“完整版论文库”录入论文母版。
2. 在“投稿对象”维护会议、论坛、期刊，并补充评价信息。
3. 为论文建立投稿格式版本或投稿记录。
4. 投稿后持续更新投稿状态、结果和审稿信息。
5. 拒稿后填写拒稿复盘，系统会辅助生成下一步建议。
6. 使用“文件管理”整理投稿版、回执、录用通知、拒稿邮件等材料。
7. 定期查看“日历视图”“统计复盘”和“数据导出”。

## 当前定位

这是一个可本地运行、可个人部署的 PaperTrack v1.x 版本，优先保证功能完整、数据结构清晰和线上数据持久化。后续可以继续扩展登录、权限管理和更稳定的 AI 建议能力。
