import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { reminderTypeLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { computeSubmissionReminders } from "@/lib/reminders";
import { daysBetween, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TimelinePage({ searchParams }: { searchParams?: { range?: string } }) {
  const submissions = await prisma.submission.findMany({
    include: {
      paper: true,
      paperVersion: true,
      venue: { include: { conferenceInfo: true, journalInfo: true } }
    }
  });
  const now = new Date();
  const reminders = computeSubmissionReminders(submissions).filter((item) => {
    const diff = daysBetween(now, item.date);
    if (searchParams?.range === "7") return diff >= 0 && diff <= 7;
    if (searchParams?.range === "30") return diff >= 0 && diff <= 30;
    if (searchParams?.range === "overdue") return diff < 0;
    return true;
  });

  return (
    <>
      <PageHeader title="时间线 / 提醒" description="自动汇总截稿、会议开始、返修截止、未回复、格式检查和费用确认事项。" backHref="/dashboard" />
      <form className="panel mb-5 flex flex-wrap gap-2 p-4">
        <select name="range" className="field w-48" defaultValue={searchParams?.range ?? ""}>
          <option value="">全部提醒</option>
          <option value="7">未来 7 天</option>
          <option value="30">未来 30 天</option>
          <option value="overdue">已逾期</option>
        </select>
        <button className="btn-secondary">筛选</button>
      </form>
      <div className="panel overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr>
              <th className="table-th">日期</th>
              <th className="table-th">提醒类型</th>
              <th className="table-th">事项</th>
              <th className="table-th">优先级</th>
              <th className="table-th">跳转</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((reminder) => (
              <tr key={`${reminder.submissionId}-${reminder.type}-${reminder.title}`}>
                <td className="table-td">{formatDate(reminder.date)}</td>
                <td className="table-td"><StatusBadge tone={reminder.priority === "high" ? "orange" : "yellow"}>{reminderTypeLabels[reminder.type]}</StatusBadge></td>
                <td className="table-td font-medium text-ink">{reminder.title}</td>
                <td className="table-td">{reminder.priority === "high" ? "高" : reminder.priority === "medium" ? "中" : "低"}</td>
                <td className="table-td"><Link href="/submissions" className="btn-secondary h-8">投稿记录</Link></td>
              </tr>
            ))}
            {reminders.length === 0 ? (
              <tr><td className="table-td text-center text-slate-500" colSpan={5}>当前筛选下没有提醒。</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
