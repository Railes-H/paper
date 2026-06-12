import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileCheck2, FileText, Gauge, Send, Sparkles, XCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { calendarEventTypeLabels, fileTypeLabels, paperStatusLabels, reminderTypeLabels, suggestionTypeLabels, valueLevelLabels, worthSubmittingAgainLabels } from "@/lib/labels";
import { buildCalendarEvents } from "@/lib/calendar";
import { displayResearchAreas } from "@/lib/paper-fields";
import { prisma } from "@/lib/prisma";
import { computeSubmissionReminders } from "@/lib/reminders";
import { buildSuggestions } from "@/lib/suggestions";
import { formatDate, isActiveSubmission } from "@/lib/utils";

export default async function DashboardPage() {
  const [papers, allPapers, submissions, venues, persistedSuggestions, recentFiles] = await Promise.all([
    prisma.paper.findMany({
      include: {
        versions: true,
        submissions: { include: { venue: true }, orderBy: { updatedAt: "desc" }, take: 1 }
      },
      orderBy: { updatedAt: "desc" },
      take: 8
    }),
    prisma.paper.findMany({ include: { versions: true } }),
    prisma.submission.findMany({
      include: {
        paper: true,
        paperVersion: true,
        venue: { include: { conferenceInfo: true, journalInfo: true, evaluation: true } }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.venue.findMany({ include: { conferenceInfo: true, journalInfo: true, evaluation: true, submissions: true } }),
    prisma.suggestion.findMany(),
    prisma.fileRecord.findMany({ include: { relatedPaper: true }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  const reminders = computeSubmissionReminders(submissions);
  const suggestions = buildSuggestions({ papers: allPapers, submissions, venues, templates: [], persistedSuggestions });
  const highSuggestions = suggestions.filter((item) => item.priority === "HIGH" && !item.isDone).slice(0, 5);
  const calendarEvents = buildCalendarEvents(submissions).filter((item) => {
    const diff = Math.ceil((item.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).slice(0, 6);
  const rejectedWithoutReview = submissions.filter((item) => (item.result === "REJECTED" || item.status === "REJECTED") && !item.rejectReasonCategory);
  const highCostVenues = venues.filter((venue) => venue.evaluation?.costPressure === "HIGH");
  const worthAgainVenues = venues.filter((venue) => venue.evaluation?.worthSubmittingAgain === "YES");
  const needReceipt = submissions.filter((item) => item.submittedSuccessfully && !item.receiptUrl);
  const needRejectReason = rejectedWithoutReview.filter((item) => !item.rejectReasonCategory && !item.rejectReason);
  const formatIssueCount = submissions.filter((item) => !item.formatChecked).length;
  const missingFileCount = submissions.filter((item) => !item.submittedFileUrl).length;
  const activeCount = submissions.filter((item) => isActiveSubmission(item.status)).length;
  const reviewCount = submissions.filter((item) => ["INITIAL_REVIEW", "EXTERNAL_REVIEW", "REVISION", "REVISED"].includes(item.status)).length;
  const acceptedCount = submissions.filter((item) => item.status === "ACCEPTED" || item.result === "ACCEPTED").length;
  const rejectedCount = submissions.filter((item) => item.status === "REJECTED" || item.result === "REJECTED").length;
  const feeRiskCount = venues.filter((venue) => venue.conferenceInfo?.needSelfFunded || venue.conferenceInfo?.feeStatus === "UNKNOWN").length;
  const urgentReminder = reminders.find((item) => item.priority === "high") ?? reminders[0];
  const nextSuggestion = highSuggestions[0] ?? suggestions.find((item) => !item.isDone);
  const actionCount = reminders.length + highSuggestions.length + needReceipt.length + needRejectReason.length + formatIssueCount + missingFileCount;

  return (
    <>
      <PageHeader title="首页 Dashboard" description="集中查看论文母版、投稿进度、近期提醒和费用风险。" />

      <section className="panel mb-6 overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="relative overflow-hidden border-b-2 border-line bg-yellow-50/70 p-5 xl:border-b-0 xl:border-r-2">
            <div className="absolute right-5 top-5 hidden h-20 w-20 rounded-full border-2 border-line bg-sunshine/45 lg:block" />
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border-2 border-line bg-white px-2.5 py-1 text-xs font-black text-ink shadow-[3px_3px_0_rgba(36,48,79,0.08)]">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                v1.2 工作台
              </div>
              <h2 className="text-2xl font-black leading-tight text-ink">今天先处理 {actionCount} 个投稿动作</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted">
                把提醒、格式检查、回执、拒稿复盘和下一步建议集中到一个入口，先解决会影响投稿推进的事项。
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <WorkbenchCard
                  href={urgentReminder ? "/timeline" : "/submissions"}
                  icon={AlertTriangle}
                  label="最紧急提醒"
                  value={urgentReminder?.title ?? "暂无紧急提醒"}
                  meta={urgentReminder ? formatDate(urgentReminder.date) : "当前节奏稳定"}
                  tone={urgentReminder?.priority === "high" ? "red" : "yellow"}
                />
                <WorkbenchCard
                  href="/suggestions"
                  icon={Sparkles}
                  label="优先建议"
                  value={nextSuggestion?.suggestionTitle ?? "暂无新建议"}
                  meta={nextSuggestion ? suggestionTypeLabels[nextSuggestion.suggestionType] ?? nextSuggestion.suggestionType : "可继续完善数据"}
                  tone="blue"
                />
                <WorkbenchCard
                  href="/submissions?format=false"
                  icon={FileCheck2}
                  label="材料缺口"
                  value={`${formatIssueCount + missingFileCount + needReceipt.length} 项待补`}
                  meta={`格式 ${formatIssueCount} · 文件 ${missingFileCount} · 回执 ${needReceipt.length}`}
                  tone="orange"
                />
              </div>
            </div>
          </div>

          <div className="grid content-between gap-4 bg-white/70 p-5">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-black text-ink">投稿漏斗</h2>
                <Link href="/submissions" className="inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                  查看记录
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3">
                <ProgressRow label="投稿中" value={activeCount} total={Math.max(submissions.length, 1)} tone="blue" />
                <ProgressRow label="审稿中" value={reviewCount} total={Math.max(submissions.length, 1)} tone="yellow" />
                <ProgressRow label="已录用" value={acceptedCount} total={Math.max(submissions.length, 1)} tone="green" />
                <ProgressRow label="已拒稿" value={rejectedCount} total={Math.max(submissions.length, 1)} tone="red" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <QuickMetric label="高优先级建议" value={highSuggestions.length} href="/suggestions" />
              <QuickMetric label="待拒稿复盘" value={needRejectReason.length} href="/submissions?rejectionReview=missing" />
              <QuickMetric label="费用风险" value={feeRiskCount} href="/venues" />
              <QuickMetric label="30天日程" value={calendarEvents.length} href="/calendar" />
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="完整版论文数量" value={allPapers.length} icon={FileText} tone="blue" />
        <StatCard label="投稿记录数量" value={submissions.length} icon={Send} tone="purple" />
        <StatCard label="当前投稿中数量" value={activeCount} icon={Send} tone="blue" />
        <StatCard label="当前审稿中数量" value={reviewCount} icon={Clock3} tone="yellow" />
        <StatCard label="已录用数量" value={acceptedCount} icon={CheckCircle2} tone="green" />
        <StatCard label="已拒稿数量" value={rejectedCount} icon={XCircle} tone="red" />
        <StatCard label="即将截止数量" value={reminders.filter((item) => item.type === "DEADLINE_SOON").length} icon={AlertTriangle} tone="yellow" />
        <StatCard label="自费或费用未知" value={feeRiskCount} icon={AlertTriangle} tone="orange" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="panel overflow-x-auto overflow-y-hidden">
          <div className="flex items-center justify-between border-b border-line p-5">
            <h2 className="text-base font-semibold text-ink">完整版论文库</h2>
            <Link href="/papers" className="text-sm font-medium text-blue-700">查看全部</Link>
          </div>
          <table className="w-full min-w-[860px]">
            <thead>
              <tr>
                <th className="table-th">论文标题</th>
                <th className="table-th">研究方向</th>
                <th className="table-th">字数</th>
                <th className="table-th">状态</th>
                <th className="table-th">投稿记录</th>
                <th className="table-th">最近投稿</th>
                <th className="table-th">操作</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper) => (
                <tr key={paper.id}>
                  <td className="table-td font-medium text-ink">{paper.title}</td>
                  <td className="table-td">{displayResearchAreas(paper.researchArea)}</td>
                  <td className="table-td">{paper.masterWordCount ?? "-"}</td>
                  <td className="table-td"><StatusBadge tone="blue">{paperStatusLabels[paper.currentStatus]}</StatusBadge></td>
                  <td className="table-td">{paper.submissions.length}</td>
                  <td className="table-td">{paper.submissions[0]?.venue.name ?? "-"}</td>
                  <td className="table-td"><Link className="btn-secondary h-8" href={`/papers/${paper.id}`}>详情</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">未来 30 天重要事项</h2>
            <Link href="/timeline" className="text-sm font-medium text-blue-700">时间线</Link>
          </div>
          <div className="space-y-3">
            {reminders.slice(0, 8).map((reminder) => (
              <Link key={`${reminder.submissionId}-${reminder.type}-${reminder.title}`} href={`/submissions`} className="block rounded-md border-2 border-line bg-white p-3 shadow-[3px_3px_0_rgba(36,48,79,0.05)] transition hover:-translate-y-0.5 hover:bg-yellow-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <StatusBadge tone={reminder.priority === "high" ? "orange" : "yellow"}>{reminderTypeLabels[reminder.type]}</StatusBadge>
                    <div className="mt-2 text-sm font-medium text-ink">{reminder.title}</div>
                  </div>
                  <div className="whitespace-nowrap text-xs text-slate-500">{formatDate(reminder.date)}</div>
                </div>
              </Link>
            ))}
            {reminders.length === 0 ? <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">暂时没有紧急提醒。</div> : null}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <MiniList title="正在审稿的期刊" items={submissions.filter((s) => s.submissionType === "JOURNAL" && ["INITIAL_REVIEW", "EXTERNAL_REVIEW", "REVISION"].includes(s.status)).map((s) => `${s.venue.name}：${s.paper.title}`)} />
        <MiniList title="需要检查格式" items={submissions.filter((s) => !s.formatChecked).map((s) => `${s.paper.title} - ${s.venue.name}`)} />
        <MiniList title="最近拒稿记录" items={submissions.filter((s) => s.result === "REJECTED" || s.status === "REJECTED").slice(0, 5).map((s) => `${s.paper.title} - ${s.venue.name}`)} />
        <MiniList title="高优先级下一步建议" items={highSuggestions.map((s) => `${suggestionTypeLabels[s.suggestionType]}：${s.suggestionTitle}`)} />
        <MiniList title="已拒稿但未复盘" items={rejectedWithoutReview.map((s) => `${s.paper.title} - ${s.venue.name}`)} />
        <MiniList title="未来 30 天日历事项" items={calendarEvents.map((event) => `${formatDate(event.date)} ${calendarEventTypeLabels[event.type]}：${event.title}`)} />
        <MiniList title="费用压力高的会议" items={highCostVenues.map((venue) => `${venue.name}：${valueLevelLabels[venue.evaluation?.costPressure ?? "UNKNOWN"]}`)} />
        <MiniList title="值得再次投稿的对象" items={worthAgainVenues.map((venue) => `${venue.name}：${worthSubmittingAgainLabels[venue.evaluation?.worthSubmittingAgain ?? "UNKNOWN"]}`)} />
        <MiniList title="最近新增文件" items={recentFiles.map((file) => `${file.fileName} · ${fileTypeLabels[file.fileType] ?? file.fileType}`)} />
        <MiniList title="需要上传投稿回执" items={needReceipt.map((s) => `${s.paper.title} - ${s.venue.name}`)} />
        <MiniList title="需要补充拒稿原因" items={needRejectReason.map((s) => `${s.paper.title} - ${s.venue.name}`)} />
      </div>
    </>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <span className="rounded-md border border-orange-100 bg-yellow-50 px-2 py-0.5 text-xs font-black text-ink">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.length ? items.slice(0, 5).map((item) => <div key={item} className="rounded-md border border-orange-100 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-600">{item}</div>) : <div className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">暂无记录</div>}
      </div>
    </section>
  );
}

type DashboardTone = "blue" | "green" | "red" | "yellow" | "orange";

const toneClasses: Record<DashboardTone, { icon: string; bar: string; panel: string }> = {
  blue: { icon: "border-blue-200 bg-blue-50 text-sky", bar: "bg-sky", panel: "hover:border-blue-200 hover:bg-blue-50" },
  green: { icon: "border-green-200 bg-green-50 text-green-700", bar: "bg-mint", panel: "hover:border-green-200 hover:bg-green-50" },
  red: { icon: "border-red-200 bg-red-50 text-primary", bar: "bg-primary", panel: "hover:border-red-200 hover:bg-red-50" },
  yellow: { icon: "border-yellow-200 bg-yellow-50 text-yellow-800", bar: "bg-sunshine", panel: "hover:border-yellow-200 hover:bg-yellow-50" },
  orange: { icon: "border-orange-200 bg-orange-50 text-orange-700", bar: "bg-orange-500", panel: "hover:border-orange-200 hover:bg-orange-50" }
};

function WorkbenchCard({
  href,
  icon: Icon,
  label,
  value,
  meta,
  tone
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  meta: string;
  tone: DashboardTone;
}) {
  return (
    <Link href={href} className={`group rounded-md border-2 border-line bg-white p-3 shadow-[4px_4px_0_rgba(36,48,79,0.08)] transition hover:-translate-y-0.5 ${toneClasses[tone].panel}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-black text-muted">{label}</span>
        <span className={`rounded-md border-2 p-1.5 ${toneClasses[tone].icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-ink">{value}</div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs font-bold text-muted">
        <span className="truncate">{meta}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function ProgressRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: DashboardTone }) {
  const width = `${Math.min(100, Math.round((value / total) * 100))}%`;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-black text-ink">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2.5 rounded-full border border-orange-100 bg-yellow-50">
        <div className={`h-full rounded-full ${toneClasses[tone].bar}`} style={{ width }} />
      </div>
    </div>
  );
}

function QuickMetric({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-md border-2 border-line bg-white px-3 py-2 transition hover:-translate-y-0.5 hover:bg-blue-50">
      <div className="text-xl font-black text-ink">{value}</div>
      <div className="mt-0.5 text-xs font-bold text-muted">{label}</div>
    </Link>
  );
}
