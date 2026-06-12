import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PaperForm } from "@/components/paper-form";
import { collectResearchAreaOptions, collectVersionOptions } from "@/lib/paper-fields";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditPaperPage({ params }: { params: { id: string } }) {
  const [paper, papers] = await Promise.all([
    prisma.paper.findUnique({ where: { id: params.id } }),
    prisma.paper.findMany({ select: { researchArea: true, currentVersion: true } })
  ]);
  if (!paper) notFound();

  return (
    <>
      <PageHeader title="编辑完整版论文" description="更新母版论文信息、状态、文件链接和备注。" backHref={`/papers/${paper.id}`} />
      <PaperForm paper={paper} researchAreaOptions={collectResearchAreaOptions(papers)} versionOptions={collectVersionOptions(papers)} />
    </>
  );
}
