import { Search } from "lucide-react";

export function FilterBar({
  children,
  searchPlaceholder = "搜索"
}: {
  children?: React.ReactNode;
  searchPlaceholder?: string;
}) {
  return (
    <form className="panel mb-5 grid gap-3 p-4 md:grid-cols-[1fr_auto]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input name="q" placeholder={searchPlaceholder} className="field pl-9" />
      </label>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </form>
  );
}
