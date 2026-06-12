import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  Download,
  FileText,
  Home,
  Library,
  Send,
  Settings2
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "首页", icon: Home },
  { href: "/papers", label: "完整版论文库", icon: FileText },
  { href: "/venues", label: "投稿对象", icon: Library },
  { href: "/submissions", label: "投稿记录", icon: Send },
  { href: "/suggestions", label: "下一步建议", icon: CalendarClock },
  { href: "/files", label: "文件管理", icon: FileText },
  { href: "/calendar", label: "日历视图", icon: CalendarDays },
  { href: "/export", label: "数据导出", icon: Download },
  { href: "/timeline", label: "时间线提醒", icon: CalendarClock },
  { href: "/stats", label: "统计复盘", icon: BarChart3 }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b-2 border-line bg-white/90 px-4 py-3 shadow-soft backdrop-blur lg:hidden">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink bg-primary text-sm font-black text-white shadow-[3px_3px_0_rgba(36,48,79,0.16)]">
            PT
          </div>
          <div>
            <div className="text-base font-black text-ink">PaperTrack</div>
            <div className="text-xs font-bold text-muted">论文投稿管家</div>
          </div>
        </div>
        <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-md border-2 border-line bg-white px-3 py-2 text-xs font-bold text-ink"
            >
              <item.icon className="h-4 w-4 text-sky" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r-2 border-line bg-white/90 px-4 py-5 shadow-soft backdrop-blur lg:block">
        <div className="mb-8 rounded-lg border-2 border-ink bg-sunshine p-3 shadow-sticker">
          <div className="flex items-center gap-3">
            <div className="wiggle-on-hover flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink bg-primary text-sm font-black text-white shadow-[3px_3px_0_rgba(36,48,79,0.18)]">
              PT
            </div>
            <div>
              <div className="text-base font-black text-ink">PaperTrack</div>
              <div className="text-xs font-bold text-ink/70">论文投稿管家</div>
            </div>
          </div>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-md border-2 border-transparent px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-line hover:bg-blue-50 hover:text-ink"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-sky shadow-[2px_2px_0_rgba(36,48,79,0.08)] group-hover:bg-sunshine group-hover:text-ink">
                <item.icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border-2 border-line bg-rose-50 p-3 text-xs font-medium leading-5 text-muted">
          <Settings2 className="mb-2 h-4 w-4 text-primary" />
          本地 SQLite 存储，不含登录和云同步，适合个人长期维护。
        </div>
      </aside>
      <main className="min-h-screen px-4 py-4 lg:ml-64 lg:px-8 lg:py-7">{children}</main>
    </div>
  );
}
