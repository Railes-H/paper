import { cn } from "@/lib/utils";

const toneClasses = {
  blue: "bg-blue-50 text-sky ring-blue-200",
  green: "bg-green-50 text-green-700 ring-green-200",
  red: "bg-red-50 text-primary ring-red-200",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  slate: "bg-slate-50 text-slate-600 ring-slate-200"
};

export function StatusBadge({
  children,
  tone = "slate"
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-black ring-2", toneClasses[tone])}>
      {children}
    </span>
  );
}
