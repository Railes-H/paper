import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buildCalendarEvents, yyyyMmDd } from "@/lib/calendar";
import { calendarEventTypeLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { daysBetween, formatDate } from "@/lib/utils";

const tones: Record<string, "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "slate"> = {
  DEADLINE: "yellow",
  CONFERENCE: "blue",
  REVISION: "red",
  REVIEW_REMINDER: "purple",
  ACCEPTED: "green",
  REJECTED: "red",
  COST: "orange",
  FORMAT_CHECK: "purple",
  SUBMISSION: "slate"
};

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }: { searchParams?: { view?: string; type?: string; range?: string; month?: string } }) {
  const submissions = await prisma.submission.findMany({
    include: { paper: true, venue: { include: { conferenceInfo: true } } },
    orderBy: { updatedAt: "desc" }
  });
  const now = new Date();
  const monthDate = searchParams?.month ? new Date(`${searchParams.month}-01T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), 1);
  let events = buildCalendarEvents(submissions).filter((event) => !searchParams?.type || event.type === searchParams.type);
  events = events.filter((event) => {
    const diff = daysBetween(now, event.date);
    if (searchParams?.range === "7") return diff >= 0 && diff <= 7;
    if (searchParams?.range === "30") return diff >= 0 && diff <= 30;
    if (searchParams?.range === "overdue") return diff < 0;
    return true;
  });
  const view = searchParams?.view ?? "month";
  const monthEvents = events.filter((event) => event.date.getFullYear() === monthDate.getFullYear() && event.date.getMonth() === monthDate.getMonth());
  const days = buildMonthDays(monthDate);

  return (
    <>
      <PageHeader title="日历视图" description="以月视图或列表视图查看截稿、会议、返修、审稿提醒、录用拒稿和费用事项。" backHref="/dashboard" />
      <form className="panel mb-5 grid gap-3 p-4 md:grid-cols-[160px_180px_180px_160px_auto]">
        <select name="view" className="field" defaultValue={view}><option value="month">月视图</option><option value="list">列表视图</option></select>
        <input name="month" type="month" className="field" defaultValue={`${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`} />
        <select name="type" className="field" defaultValue={searchParams?.type ?? ""}><option value="">全部事件类型</option>{Object.entries(calendarEventTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select name="range" className="field" defaultValue={searchParams?.range ?? ""}><option value="">全部时间</option><option value="7">未来 7 天</option><option value="30">未来 30 天</option><option value="overdue">已逾期</option></select>
        <button className="btn-secondary">筛选</button>
      </form>
      {view === "list" ? <EventList events={events} /> : (
        <section className="panel overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line bg-slate-50 text-center text-xs font-semibold text-slate-500">{["一", "二", "三", "四", "五", "六", "日"].map((day) => <div key={day} className="p-3">{day}</div>)}</div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = yyyyMmDd(day);
              const items = monthEvents.filter((event) => yyyyMmDd(event.date) === key);
              return (
                <div key={key} className="min-h-[130px] border-b border-r border-slate-100 bg-white p-2">
                  <div className="mb-2 text-xs font-semibold text-slate-500">{day.getDate()}</div>
                  <div className="space-y-1">
                    {items.slice(0, 3).map((event) => <Link key={event.id} href={event.href} className="block rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-blue-50">{calendarEventTypeLabels[event.type]} · {event.title}</Link>)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function EventList({ events }: { events: ReturnType<typeof buildCalendarEvents> }) {
  return <section className="panel overflow-hidden"><table className="w-full min-w-[840px]"><thead><tr><th className="table-th">日期</th><th className="table-th">类型</th><th className="table-th">事项</th><th className="table-th">跳转</th></tr></thead><tbody>{events.map((event) => <tr key={event.id}><td className="table-td">{formatDate(event.date)}</td><td className="table-td"><StatusBadge tone={tones[event.type] ?? "slate"}>{calendarEventTypeLabels[event.type]}</StatusBadge></td><td className="table-td font-medium text-ink">{event.title}</td><td className="table-td"><Link className="btn-secondary h-8" href={event.href}>查看</Link></td></tr>)}</tbody></table></section>;
}

function buildMonthDays(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  const mondayOffset = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}
