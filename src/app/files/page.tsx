import Link from "next/link";
import { deleteFileRecord } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { fileTypeLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function FilesPage({ searchParams }: { searchParams?: { q?: string; type?: string; paperId?: string } }) {
  const [files, papers] = await Promise.all([
    prisma.fileRecord.findMany({
      where: {
        fileName: searchParams?.q ? { contains: searchParams.q } : undefined,
        fileType: searchParams?.type || undefined,
        relatedPaperId: searchParams?.paperId || undefined
      },
      include: { relatedPaper: true, relatedPaperVersion: true, relatedSubmission: { include: { venue: true, paper: true } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.paper.findMany({ orderBy: { updatedAt: "desc" } })
  ]);
  return (
    <>
      <PageHeader title="文件管理" description="按文件类型和关联对象管理论文母版、投稿版、回执、通知、审稿意见等文件链接。" actionHref="/files/new" actionLabel="新增文件" backHref="/dashboard" />
      <form className="panel mb-5 grid gap-3 p-4 md:grid-cols-[1fr_180px_260px_auto]">
        <input name="q" placeholder="搜索文件名" className="field" defaultValue={searchParams?.q ?? ""} />
        <select name="type" className="field" defaultValue={searchParams?.type ?? ""}><option value="">全部类型</option>{Object.entries(fileTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select name="paperId" className="field" defaultValue={searchParams?.paperId ?? ""}><option value="">全部论文</option>{papers.map((paper) => <option key={paper.id} value={paper.id}>{paper.title}</option>)}</select>
        <button className="btn-secondary">筛选</button>
      </form>
      {files.length === 0 ? <EmptyState title="还没有文件记录" description="先新增文件链接或本地路径，并关联到论文、投稿格式或投稿记录。" href="/files/new" action="新增文件" /> : (
        <div className="panel overflow-hidden">
          <table className="w-full min-w-[1080px]">
            <thead><tr><th className="table-th">文件名</th><th className="table-th">类型</th><th className="table-th">版本说明</th><th className="table-th">关联论文</th><th className="table-th">关联投稿格式</th><th className="table-th">关联投稿</th><th className="table-th">日期</th><th className="table-th">操作</th></tr></thead>
            <tbody>{files.map((file) => (
              <tr key={file.id}>
                <td className="table-td font-medium text-ink"><a href={file.fileUrl} className="text-blue-700 hover:underline">{file.fileName}</a></td>
                <td className="table-td"><StatusBadge tone="purple">{fileTypeLabels[file.fileType] ?? file.fileType}</StatusBadge></td>
                <td className="table-td">{file.versionLabel ?? "-"}</td>
                <td className="table-td">{file.relatedPaper?.title ?? "-"}</td>
                <td className="table-td">{file.relatedPaperVersion?.versionName ?? "-"}</td>
                <td className="table-td">{file.relatedSubmission ? `${file.relatedSubmission.paper.title} - ${file.relatedSubmission.venue.name}` : "-"}</td>
                <td className="table-td">{formatDate(file.uploadDate ?? file.createdAt)}</td>
                <td className="table-td"><div className="flex gap-2"><Link className="btn-secondary h-8" href={`/files/${file.id}/edit`}>编辑</Link><form action={deleteFileRecord.bind(null, file.id)}><button className="btn-danger h-8">删除</button></form></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
