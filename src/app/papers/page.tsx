import Link from "next/link";
import { deletePaper } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { paperStatusLabels } from "@/lib/labels";
import { displayResearchAreas } from "@/lib/paper-fields";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function PapersPage({
  searchParams
}: {
  searchParams?: { q?: string; status?: string; area?: string };
}) {
  const papers = await prisma.paper.findMany({
    where: {
      title: searchParams?.q ? { contains: searchParams.q } : undefined,
      currentStatus: searchParams?.status ? (searchParams.status as any) : undefined,
      researchArea: searchParams?.area ? { contains: searchParams.area } : undefined
    },
    include: {
      submissions: {
        include: { venue: true },
        orderBy: { updatedAt: "desc" },
        take: 1
      },
      _count: { select: { submissions: true } }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <>
      <PageHeader
        title="完整版论文库"
        description="管理每篇论文的母版信息，并查看它投过哪些论坛或期刊。"
        actionHref="/papers/new"
        actionLabel="新增论文"
        backHref="/dashboard"
      />
      <form className="panel mb-5 grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_auto]">
        <input name="q" placeholder="搜索论文标题" className="field" defaultValue={searchParams?.q ?? ""} />
        <input name="area" placeholder="研究方向" className="field" defaultValue={searchParams?.area ?? ""} />
        <select name="status" className="field" defaultValue={searchParams?.status ?? ""}>
          <option value="">全部状态</option>
          {Object.entries(paperStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="btn-secondary">筛选</button>
      </form>
      {papers.length === 0 ? (
        <EmptyState title="还没有论文" description="先添加一篇完整版论文，再记录它投向的论坛或期刊。" href="/papers/new" action="新增第一篇论文" />
      ) : (
        <div className="panel overflow-x-auto overflow-y-hidden">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr>
                <th className="table-th">论文标题</th>
                <th className="table-th">研究方向</th>
                <th className="table-th">字数</th>
                <th className="table-th">状态</th>
                <th className="table-th">投稿次数</th>
                <th className="table-th">最近投稿对象</th>
                <th className="table-th">最新修改</th>
                <th className="table-th">操作</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper) => (
                <tr key={paper.id}>
                  <td className="table-td font-medium text-ink">{paper.title}</td>
                  <td className="table-td">{displayResearchAreas(paper.researchArea)}</td>
                  <td className="table-td">{paper.masterWordCount ?? "-"}</td>
                  <td className="table-td">
                    <StatusBadge tone={paper.currentStatus === "ACCEPTED" ? "green" : paper.currentStatus === "REJECTED" ? "red" : "blue"}>
                      {paperStatusLabels[paper.currentStatus]}
                    </StatusBadge>
                  </td>
                  <td className="table-td">{paper._count.submissions}</td>
                  <td className="table-td">{paper.submissions[0]?.venue.name ?? "-"}</td>
                  <td className="table-td">{formatDate(paper.latestUpdateDate ?? paper.updatedAt)}</td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <Link className="btn-secondary h-8" href={`/papers/${paper.id}`}>
                        详情
                      </Link>
                      <Link className="btn-secondary h-8" href={`/papers/${paper.id}/edit`}>
                        编辑
                      </Link>
                      <form action={deletePaper.bind(null, paper.id)}>
                        <button className="btn-danger h-8">删除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
