import Link from "next/link";
import type { Paper, PaperVersion, Submission, Venue } from "@prisma/client";
import { deleteSubmission } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { rejectReasonCategoryLabels, reviewStageLabels, submissionResultLabels, submissionStatusLabels, venueTypeLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function SubmissionsPage({ searchParams }: { searchParams?: { q?: string; status?: string; type?: string; result?: string; year?: string; format?: string; rejectionReview?: string } }) {
  const year = searchParams?.year ? Number(searchParams.year) : null;
  const submissions = await prisma.submission.findMany({
    where: {
      status: searchParams?.status ? (searchParams.status as any) : undefined,
      submissionType: searchParams?.type ? (searchParams.type as any) : undefined,
      result: searchParams?.result ? (searchParams.result as any) : undefined,
      formatChecked: searchParams?.format ? searchParams.format === "true" : undefined,
      rejectReasonCategory: searchParams?.rejectionReview === "missing" ? null : undefined,
      submissionDate: year ? { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } : undefined,
      AND: searchParams?.rejectionReview === "missing" ? [{ OR: [{ result: "REJECTED" }, { status: "REJECTED" }] }] : undefined,
      OR: searchParams?.q
        ? [
            { paper: { title: { contains: searchParams.q } } },
            { venue: { name: { contains: searchParams.q } } }
          ]
        : undefined
    },
    include: { paper: true, paperVersion: true, venue: true },
    orderBy: [{ paper: { title: "asc" } }, { submissionDate: "desc" }, { updatedAt: "desc" }]
  });
  const groupedSubmissions = Array.from(
    submissions.reduce((groups, submission) => {
      const existing = groups.get(submission.paper.title) ?? [];
      existing.push(submission);
      groups.set(submission.paper.title, existing);
      return groups;
    }, new Map<string, SubmissionRow[]>())
  );

  return (
    <>
      <PageHeader title="投稿记录" description="按论文标题归档投稿历史，记录投向的论坛或期刊、目标格式要求、格式文档和当前进度。" actionHref="/submissions/new" actionLabel="新增投稿记录" backHref="/dashboard" />
      <form className="panel mb-5 grid gap-3 p-4 md:grid-cols-[1fr_145px_145px_145px_120px_145px_170px_auto]">
        <input name="q" placeholder="搜索论文标题或投稿对象" className="field" defaultValue={searchParams?.q ?? ""} />
        <select name="status" className="field" defaultValue={searchParams?.status ?? ""}>
          <option value="">全部状态</option>
          {Object.entries(submissionStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select name="type" className="field" defaultValue={searchParams?.type ?? ""}>
          <option value="">全部类型</option>
          {Object.entries(venueTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select name="result" className="field" defaultValue={searchParams?.result ?? ""}>
          <option value="">全部结果</option>
          {Object.entries(submissionResultLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input name="year" placeholder="年份" className="field" defaultValue={searchParams?.year ?? ""} />
        <select name="format" className="field" defaultValue={searchParams?.format ?? ""}>
          <option value="">格式检查不限</option>
          <option value="true">已检查</option>
          <option value="false">未检查</option>
        </select>
        <select name="rejectionReview" className="field" defaultValue={searchParams?.rejectionReview ?? ""}>
          <option value="">拒稿复盘不限</option>
          <option value="missing">已拒稿但未复盘</option>
        </select>
        <button className="btn-secondary">筛选</button>
      </form>
      {submissions.length === 0 ? (
        <EmptyState title="还没有投稿记录" description="新增投稿记录前，需要先有论文和投稿对象。" href="/submissions/new" action="新增投稿记录" />
      ) : (
        <div className="grid gap-6">
          {groupedSubmissions.map(([paperTitle, paperSubmissions]) => (
            <SubmissionSection key={paperTitle} title={paperTitle} submissions={paperSubmissions} />
          ))}
        </div>
      )}
    </>
  );
}

type SubmissionRow = Submission & { paper: Paper; paperVersion: PaperVersion; venue: Venue };

function SubmissionSection({
  title,
  submissions
}: {
  title: string;
  submissions: SubmissionRow[];
}) {
  return (
    <section className="panel overflow-x-auto overflow-y-hidden">
      <div className="border-b border-line p-5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">共 {submissions.length} 条投稿记录，按投稿时间从近到远排列。</p>
      </div>
      <table className="w-full min-w-[1320px]">
        <thead>
          <tr>
            <th className="table-th">投稿对象</th>
            <th className="table-th">类型</th>
            <th className="table-th">投稿日期</th>
            <th className="table-th">状态</th>
            <th className="table-th">结果</th>
            <th className="table-th">要求格式</th>
            <th className="table-th">格式文档</th>
            <th className="table-th">实际提交文件</th>
            <th className="table-th">格式检查</th>
            <th className="table-th">材料 / 备注</th>
            <th className="table-th">审稿 / 复盘</th>
            <th className="table-th">下一步</th>
            <th className="table-th">操作</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td className="table-td font-medium text-ink">
                <Link href={`/submissions/${submission.id}`} className="text-blue-700 hover:underline">{submission.venue.name}</Link>
              </td>
              <td className="table-td">{venueTypeLabels[submission.submissionType]}</td>
              <td className="table-td">{formatDate(submission.submissionDate)}</td>
              <td className="table-td"><StatusBadge tone={submission.status === "ACCEPTED" ? "green" : submission.status === "REJECTED" ? "red" : "blue"}>{submissionStatusLabels[submission.status]}</StatusBadge></td>
              <td className="table-td">{submissionResultLabels[submission.result]}</td>
              <td className="table-td max-w-[260px]">
                <div className="font-medium text-ink">{submission.paperVersion.versionName}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{submission.paperVersion.formatRequirementText ?? "未记录具体格式要求"}</div>
              </td>
              <td className="table-td">{submission.paperVersion.fileUrl ? <a className="text-blue-700 hover:underline" href={submission.paperVersion.fileUrl}>打开文档</a> : "-"}</td>
              <td className="table-td">{submission.submittedFileUrl ? <a className="text-blue-700 hover:underline" href={submission.submittedFileUrl}>打开文件</a> : "-"}</td>
              <td className="table-td">{submission.formatChecked ? <StatusBadge tone="green">已检查</StatusBadge> : <StatusBadge tone="yellow">待检查</StatusBadge>}</td>
              <td className="table-td max-w-[220px]">
                <div className="line-clamp-2 text-sm text-slate-600">{submission.submissionMaterials ?? submission.paperVersion.fileNamingRule ?? "-"}</div>
              </td>
              <td className="table-td">
                {submission.submissionType === "JOURNAL" ? (
                  reviewStageLabels[submission.reviewStage]
                ) : submission.result === "REJECTED" || submission.status === "REJECTED" ? (
                  submission.rejectReasonCategory ? rejectReasonCategoryLabels[submission.rejectReasonCategory] : "未复盘"
                ) : (
                  "-"
                )}
              </td>
              <td className="table-td">{submission.nextAction ?? "-"}</td>
              <td className="table-td">
                <form action={deleteSubmission.bind(null, submission.id)}>
                  <button className="btn-danger h-8">删除</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
