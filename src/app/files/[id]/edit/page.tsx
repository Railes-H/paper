import { notFound } from "next/navigation";
import { FileForm } from "@/components/file-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditFilePage({ params }: { params: { id: string } }) {
  const [file, papers, versions, submissions] = await Promise.all([
    prisma.fileRecord.findUnique({ where: { id: params.id } }),
    prisma.paper.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.paperVersion.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.submission.findMany({ include: { paper: true, venue: true }, orderBy: { updatedAt: "desc" } })
  ]);
  if (!file) notFound();
  return <><PageHeader title="编辑文件记录" backHref="/files" /><FileForm file={file} papers={papers} versions={versions} submissions={submissions} /></>;
}
