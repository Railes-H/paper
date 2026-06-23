"use client";

import { useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { createSubmission } from "@/app/actions";
import {
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

type UploadedSubmissionFile = {
  fileName: string;
  fileType: string;
  fileUrl: string;
  downloadUrl?: string;
  storageProvider?: string;
  storagePath?: string;
  mimeType?: string;
  fileSize: number;
  uploadedAt: string;
};

export function SubmissionForm({ papers }: { papers: PaperOption[] }) {
  const [paperId, setPaperId] = useState(papers[0]?.id ?? "");
  const [submissionType, setSubmissionType] = useState("FORUM");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedSubmissionFile[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);
  const statusOptions = submissionType === "JOURNAL" ? journalSubmissionStatusLabels : forumSubmissionStatusLabels;
  const isJournal = submissionType === "JOURNAL";
  const isUploading = uploadingCount > 0;

  const uploadDocuments = async (files: FileList | null) => {
    if (!files?.length) return;
    const selectedFiles = Array.from(files);
    setUploadError("");
    setUploadingCount(selectedFiles.length);

    const results = await Promise.all(selectedFiles.map(async (file) => {
      const body = new FormData();
      body.append("file", file);
      body.append("usage", "submission");
      try {
        const response = await fetch("/api/files/upload", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? `${file.name} 上传失败`);
        return { file: data as UploadedSubmissionFile, error: "" };
      } catch (error) {
        return { file: null, error: error instanceof Error ? `${file.name}：${error.message}` : `${file.name} 上传失败` };
      } finally {
        setUploadingCount((count) => Math.max(0, count - 1));
      }
    }));

    const successfulFiles = results.flatMap((result) => result.file ? [result.file] : []);
    const errors = results.map((result) => result.error).filter(Boolean);
    setUploadedFiles((current) => [...current, ...successfulFiles]);
    setUploadError(errors.join("；"));
  };

  return (
    <form action={createSubmission} className="panel grid gap-5 p-5">
      <input type="hidden" name="uploadedSubmissionFiles" value={JSON.stringify(uploadedFiles)} />
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

      <section className="rounded-lg border border-line bg-slate-50 p-4">
        <h2 className="mb-1 text-sm font-semibold text-ink">投稿对象与基本日期</h2>
        <p className="mb-4 text-xs leading-5 text-slate-500">无需提前新增投稿对象。保存时系统会按名称和类型自动匹配，找不到时创建最简投稿对象。</p>
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="label">投稿对象名称</span><input name="venueName" required className="field" placeholder="例如 中国传播学论坛、《新闻与传播研究》" /></label>
          <label><span className="label">格式名称</span><input name="formatLabel" required className="field" placeholder="例如 匿名全文格式、期刊投稿格式" /></label>
          <label><span className="label">截稿日期</span><input name="deadline" type="date" className="field" /></label>
          <label><span className="label">录稿日期</span><input name="acceptDate" type="date" className="field" /></label>
        </div>
      </section>

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
        <label><span className="label">投稿日期</span><input name="submissionDate" type="date" className="field" /></label>
        <label>
          <span className="label">当前状态</span>
          <select name="status" key={submissionType} defaultValue="PREPARING" className="field">
            {Object.entries(statusOptions).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
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
        <label><span className="label">拒稿日期</span><input name="rejectDate" type="date" className="field" /></label>
      </div>

      <section className="rounded-lg border border-line bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">上传投稿文档</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">支持一次选择或分多次添加多个 PDF、DOC、DOCX 文件，系统会自动识别并保留原文件名。</p>
          </div>
          <label className={`btn-secondary cursor-pointer ${isUploading ? "pointer-events-none opacity-60" : ""}`}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isUploading ? `正在上传 ${uploadingCount} 个文件` : "选择投稿文档"}
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={isUploading}
              onChange={(event) => {
                void uploadDocuments(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>

        {uploadError ? <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div> : null}

        <div className="mt-4 grid gap-2">
          {uploadedFiles.map((file, index) => (
            <div key={`${file.fileUrl}-${index}`} className="flex items-center gap-3 rounded-md border border-line bg-white px-3 py-2.5">
              <FileText className="h-5 w-5 shrink-0 text-sky" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{file.fileName}</div>
                <div className="mt-0.5 text-xs text-slate-500">{file.mimeType || file.fileType} · {formatFileSize(file.fileSize)}</div>
              </div>
              <button
                type="button"
                className="btn-secondary h-8 w-8 px-0"
                title="从本次投稿中移除"
                onClick={() => setUploadedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!isUploading && uploadedFiles.length === 0 ? <div className="rounded-md border border-dashed border-line bg-white px-3 py-5 text-center text-sm text-slate-500">尚未上传投稿文档</div> : null}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <label><span className="label">投稿系统链接</span><input name="submissionSystemUrl" type="url" className="field" /></label>
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
        <button className="btn-primary" disabled={isUploading}>
          保存投稿记录
        </button>
      </div>
    </form>
  );
}
