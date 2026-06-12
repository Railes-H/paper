import { FileForm } from "@/components/file-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewFilePage({ searchParams }: { searchParams?: { paperId?: string; submissionId?: string } }) {
  const [papers, versions, submissions] = await Promise.all([
    prisma.paper.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.paperVersion.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.submission.findMany({ include: { paper: true, venue: true }, orderBy: { updatedAt: "desc" } })
  ]);
  return <><PageHeader title="新增文件记录" description="上传文件到持久化对象存储，或保存外部文件链接，并关联到论文、投稿格式或投稿记录。" backHref="/files" /><FileForm papers={papers} versions={versions} submissions={submissions} defaultPaperId={searchParams?.paperId} defaultSubmissionId={searchParams?.submissionId} /></>;
}
