import { BarChart3, CheckCircle2, FileText, Send, XCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { fileTypeLabels, rejectReasonCategoryLabels, venueTypeLabels } from "@/lib/labels";
import { parseResearchAreas } from "@/lib/paper-fields";
import { prisma } from "@/lib/prisma";
import { buildSuggestions } from "@/lib/suggestions";
import { reviewDays } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [papers, versions, submissions, venues, files, persistedSuggestions] = await Promise.all([
    prisma.paper.findMany({ include: { versions: true } }),
    prisma.paperVersion.findMany({ include: { submissions: true, paper: true } }),
    prisma.submission.findMany({ include: { paper: true, venue: true } }),
    prisma.venue.findMany({ include: { conferenceInfo: true, evaluation: true, submissions: true } }),
    prisma.fileRecord.findMany(),
    prisma.suggestion.findMany()
  ]);

  const accepted = submissions.filter((item) => item.result === "ACCEPTED" || item.status === "ACCEPTED");
  const rejected = submissions.filter((item) => item.result === "REJECTED" || item.status === "REJECTED");
  const reviewDurations = submissions.map(reviewDays).filter((item): item is number => typeof item === "number");
  const averageReview = reviewDurations.length ? Math.round(reviewDurations.reduce((sum, item) => sum + item, 0) / reviewDurations.length) : 0;
  const selfFundedTotal = venues.reduce((sum, venue) => sum + (venue.conferenceInfo?.needSelfFunded ? venue.conferenceInfo.totalBudget ?? 0 : 0), 0);
  const areaNames = Array.from(new Set(papers.flatMap((paper) => parseResearchAreas(paper.researchArea))));
  const uniqueByArea = areaNames.map((area) => ({
    area,
    submissions: submissions.filter((submission) => parseResearchAreas(submission.paper.researchArea).includes(area)).length,
    accepted: accepted.filter((submission) => parseResearchAreas(submission.paper.researchArea).includes(area)).length
  }));
  const topVersions = versions.sort((a, b) => b.submissions.length - a.submissions.length).slice(0, 5);
  const rejectionMissingReview = rejected.filter((item) => !item.rejectReasonCategory).length;
  const highCostVenueCount = venues.filter((venue) => venue.evaluation?.costPressure === "HIGH").length;
  const suggestions = buildSuggestions({ papers, submissions, venues, templates: [], persistedSuggestions });
  const rejectionReasons = Array.from(
    rejected.reduce((map, item) => {
      const key = item.rejectReasonCategory ?? "NO_REASON";
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);
  const mostCommonRejectReason = rejectionReasons[0] ? rejectReasonCategoryLabels[rejectionReasons[0][0]] ?? rejectionReasons[0][0] : "暂无";
  const fileTypeCounts = Array.from(
    files.reduce((map, item) => {
      map.set(item.fileType, (map.get(item.fileType) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  );
  const venueHitRates = venues.map((venue) => {
    const total = venue.submissions.length;
    const hits = venue.submissions.filter((item) => item.result === "ACCEPTED" || item.status === "ACCEPTED").length;
    const rejects = venue.submissions.filter((item) => item.result === "REJECTED" || item.status === "REJECTED").length;
    return { name: venue.name, total, hits, rejects, rate: total ? Math.round((hits / total) * 100) : 0 };
  }).filter((item) => item.total > 0);

  return (
    <>
      <PageHeader title="统计复盘" description="从投稿次数、录用拒稿、自费预算、研究方向和投稿格式复用角度复盘。" backHref="/dashboard" />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="总论文数量" value={papers.length} icon={FileText} tone="blue" />
        <StatCard label="总投稿次数" value={submissions.length} icon={Send} tone="purple" />
        <StatCard label="录用次数" value={accepted.length} icon={CheckCircle2} tone="green" />
        <StatCard label="拒稿次数" value={rejected.length} icon={XCircle} tone="red" />
        <StatCard label="会议投稿数量" value={submissions.filter((s) => s.submissionType === "CONFERENCE").length} icon={BarChart3} tone="blue" />
        <StatCard label="论坛投稿数量" value={submissions.filter((s) => s.submissionType === "FORUM").length} icon={BarChart3} tone="yellow" />
        <StatCard label="期刊投稿数量" value={submissions.filter((s) => s.submissionType === "JOURNAL").length} icon={BarChart3} tone="purple" />
        <StatCard label="平均审稿周期" value={`${averageReview} 天`} icon={BarChart3} tone="slate" />
        <StatCard label="自费会议总金额" value={`¥${selfFundedTotal.toFixed(0)}`} icon={BarChart3} tone="orange" />
        <StatCard label="已拒稿但未复盘" value={rejectionMissingReview} icon={BarChart3} tone="red" />
        <StatCard label="最常见拒稿原因" value={mostCommonRejectReason} icon={BarChart3} tone="orange" />
        <StatCard label="费用压力高对象" value={highCostVenueCount} icon={BarChart3} tone="orange" />
        <StatCard label="文件数量" value={files.length} icon={FileText} tone="purple" />
        <StatCard label="下一步建议数量" value={suggestions.length} icon={BarChart3} tone="blue" />
        <StatCard label="高优先级建议" value={suggestions.filter((item) => item.priority === "HIGH" && !item.isDone).length} icon={BarChart3} tone="orange" />
        <StatCard label="已完成建议" value={suggestions.filter((item) => item.isDone).length} icon={CheckCircle2} tone="green" />
        <StatCard label="未完成建议" value={suggestions.filter((item) => !item.isDone).length} icon={XCircle} tone="yellow" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TablePanel title="不同研究方向投稿与录用">
          {uniqueByArea.map((item) => (
            <tr key={item.area}>
              <td className="table-td font-medium text-ink">{item.area}</td>
              <td className="table-td">{item.submissions}</td>
              <td className="table-td">{item.accepted}</td>
            </tr>
          ))}
        </TablePanel>
        <TablePanel title="不同会议 / 期刊投稿结果">
          {venueHitRates.map((item) => (
            <tr key={item.name}>
              <td className="table-td font-medium text-ink">{item.name}</td>
              <td className="table-td">录用 {item.hits} / 拒稿 {item.rejects}</td>
              <td className="table-td">命中率 {item.rate}%</td>
            </tr>
          ))}
        </TablePanel>
        <TablePanel title="拒稿原因分布">
          {rejectionReasons.map(([reason, count]) => (
            <tr key={reason}>
              <td className="table-td font-medium text-ink">{rejectReasonCategoryLabels[reason] ?? reason}</td>
              <td className="table-td">{count}</td>
              <td className="table-td">次</td>
            </tr>
          ))}
        </TablePanel>
        <TablePanel title="不同文件类型数量">
          {fileTypeCounts.map(([type, count]) => (
            <tr key={type}>
              <td className="table-td font-medium text-ink">{fileTypeLabels[type] ?? type}</td>
              <td className="table-td">{count}</td>
              <td className="table-td">个</td>
            </tr>
          ))}
        </TablePanel>
        <TablePanel title="投稿格式复用次数">
          {topVersions.map((item) => (
            <tr key={item.id}>
              <td className="table-td font-medium text-ink">{item.versionName}</td>
              <td className="table-td">{item.paper.title}</td>
              <td className="table-td">{item.submissions.length}</td>
            </tr>
          ))}
        </TablePanel>
      </div>
    </>
  );
}

function TablePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel overflow-x-auto overflow-y-hidden">
      <h2 className="border-b border-line p-5 text-base font-semibold text-ink">{title}</h2>
      <table className="w-full">
        <tbody>{children}</tbody>
      </table>
    </section>
  );
}
