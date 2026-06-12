import { FileForm } from "@/components/file-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";

export default async function NewFilePage() {
  const [papers, versions, submissions] = await Promise.all([
    prisma.paper.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.paperVersion.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.submission.findMany({ include: { paper: true, venue: true }, orderBy: { updatedAt: "desc" } })
  ]);
  return <><PageHeader title="新增文件记录" description="第一版保存文件链接或本地路径，不做真实上传。" backHref="/files" /><FileForm papers={papers} versions={versions} submissions={submissions} /></>;
}
