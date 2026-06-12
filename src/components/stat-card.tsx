import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  tone = "blue",
  icon: Icon
}: {
  label: string;
  value: string | number;
  tone?: "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "slate";
  icon?: LucideIcon;
}) {
  const tones = {
    blue: "bg-blue-50 text-sky border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-primary border-red-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-violet-50 text-violet-700 border-violet-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200"
  };

  return (
    <div className="panel wiggle-on-hover relative overflow-hidden p-4">
      <div className="absolute -right-4 -top-5 h-16 w-16 rounded-full bg-sunshine/35" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-muted">{label}</span>
        {Icon ? (
          <span className={`relative rounded-md border-2 p-1.5 ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className="relative mt-3 text-3xl font-black text-ink">{value}</div>
    </div>
  );
}
