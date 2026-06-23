import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SubmissionForm } from "@/components/submission-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewSubmissionPage() {
  const papers = await prisma.paper.findMany({ orderBy: { updatedAt: "desc" } });

  if (papers.length === 0) {
    return (
      <>
        <PageHeader title="新增投稿记录" backHref="/submissions" />
        <EmptyState
          title="还不能创建投稿记录"
          description="投稿记录必须关联一篇完整版论文。投稿对象可以在新增投稿记录时直接填写。"
          href="/papers/new"
          action="新增论文"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="新增投稿记录" description="直接填写投稿对象、格式和关键日期，系统会自动完成对象与格式版本的创建。" backHref="/submissions" />
      <SubmissionForm
        papers={papers.map((paper) => ({
          id: paper.id,
          title: paper.title
        }))}
      />
    </>
  );
}
