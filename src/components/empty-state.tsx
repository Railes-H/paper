import Link from "next/link";

export function EmptyState({
  title,
  description,
  href,
  action
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="panel flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {href && action ? (
        <Link href={href} className="btn-primary mt-5">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
