import { deleteVenue } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { feeStatusLabels, researchFitLabels, valueLevelLabels, venueTypeLabels, worthAttendingLabels, worthSubmittingAgainLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function VenuesPage({ searchParams }: { searchParams?: { q?: string; type?: string; self?: string; worth?: string; again?: string; cost?: string; difficulty?: string; academic?: string } }) {
  const venues = await prisma.venue.findMany({
    where: {
      name: searchParams?.q ? { contains: searchParams.q } : undefined,
      type: searchParams?.type ? (searchParams.type as any) : undefined,
      conferenceInfo: {
        needSelfFunded: searchParams?.self ? searchParams.self === "true" : undefined,
        worthAttending: searchParams?.worth ? (searchParams.worth as any) : undefined
      },
      evaluation: {
        worthSubmittingAgain: searchParams?.again || undefined,
        costPressure: searchParams?.cost || undefined,
        submissionDifficulty: searchParams?.difficulty || undefined,
        academicValue: searchParams?.academic || undefined
      }
    },
    include: {
      conferenceInfo: true,
      journalInfo: true,
      evaluation: true,
      versions: true,
      submissions: true
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <>
      <PageHeader title="投稿对象" description="统一管理会议、论坛和期刊，以及对应时间、费用和审稿基础信息。" actionHref="/venues/new" actionLabel="新增投稿对象" backHref="/dashboard" />
      <form className="panel mb-5 grid gap-3 p-4 md:grid-cols-[1fr_150px_150px_150px_150px_150px_auto]">
        <input name="q" placeholder="搜索投稿对象名称" className="field" defaultValue={searchParams?.q ?? ""} />
        <select name="type" className="field" defaultValue={searchParams?.type ?? ""}>
          <option value="">全部类型</option>
          {Object.entries(venueTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select name="again" className="field" defaultValue={searchParams?.again ?? ""}>
          <option value="">再次投稿不限</option>
          {Object.entries(worthSubmittingAgainLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select name="cost" className="field" defaultValue={searchParams?.cost ?? ""}>
          <option value="">费用压力不限</option>
          {Object.entries(valueLevelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select name="difficulty" className="field" defaultValue={searchParams?.difficulty ?? ""}>
          <option value="">投稿难度不限</option>
          {Object.entries(valueLevelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select name="academic" className="field" defaultValue={searchParams?.academic ?? ""}>
          <option value="">学术价值不限</option>
          {Object.entries(valueLevelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className="btn-secondary">筛选</button>
      </form>
      {venues.length === 0 ? (
        <EmptyState title="还没有投稿对象" description="先添加会议、论坛或期刊，后续投稿记录和投稿格式都可以关联它们。" href="/venues/new" action="新增投稿对象" />
      ) : (
        <div className="panel overflow-x-auto overflow-y-hidden">
          <table className="w-full min-w-[1120px]">
            <thead>
              <tr>
                <th className="table-th">名称</th>
                <th className="table-th">类型</th>
                <th className="table-th">级别</th>
                <th className="table-th">匹配度</th>
                <th className="table-th">再次投稿</th>
                <th className="table-th">费用压力</th>
                <th className="table-th">投稿难度</th>
                <th className="table-th">投稿格式 / 投稿</th>
                <th className="table-th">操作</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue) => (
                <tr key={venue.id}>
                  <td className="table-td font-medium text-ink"><a className="text-blue-700 hover:underline" href={`/venues/${venue.id}`}>{venue.name}</a></td>
                  <td className="table-td">{venueTypeLabels[venue.type]}</td>
                  <td className="table-td">{venue.level ?? venue.journalInfo?.journalLevel ?? "-"}</td>
                  <td className="table-td">{researchFitLabels[venue.researchFit]}</td>
                  <td className="table-td">
                    <StatusBadge tone={venue.evaluation?.worthSubmittingAgain === "YES" ? "green" : venue.evaluation?.worthSubmittingAgain === "NO" ? "red" : "slate"}>{worthSubmittingAgainLabels[venue.evaluation?.worthSubmittingAgain ?? "UNKNOWN"]}</StatusBadge>
                  </td>
                  <td className="table-td"><StatusBadge tone={venue.evaluation?.costPressure === "HIGH" ? "orange" : "slate"}>{valueLevelLabels[venue.evaluation?.costPressure ?? "UNKNOWN"]}</StatusBadge></td>
                  <td className="table-td">{valueLevelLabels[venue.evaluation?.submissionDifficulty ?? "UNKNOWN"]}</td>
                  <td className="table-td">{venue.versions.length} / {venue.submissions.length}</td>
                  <td className="table-td">
                    <form action={deleteVenue.bind(null, venue.id)}>
                      <button className="btn-danger h-8">删除</button>
                    </form>
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
