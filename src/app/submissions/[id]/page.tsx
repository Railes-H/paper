import Link from "next/link";
import { notFound } from "next/navigation";
import { updateRejectionReview } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  enumOptions,
  fileTypeLabels,
  majorRevisionLabels,
  rejectReasonCategoryLabels,
  rejectionSeverityLabels,
  reuseAfterRejectLabels,
  nextSubmissionStrategyLabels,
  submissionResultLabels,
  submissionStatusLabels
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { buildSuggestions } from "@/lib/suggestions";
import { formatDate, formatFileSize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: {
      paper: { include: { versions: true } },
      paperVersion: true,
      venue: { include: { evaluation: true, conferenceInfo: true, journalInfo: true } },
      files: true,
      submittedFileRecord: true
    }
  });
  if (!submission) notFound();

  const persistedSuggestions = await prisma.suggestion.findMany({ where: { relatedSubmissionId: submission.id } });
  const generated = buildSuggestions({
    papers: [submission.paper],
    submissions: [submission],
    venues: [submission.venue],
    templates: [],
    persistedSuggestions
  }).filter((item) => item.relatedSubmissionId === submission.id);

  const isRejected = submission.result === "REJECTED" || submission.status === "REJECTED";

  return (
    <>
      <PageHeader title="投稿记录详情" description="查看本次投稿的目标对象、格式要求、格式文档、结果、复盘和下一步建议。" backHref="/submissions" />
      <section className="panel mb-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">投稿概况</h2>
        <div className="grid gap-4 text-sm md:grid-cols-4">
          <Info label="论文" value={submission.paper.title} />
          <Info label="投稿格式" value={submission.paperVersion.versionName} />
          <Info label="投稿对象" value={submission.venue.name} />
          <Info label="投稿日期" value={formatDate(submission.submissionDate)} />
          <div><div className="label">状态</div><StatusBadge tone="blue">{submissionStatusLabels[submission.status]}</StatusBadge></div>
          <div><div className="label">结果</div><StatusBadge tone={submission.result === "ACCEPTED" ? "green" : submission.result === "REJECTED" ? "red" : "slate"}>{submissionResultLabels[submission.result]}</StatusBadge></div>
          <Info label="结果日期" value={formatDate(submission.resultDate)} />
          <Info label="下一步计划" value={submission.nextAction ?? "-"} />
          <Info label="格式文档" value={submission.paperVersion.fileUrl ?? "-"} />
          <Info label="提交文件" value={submission.submittedFileRecord?.fileName ?? submission.submittedFileUrl ?? "-"} />
        </div>
        {submission.paperVersion.formatRequirementText ? <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm leading-7 text-slate-600">{submission.paperVersion.formatRequirementText}</p> : null}
      </section>

      <section className={`panel mb-6 p-5 ${isRejected ? "border-red-200 bg-red-50/30" : ""}`}>
        <h2 className="mb-4 text-base font-semibold text-ink">拒稿复盘</h2>
        {!isRejected ? <p className="mb-4 text-sm text-slate-500">当前投稿结果不是拒稿，复盘区保留但不重点提示。</p> : null}
        <form action={updateRejectionReview.bind(null, submission.id)} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Select name="rejectReasonCategory" label="拒稿原因分类" options={rejectReasonCategoryLabels} value={submission.rejectReasonCategory} />
            <Select name="nextSubmissionStrategy" label="下一步投稿策略" options={nextSubmissionStrategyLabels} value={submission.nextSubmissionStrategy} />
            <Select name="rejectionSeverity" label="拒稿严重程度" options={rejectionSeverityLabels} value={submission.rejectionSeverity} />
            <Select name="canReuseVersion" label="当前投稿格式还能复用" options={reuseAfterRejectLabels} value={submission.canReuseVersion} />
            <Select name="needsMajorRevision" label="是否需要大修" options={majorRevisionLabels} value={submission.needsMajorRevision} />
            <label><span className="label">拒稿后准备改投目标</span><input name="targetAfterRejection" defaultValue={submission.targetAfterRejection ?? ""} className="field" /></label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Textarea name="rejectReasonDetail" label="拒稿原因详情" value={submission.rejectReasonDetail} />
            <Textarea name="reviewerComments" label="审稿意见或编辑意见" value={submission.reviewerComments} />
            <Textarea name="selfReflection" label="自我复盘" value={submission.selfReflection} />
            <Textarea name="improvementPlan" label="修改计划" value={submission.improvementPlan} />
          </div>
          <div className="flex justify-end"><button className="btn-primary">保存拒稿复盘</button></div>
        </form>
      </section>

      <section className="panel mb-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">相关下一步建议</h2>
        <div className="grid gap-3">
          {generated.length ? generated.map((item) => (
            <div key={item.id} className="rounded-lg border border-line bg-white p-3">
              <div className="flex items-center gap-2"><StatusBadge tone={item.priority === "HIGH" ? "orange" : "slate"}>{item.priority === "HIGH" ? "高" : item.priority === "MEDIUM" ? "中" : "低"}</StatusBadge><span className="font-medium text-ink">{item.suggestionTitle}</span></div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.suggestionContent}</p>
            </div>
          )) : <p className="text-sm text-slate-500">暂无规则建议。</p>}
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">相关文件</h2>
          <Link className="btn-secondary" href={`/files/new?submissionId=${submission.id}`}>新增文件</Link>
        </div>
        {submission.submittedFileRecord ? (
          <div className="mb-3 rounded-lg border-2 border-green-200 bg-green-50 p-3">
            <div className="text-sm font-black text-green-800">本次投稿绑定文件</div>
            <div className="mt-1 text-sm text-slate-700">{submission.submittedFileRecord.fileName} · V{submission.submittedFileRecord.versionNumber} · {formatFileSize(submission.submittedFileRecord.fileSize)}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="btn-secondary h-8" href={submission.submittedFileRecord.fileUrl} target="_blank" rel="noreferrer">查看</a>
              <a className="btn-secondary h-8" href={submission.submittedFileRecord.downloadUrl ?? submission.submittedFileRecord.fileUrl}>下载</a>
            </div>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          {submission.files.length ? submission.files.map((file) => (
            <div key={file.id} className="rounded-lg border border-line bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-ink">{file.fileName}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">
                    {fileTypeLabels[file.fileType] ?? file.fileType} · V{file.versionNumber}{file.versionLabel ? ` · ${file.versionLabel}` : ""} · {formatFileSize(file.fileSize)} · {formatDate(file.uploadDate ?? file.createdAt)}
                  </div>
                </div>
                <StatusBadge tone={file.isCurrent ? "green" : "slate"}>{file.isCurrent ? "当前" : "历史"}</StatusBadge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="btn-secondary h-8" href={file.fileUrl} target="_blank" rel="noreferrer">查看</a>
                <a className="btn-secondary h-8" href={file.downloadUrl ?? file.fileUrl}>下载</a>
                <Link className="btn-secondary h-8" href={`/files/${file.id}/edit`}>替换</Link>
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">暂无关联文件。</p>}
        </div>
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="label">{label}</div><div className="text-slate-700">{value}</div></div>;
}

function Select({ name, label, options, value }: { name: string; label: string; options: Record<string, string>; value?: string | null }) {
  return <label><span className="label">{label}</span><select name={name} defaultValue={value ?? "UNKNOWN"} className="field"><option value="">未填写</option>{enumOptions(options).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>;
}

function Textarea({ name, label, value }: { name: string; label: string; value?: string | null }) {
  return <label><span className="label">{label}</span><textarea name={name} rows={4} defaultValue={value ?? ""} className="field" /></label>;
}
