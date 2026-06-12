import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export function PageHeader({
  title,
  description,
  actionHref,
  actionLabel,
  backHref,
  backLabel = "返回上级"
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b-2 border-dashed border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backHref ? (
          <Link href={backHref} className="back-link mb-4" aria-label={backLabel}>
            <span className="back-icon">
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
            <span>{backLabel}</span>
          </Link>
        ) : null}
        <h1 className="break-words text-3xl font-black tracking-normal text-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-muted">{description}</p> : null}
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary w-fit sm:mt-1">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
