"use client";

import { useMemo, useState } from "react";
import { createSubmission } from "@/app/actions";
import {
  fileTypeLabels,
  finalSubmissionResultLabels,
  forumSubmissionStatusLabels,
  journalSubmissionStatusLabels,
  reviewStageLabels,
  venueTypeLabels
} from "@/lib/labels";
import { formatFileSize } from "@/lib/utils";

type PaperOption = {
  id: string;
  title: string;
};

type VenueOption = {
  id: string;
  name: string;
  type: string;
};

type FileOption = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  versionNumber: number;
  versionLabel: string | null;
  relatedPaperId: string | null;
};

export function SubmissionForm({ papers, venues, files }: { papers: PaperOption[]; venues: VenueOption[]; files: FileOption[] }) {
  const [paperId, setPaperId] = useState(papers[0]?.id ?? "");
  const [submissionType, setSubmissionType] = useState("FORUM");
  const filteredVenues = useMemo(() => {
    const matched = venues.filter((venue) => venue.type === submissionType);
    return matched.length ? matched : venues;
  }, [venues, submissionType]);
  const statusOptions = submissionType === "JOURNAL" ? journalSubmissionStatusLabels : forumSubmissionStatusLabels;
  const selectedVenue = filteredVenues[0];
  const isJournal = submissionType === "JOURNAL";
  const paperFiles = files.filter((file) => !file.relatedPaperId || file.relatedPaperId === paperId);

  return (
    <form action={createSubmission} className="panel grid gap-5 p-5">
      <div className="rounded-lg border border-line bg-slate-50 p-4">
        <div className="mb-3 text-sm font-semibold text-ink">投稿类型</div>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(venueTypeLabels).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-700">
              <input
                name="submissionType"
                type="radio"
                value={value}
                checked={submissionType === value}
                onChange={(event) => setSubmissionType(event.target.value)}
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {isJournal ? "期刊投稿保留初审、外审和返修记录。" : "论坛/会议投稿按一次性结果管理，不记录退修和返修流程。"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label>
          <span className="label">投稿论文</span>
          <select name="paperId" required value={paperId} onChange={(event) => setPaperId(event.target.value)} className="field">
            {papers.map((paper) => (
              <option key={paper.id} value={paper.id}>
                {paper.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">投稿对象</span>
          <select name="venueId" required className="field" key={submissionType} defaultValue={selectedVenue?.id ?? ""}>
            {filteredVenues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </label>
        <label><span className="label">投稿日期</span><input name="submissionDate" type="date" className="field" /></label>
        <label><span className="label">截稿日期</span><input name="deadline" type="date" className="field" /></label>
        <label>
          <span className="label">当前状态</span>
          <select name="status" key={submissionType} defaultValue="PREPARING" className="field">
            {Object.entries(statusOptions).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">最终结果</span>
          <select name="result" defaultValue="PENDING" className="field">
            {Object.entries(finalSubmissionResultLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label><span className="label">结果日期</span><input name="resultDate" type="date" className="field" /></label>
        {isJournal ? (
          <>
            <label>
              <span className="label">审稿阶段</span>
              <select name="reviewStage" defaultValue="NOT_STARTED" className="field">
                {Object.entries(reviewStageLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label><span className="label">退修日期</span><input name="revisionDate" type="date" className="field" /></label>
            <label><span className="label">返修截止日期</span><input name="revisionDeadline" type="date" className="field" /></label>
            <label><span className="label">返修提交日期</span><input name="revisionSubmittedDate" type="date" className="field" /></label>
          </>
        ) : null}
        <label><span className="label">录用日期</span><input name="acceptDate" type="date" className="field" /></label>
        <label><span className="label">拒稿日期</span><input name="rejectDate" type="date" className="field" /></label>
      </div>

      <section className="rounded-lg border border-line bg-slate-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">投稿格式与文档</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label><span className="label">格式名称</span><input name="formatLabel" className="field" placeholder="例如 匿名全文格式、期刊投稿格式" /></label>
          <label><span className="label">格式文档链接</span><input name="formatDocumentUrl" type="url" className="field" placeholder="保存对应格式稿件或附件链接" /></label>
          <label><span className="label">字数要求</span><input name="wordLimit" type="number" className="field" /></label>
          <label><span className="label">实际字数</span><input name="actualWordCount" type="number" className="field" /></label>
          <label><span className="label">参考文献格式</span><input name="referenceStyle" className="field" placeholder="例如 GB/T 7714、APA" /></label>
          <label><span className="label">注释格式</span><input name="citationStyle" className="field" /></label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label><span className="label">该论坛 / 期刊要求的格式</span><textarea name="formatRequirementText" rows={4} className="field" placeholder="记录官网或通知里的格式要求、匿名要求、标题摘要关键词要求等" /></label>
          <label><span className="label">文件命名规则 / 格式备注</span><textarea name="fileNamingRule" rows={4} className="field" placeholder="例如 论文题目-匿名版.docx；或记录已经如何处理格式" /></label>
        </div>
        <div className="mt-4">
          <label>
            <span className="label">绑定投稿文件版本</span>
            <select name="submittedFileRecordId" className="field" defaultValue="">
              <option value="">暂不绑定</option>
              {paperFiles.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.fileName} · {fileTypeLabels[file.fileType] ?? file.fileType} · V{file.versionNumber}{file.versionLabel ? ` · ${file.versionLabel}` : ""} · {formatFileSize(file.fileSize)}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs leading-5 text-slate-500">绑定后，投稿记录会引用这个文件版本；替换文件时会生成新版本，不会覆盖历史版本。</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <label><span className="label">投稿系统链接</span><input name="submissionSystemUrl" type="url" className="field" /></label>
        <label><span className="label">实际提交文件链接</span><input name="submittedFileUrl" type="url" className="field" /></label>
        <label><span className="label">投稿回执链接</span><input name="receiptUrl" type="url" className="field" /></label>
      </div>
      <div className="grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-700"><input name="formatChecked" type="checkbox" />是否已检查格式</label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input name="submittedSuccessfully" type="checkbox" />是否已成功提交</label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label><span className="label">投稿材料清单</span><textarea name="submissionMaterials" rows={4} className="field" /></label>
        <label><span className="label">审稿备注</span><textarea name="reviewNotes" rows={4} className="field" /></label>
        <label><span className="label">拒稿原因</span><textarea name="rejectReason" rows={4} className="field" /></label>
        <label><span className="label">下一步计划</span><textarea name="nextAction" rows={4} className="field" /></label>
      </div>
      <div className="flex justify-end">
        <button className="btn-primary">
          保存投稿记录
        </button>
      </div>
    </form>
  );
}
