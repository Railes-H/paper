"use client";

import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSubmissionStatus } from "@/app/actions";
import { forumSubmissionStatusLabels, journalSubmissionStatusLabels, submissionStatusLabels } from "@/lib/labels";

const statusStyles: Record<string, string> = {
  PREPARING: "border-slate-200 bg-slate-50 text-slate-700",
  SUBMITTED: "border-blue-200 bg-blue-50 text-blue-700",
  WAITING_RESULT: "border-violet-200 bg-violet-50 text-violet-700",
  INITIAL_REVIEW: "border-cyan-200 bg-cyan-50 text-cyan-700",
  EXTERNAL_REVIEW: "border-indigo-200 bg-indigo-50 text-indigo-700",
  REVISION: "border-orange-200 bg-orange-50 text-orange-700",
  REVISED: "border-amber-200 bg-amber-50 text-amber-700",
  ACCEPTED: "border-green-200 bg-green-50 text-green-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  WITHDRAWN: "border-slate-300 bg-slate-100 text-slate-600",
  ARCHIVED: "border-slate-300 bg-white text-slate-500"
};

export function SubmissionStatusEditor({ id, status, submissionType }: { id: string; status: string; submissionType: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, startTransition] = useTransition();
  const options = submissionType === "JOURNAL" ? journalSubmissionStatusLabels : forumSubmissionStatusLabels;
  const visibleOptions = Object.entries(options);

  const selectStatus = (nextStatus: string) => {
    if (nextStatus === currentStatus) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await updateSubmissionStatus(id, nextStatus);
      setCurrentStatus(nextStatus);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        className={`inline-flex h-8 items-center gap-1.5 rounded-md border-2 px-2.5 text-xs font-black transition hover:-translate-y-0.5 ${statusStyles[currentStatus] ?? statusStyles.PREPARING}`}
        onClick={() => setOpen(true)}
        aria-label="编辑投稿状态"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-2 w-2 rounded-full bg-current" />}
        {submissionStatusLabels[currentStatus] ?? currentStatus}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 p-4 backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg border-2 border-ink bg-white p-5 shadow-[7px_7px_0_rgba(36,48,79,0.16)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-ink">更新投稿状态</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">选择后立即保存，投稿进度会同步到首页和统计页面。</p>
              </div>
              <button type="button" className="btn-secondary h-8 w-8 px-0" onClick={() => setOpen(false)} aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleOptions.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  disabled={isPending}
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-md border-2 px-3 py-2 text-left text-sm font-bold transition hover:-translate-y-0.5 ${statusStyles[value] ?? statusStyles.PREPARING}`}
                  onClick={() => selectStatus(value)}
                >
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-current" />{label}</span>
                  {currentStatus === value ? <Check className="h-4 w-4" /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
