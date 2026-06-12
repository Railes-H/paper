# PaperTrack 论文投稿管家

PaperTrack 是一个个人使用的论文投稿管理系统，用来管理完整版论文、投稿对象、投稿记录、投稿格式文档、提醒和统计复盘。投稿记录按论文标题归档，记录每篇论文投过哪些论坛或期刊、对方要求什么格式、保存了哪份格式文档，以及当前投稿进度。

## 本地启动

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

打开 `http://localhost:3000` 即可使用。

## 数据库

项目使用 Prisma + SQLite。数据库文件默认位于 `/Users/railes/.papertrack/dev.db`，连接配置在 `.env`。

常用命令：

```bash
npm run db:generate
npm run db:init
npm run db:reset
```
