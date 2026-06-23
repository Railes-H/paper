"use client";

import type { Paper, PaperVersion, Submission, Venue } from "@prisma/client";
import { useState } from "react";
import { updateSubmission } from "@/app/actions";
import {
  forumSubmissionStatusLabels,
  journalSubmissionStatusLabels,
  reviewStageLabels,
  venueTypeLabels
} from "@/lib/labels";
import { toDateInputValue } from "@/lib/utils";

type EditableSubmission = Submission & { venue: Venue; paperVersion: PaperVersion };

export function SubmissionEditForm({ submission, papers }: { submission: EditableSubmission; papers: Paper[] }) {
  const [submissionType, setSubmissionType] = useState(submission.submissionType);
  const isJournal = submissionType === "JOURNAL";
  const statusOptions = isJournal ? journalSubmissionStatusLabels : forumSubmissionStatusLabels;
  const action = updateSubmission.bind(null, submission.id);

  return (
    <form action={action} className="panel grid gap-5 p-5">
      <section className="grid gap-4 rounded-lg border border-line bg-slate-50 p-4">
        <div>
          <h2 className="text-sm font-black text-ink">投稿对象与关联论文</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">修改名称时，系统会自动匹配或创建对应的简化投稿对象。</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(venueTypeLabels).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-line bg-white px-3 py-2 text-sm font-bold text-slate-700">
              <input name="submissionType" type="radio" value={value} checked={submissionType === value} onChange={(event) => setSubmissionType(event.target.value)} />
              {label}
            </label>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="label">投稿对象名称</span><input name="venueName" required defaultValue={submission.venue.name} className="field" /></label>
          <label><span className="label">格式名称</span><input name="formatLabel" required defaultValue={submission.paperVersion.versionName} className="field" /></label>
          <label>
            <span className="label">投稿论文</span>
            <select name="paperId" required defaultValue={submission.paperId} className="field">
              {papers.map((paper) => <option key={paper.id} value={paper.id}>{paper.title}</option>)}
            </select>
          </label>
          <label>
            <span className="label">投稿状态</span>
            <select name="status" key={submissionType} defaultValue={Object.hasOwn(statusOptions, submission.status) ? submission.status : "PREPARING"} className="field">
              {Object.entries(statusOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-line bg-white p-4">
        <h2 className="text-sm font-black text-ink">关键日期</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <DateField name="submissionDate" label="投稿日期" value={submission.submissionDate} />
          <DateField name="deadline" label="截稿日期" value={submission.deadline} />
          <DateField name="acceptDate" label="录稿日期" value={submission.acceptDate} />
          <DateField name="rejectDate" label="拒稿日期" value={submission.rejectDate} />
          {isJournal ? <>
            <DateField name="revisionDate" label="退修日期" value={submission.revisionDate} />
            <DateField name="revisionDeadline" label="返修截止日期" value={submission.revisionDeadline} />
            <DateField name="revisionSubmittedDate" label="返修提交日期" value={submission.revisionSubmittedDate} />
          </> : null}
        </div>
      </section>

      {isJournal ? (
        <section className="rounded-lg border border-line bg-slate-50 p-4">
          <label>
            <span className="label">审稿阶段</span>
            <select name="reviewStage" defaultValue={submission.reviewStage} className="field">
              {Object.entries(reviewStageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </section>
      ) : null}

      <section className="grid gap-4 rounded-lg border border-line bg-white p-4 md:grid-cols-2">
        <label><span className="label">投稿系统链接</span><input name="submissionSystemUrl" type="url" defaultValue={submission.submissionSystemUrl ?? ""} className="field" /></label>
        <label><span className="label">投稿回执链接</span><input name="receiptUrl" type="url" defaultValue={submission.receiptUrl ?? ""} className="field" /></label>
        <label><span className="label">投稿材料清单</span><textarea name="submissionMaterials" rows={4} defaultValue={submission.submissionMaterials ?? ""} className="field" /></label>
        <label><span className="label">审稿备注</span><textarea name="reviewNotes" rows={4} defaultValue={submission.reviewNotes ?? ""} className="field" /></label>
        <label className="md:col-span-2"><span className="label">下一步计划</span><textarea name="nextAction" rows={3} defaultValue={submission.nextAction ?? ""} className="field" /></label>
      </section>

      <div className="grid gap-3 rounded-lg border border-line bg-slate-50 p-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="formatChecked" type="checkbox" defaultChecked={submission.formatChecked} />已检查格式</label>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="submittedSuccessfully" type="checkbox" defaultChecked={submission.submittedSuccessfully} />已成功提交</label>
      </div>

      <div className="flex justify-end"><button className="btn-primary">保存修改</button></div>
    </form>
  );
}

function DateField({ name, label, value }: { name: string; label: string; value?: Date | string | null }) {
  return <label><span className="label">{label}</span><input name={name} type="date" defaultValue={toDateInputValue(value)} className="field" /></label>;
}
