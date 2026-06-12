import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SubmissionForm } from "@/components/submission-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewSubmissionPage() {
  const [papers, venues] = await Promise.all([
    prisma.paper.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.venue.findMany({ orderBy: { updatedAt: "desc" } })
  ]);

  if (papers.length === 0 || venues.length === 0) {
    return (
      <>
        <PageHeader title="新增投稿记录" backHref="/submissions" />
        <EmptyState
          title="还不能创建投稿记录"
          description="投稿记录必须关联母版论文和投稿对象。请先添加至少一篇论文和一个投稿对象。"
          href={papers.length === 0 ? "/papers/new" : "/venues/new"}
          action={papers.length === 0 ? "新增论文" : "新增投稿对象"}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="新增投稿记录" description="记录论文投向哪个论坛或期刊、对方要求什么格式，以及保存对应格式文档。" backHref="/submissions" />
      <SubmissionForm
        papers={papers.map((paper) => ({
          id: paper.id,
          title: paper.title
        }))}
        venues={venues.map((venue) => ({ id: venue.id, name: venue.name, type: venue.type }))}
      />
    </>
  );
}
