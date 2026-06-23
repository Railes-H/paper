import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SubmissionEditForm } from "@/components/submission-edit-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditSubmissionPage({ params }: { params: { id: string } }) {
  const [submission, papers] = await Promise.all([
    prisma.submission.findUnique({
      where: { id: params.id },
      include: { venue: true, paperVersion: true }
    }),
    prisma.paper.findMany({ orderBy: { updatedAt: "desc" } })
  ]);
  if (!submission) notFound();

  return (
    <>
      <PageHeader title="编辑投稿记录" description="修改投稿对象、关键日期、状态、审稿信息和管理备注。" backHref={`/submissions/${submission.id}`} />
      <SubmissionEditForm submission={submission} papers={papers} />
    </>
  );
}
