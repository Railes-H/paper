import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSubmission } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { paperStatusLabels, submissionResultLabels, submissionStatusLabels, venueTypeLabels } from "@/lib/labels";
import { displayResearchAreas } from "@/lib/paper-fields";
import { prisma } from "@/lib/prisma";
import { buildSuggestions } from "@/lib/suggestions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const paper = await prisma.paper.findUnique({
    where: { id: params.id },
    include: {
      versions: {
        include: {
          targetVenue: true,
          files: true,
          submissions: { include: { venue: true }, take: 1, orderBy: { updatedAt: "desc" } }
        },
        orderBy: { updatedAt: "desc" }
      },
      submissions: {
        include: { venue: { include: { evaluation: true, conferenceInfo: true, journalInfo: true } }, paperVersion: true },
        orderBy: { updatedAt: "desc" }
      },
      files: true
    }
  });

  if (!paper) notFound();
  const [persistedSuggestions] = await Promise.all([
    prisma.suggestion.findMany({ where: { relatedPaperId: paper.id } })
  ]);
  const suggestions = buildSuggestions({
    papers: [paper],
    submissions: paper.submissions,
    venues: paper.submissions.map((item) => item.venue),
    templates: [],
    persistedSuggestions
  }).filter((item) => item.relatedPaperId === paper.id);

  return (
    <>
      <PageHeader title={paper.title} description="论文详情和所有投稿记录集中查看，包括投向对象、格式要求和格式文档。" actionHref="/submissions/new" actionLabel="新增投稿记录" backHref="/papers" />

      <section className="panel mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">完整版论文信息</h2>
          <Link href={`/papers/${paper.id}/edit`} className="btn-secondary">
            编辑论文
          </Link>
        </div>
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <Info label="研究方向" value={displayResearchAreas(paper.researchArea)} />
          <Info label="作者信息" value={paper.authors} />
          <Info label="当前版本" value={paper.currentVersion ?? "-"} />
          <Info label="完整版字数" value={paper.masterWordCount?.toString() ?? "-"} />
          <Info label="最新修改" value={formatDate(paper.latestUpdateDate ?? paper.updatedAt)} />
          <div>
            <div className="label">当前状态</div>
            <StatusBadge tone="blue">{paperStatusLabels[paper.currentStatus]}</StatusBadge>
          </div>
          <Info label="关键词" value={paper.masterKeywords ?? "-"} />
          <Info label="文件链接" value={paper.masterFileUrl ?? "-"} link={paper.masterFileUrl} />
          <Info label="备注" value={paper.notes ?? "-"} />
        </div>
        {paper.masterAbstract ? <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm leading-7 text-slate-600">{paper.masterAbstract}</p> : null}
      </section>

      <section className="panel mb-6 overflow-x-auto overflow-y-hidden">
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="text-base font-semibold text-ink">该论文的投稿记录</h2>
          <Link href="/submissions/new" className="btn-secondary">
            新增投稿记录
          </Link>
        </div>
        <table className="w-full min-w-[1180px]">
          <thead>
            <tr>
              <th className="table-th">投稿对象</th>
              <th className="table-th">类型</th>
              <th className="table-th">投稿日期</th>
              <th className="table-th">状态</th>
              <th className="table-th">结果</th>
              <th className="table-th">要求格式</th>
              <th className="table-th">格式文档</th>
              <th className="table-th">提交文件</th>
              <th className="table-th">结果日期</th>
              <th className="table-th">下一步</th>
              <th className="table-th">操作</th>
            </tr>
          </thead>
          <tbody>
            {paper.submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="table-td font-medium text-ink">{submission.venue.name}</td>
                <td className="table-td">{venueTypeLabels[submission.submissionType]}</td>
                <td className="table-td">{formatDate(submission.submissionDate)}</td>
                <td className="table-td">
                  <StatusBadge tone="blue">{submissionStatusLabels[submission.status]}</StatusBadge>
                </td>
                <td className="table-td">{submissionResultLabels[submission.result]}</td>
                <td className="table-td max-w-[260px]">
                  <div className="font-medium text-ink">{submission.paperVersion.versionName}</div>
                  <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{submission.paperVersion.formatRequirementText ?? "未记录具体格式要求"}</div>
                </td>
                <td className="table-td">{submission.paperVersion.fileUrl ? <a className="text-blue-700 hover:underline" href={submission.paperVersion.fileUrl}>打开文档</a> : "-"}</td>
                <td className="table-td">{submission.submittedFileUrl ? <a className="text-blue-700 hover:underline" href={submission.submittedFileUrl}>打开文件</a> : "-"}</td>
                <td className="table-td">{formatDate(submission.resultDate)}</td>
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

      <section className="panel mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">下一步建议</h2>
          <Link href="/suggestions" className="text-sm font-medium text-blue-700">查看全部建议</Link>
        </div>
        <div className="grid gap-3">
          {suggestions.length ? suggestions.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-lg border border-line bg-white p-3">
              <div className="text-sm font-semibold text-ink">{item.suggestionTitle}</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.suggestionContent}</p>
            </div>
          )) : <p className="text-sm text-slate-500">暂无规则建议。</p>}
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">相关文件</h2>
          <Link href="/files/new" className="btn-secondary">新增文件</Link>
        </div>
        <div className="grid gap-2">
          {paper.files.length ? paper.files.map((file) => (
            <a key={file.id} href={file.fileUrl} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-blue-700">{file.fileName} · {file.versionLabel ?? file.fileType}</a>
          )) : <p className="text-sm text-slate-500">暂无关联文件。</p>}
        </div>
      </section>
    </>
  );
}

function Info({ label, value, link }: { label: string; value: string; link?: string | null }) {
  return (
    <div>
      <div className="label">{label}</div>
      {link ? (
        <a href={link} target="_blank" className="text-sm text-blue-700 underline underline-offset-2">
          {value}
        </a>
      ) : (
        <div className="text-sm text-slate-700">{value}</div>
      )}
    </div>
  );
}
