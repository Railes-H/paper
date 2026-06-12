import { markSuggestionDone } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { priorityLabels, suggestionTypeLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { buildSuggestions } from "@/lib/suggestions";

export default async function SuggestionsPage({ searchParams }: { searchParams?: { type?: string; priority?: string; done?: string } }) {
  const [papers, submissions, venues, persistedSuggestions] = await Promise.all([
    prisma.paper.findMany({ include: { versions: true } }),
    prisma.submission.findMany({ include: { paper: true, paperVersion: true, venue: { include: { evaluation: true, conferenceInfo: true, journalInfo: true } } } }),
    prisma.venue.findMany({ include: { evaluation: true, conferenceInfo: true, journalInfo: true } }),
    prisma.suggestion.findMany()
  ]);
  const suggestions = buildSuggestions({ papers, submissions, venues, templates: [], persistedSuggestions }).filter((item) => {
    if (searchParams?.type && item.suggestionType !== searchParams.type) return false;
    if (searchParams?.priority && item.priority !== searchParams.priority) return false;
    if (searchParams?.done === "true" && !item.isDone) return false;
    if (searchParams?.done === "false" && item.isDone) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="下一步投稿建议" description="基于投稿结果、拒稿原因、投稿格式、投稿对象评价和等待时长自动生成中文建议。" backHref="/dashboard" />
      <form className="panel mb-5 grid gap-3 p-4 md:grid-cols-[220px_180px_180px_auto]">
        <select name="type" className="field" defaultValue={searchParams?.type ?? ""}><option value="">全部建议类型</option>{Object.entries(suggestionTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select name="priority" className="field" defaultValue={searchParams?.priority ?? ""}><option value="">全部优先级</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select name="done" className="field" defaultValue={searchParams?.done ?? ""}><option value="">完成状态不限</option><option value="false">未完成</option><option value="true">已完成</option></select>
        <button className="btn-secondary">筛选</button>
      </form>
      <div className="grid gap-4">
        {suggestions.map((item) => (
          <section key={item.id} className="panel p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <StatusBadge tone={item.priority === "HIGH" ? "orange" : item.priority === "LOW" ? "slate" : "purple"}>{priorityLabels[item.priority]}</StatusBadge>
                  <StatusBadge tone="blue">{suggestionTypeLabels[item.suggestionType]}</StatusBadge>
                  {item.isDone ? <StatusBadge tone="green">已完成</StatusBadge> : <StatusBadge tone="yellow">未完成</StatusBadge>}
                </div>
                <h2 className="text-base font-semibold text-ink">{item.suggestionTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.suggestionContent}</p>
              </div>
              {!item.isDone ? (
                <form action={markSuggestionDone.bind(null, item.id)}>
                  <input type="hidden" name="suggestionTitle" value={item.suggestionTitle} />
                  <input type="hidden" name="suggestionType" value={item.suggestionType} />
                  <input type="hidden" name="suggestionContent" value={item.suggestionContent} />
                  <input type="hidden" name="priority" value={item.priority} />
                  <input type="hidden" name="relatedPaperId" value={item.relatedPaperId ?? ""} />
                  <input type="hidden" name="relatedSubmissionId" value={item.relatedSubmissionId ?? ""} />
                  <input type="hidden" name="relatedVenueId" value={item.relatedVenueId ?? ""} />
                  <button className="btn-secondary">标记完成</button>
                </form>
              ) : null}
            </div>
          </section>
        ))}
        {suggestions.length === 0 ? <div className="panel p-8 text-center text-sm text-slate-500">当前筛选下暂无建议。</div> : null}
      </div>
    </>
  );
}
