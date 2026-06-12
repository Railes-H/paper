import { PageHeader } from "@/components/page-header";
import { PaperForm } from "@/components/paper-form";
import { collectResearchAreaOptions, collectVersionOptions } from "@/lib/paper-fields";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewPaperPage() {
  const papers = await prisma.paper.findMany({ select: { researchArea: true, currentVersion: true } });
  return (
    <>
      <PageHeader title="新增完整版论文" description="这里保存最完整、最适合继续修改的论文母版。" backHref="/papers" />
      <PaperForm researchAreaOptions={collectResearchAreaOptions(papers)} versionOptions={collectVersionOptions(papers)} />
    </>
  );
}
