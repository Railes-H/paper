"use client";

import { FileRecord, Paper, PaperVersion, Submission, Venue } from "@prisma/client";
import { Download, ExternalLink, RotateCcw, Upload } from "lucide-react";
import { useState } from "react";
import { createFileRecord, updateFileRecord } from "@/app/actions";
import { enumOptions, fileTypeLabels } from "@/lib/labels";
import { formatFileSize, toDateInputValue } from "@/lib/utils";

type SubmissionWithRelations = Submission & { paper: Paper; venue: Venue };

type UploadResult = {
  fileName: string;
  fileType: string;
  fileUrl: string;
  downloadUrl: string;
  storageProvider: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
};

export function FileForm({
  file,
  papers,
  versions,
  submissions,
  defaultPaperId,
  defaultSubmissionId
}: {
  file?: FileRecord;
  papers: Paper[];
  versions: PaperVersion[];
  submissions: SubmissionWithRelations[];
  defaultPaperId?: string;
  defaultSubmissionId?: string;
}) {
  const action = file ? updateFileRecord.bind(null, file.id) : createFileRecord;
  const [upload, setUpload] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(file?.fileName ?? "");
  const [fileType, setFileType] = useState(file?.fileType ?? "OTHER");
  const [manualFileUrl, setManualFileUrl] = useState(file?.fileUrl ?? "");
  const currentUrl = upload?.fileUrl ?? manualFileUrl;
  const currentDownloadUrl = upload?.downloadUrl ?? file?.downloadUrl ?? file?.fileUrl ?? "";

  const uploadFile = async (selectedFile?: File) => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError("");
    const body = new FormData();
    body.append("file", selectedFile);
    try {
      const response = await fetch("/api/files/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        setUploadError(data.error ?? "上传失败，请稍后重试。");
        return;
      }
      setUpload(data);
      setFileName(data.fileName ?? selectedFile.name);
      setFileType(data.fileType ?? inferFileType(selectedFile.name));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form action={action} className="panel grid gap-5 p-5">
      <input type="hidden" name="uploadedFileUrl" value={upload?.fileUrl ?? ""} />
      <input type="hidden" name="uploadedDownloadUrl" value={upload?.downloadUrl ?? file?.downloadUrl ?? ""} />
      <input type="hidden" name="uploadedStorageProvider" value={upload?.storageProvider ?? file?.storageProvider ?? ""} />
      <input type="hidden" name="uploadedStoragePath" value={upload?.storagePath ?? file?.storagePath ?? ""} />
      <input type="hidden" name="uploadedMimeType" value={upload?.mimeType ?? file?.mimeType ?? ""} />
      <input type="hidden" name="uploadedFileSize" value={upload?.fileSize ?? file?.fileSize ?? ""} />
      <input type="hidden" name="downloadUrl" value={file?.downloadUrl ?? ""} />
      <input type="hidden" name="storageProvider" value={file?.storageProvider ?? ""} />
      <input type="hidden" name="storagePath" value={file?.storagePath ?? ""} />
      <input type="hidden" name="mimeType" value={file?.mimeType ?? ""} />
      <input type="hidden" name="fileSize" value={file?.fileSize ?? ""} />
      <input type="hidden" name="versionNumber" value={file?.versionNumber ?? 1} />

      <section className="rounded-md border-2 border-line bg-yellow-50/70 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-black text-ink">{file ? "替换文件" : "上传文件"}</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {file ? "选择新文件会创建新的文件版本，旧版本会保留在历史记录中。" : "文件会上传到持久化对象存储，数据库只保存元信息和 URL。"}
            </p>
          </div>
          <label className="btn-secondary cursor-pointer">
            {isUploading ? null : file ? <RotateCcw className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            {isUploading ? "上传中..." : file ? "选择替换文件" : "选择文件上传"}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" disabled={isUploading} onChange={(event) => uploadFile(event.target.files?.[0])} />
          </label>
        </div>
        {uploadError ? <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div> : null}
        {(upload || file) ? (
          <div className="mt-3 grid gap-3 rounded-md bg-white/90 p-3 text-sm md:grid-cols-4">
            <Meta label="文件名" value={upload?.fileName ?? file?.fileName ?? "-"} />
            <Meta label="大小" value={formatFileSize(upload?.fileSize ?? file?.fileSize)} />
            <Meta label="存储" value={upload?.storageProvider ?? file?.storageProvider ?? "EXTERNAL"} />
            <Meta label="当前版本" value={`V${file?.versionNumber ?? 1}${file?.isCurrent === false ? " · 历史" : ""}`} />
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <label>
          <span className="label">文件名</span>
          <input name="fileName" required value={fileName} onChange={(event) => setFileName(event.target.value)} className="field" />
        </label>
        <label>
          <span className="label">文件类型</span>
          <select name="fileType" value={fileType} onChange={(event) => setFileType(event.target.value)} className="field">
            {enumOptions(fileTypeLabels).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span className="label">版本号或说明</span>
          <input name="versionLabel" defaultValue={file?.versionLabel ?? ""} className="field" placeholder="例如 V1、V2、终稿、匿名版、返修版" />
        </label>
        <label className="md:col-span-2">
          <span className="label">文件 URL</span>
          <input name="fileUrl" required={!upload} value={currentUrl} onChange={(event) => setManualFileUrl(event.target.value)} className="field" placeholder="上传文件后自动填入，也可填写外部链接" readOnly={Boolean(upload || file?.storageProvider === "VERCEL_BLOB")} />
        </label>
        <label>
          <span className="label">日期</span>
          <input name="uploadDate" type="date" defaultValue={toDateInputValue(file?.uploadDate ?? new Date())} className="field" />
        </label>
        <label>
          <span className="label">关联论文</span>
          <select name="relatedPaperId" defaultValue={file?.relatedPaperId ?? defaultPaperId ?? ""} className="field"><option value="">不关联</option>{papers.map((paper) => <option key={paper.id} value={paper.id}>{paper.title}</option>)}</select>
        </label>
        <label>
          <span className="label">关联投稿格式</span>
          <select name="relatedPaperVersionId" defaultValue={file?.relatedPaperVersionId ?? ""} className="field"><option value="">不关联</option>{versions.map((version) => <option key={version.id} value={version.id}>{version.versionName}</option>)}</select>
        </label>
        <label>
          <span className="label">关联投稿记录</span>
          <select name="relatedSubmissionId" defaultValue={file?.relatedSubmissionId ?? defaultSubmissionId ?? ""} className="field"><option value="">不关联</option>{submissions.map((item) => <option key={item.id} value={item.id}>{item.paper.title} - {item.venue.name}</option>)}</select>
        </label>
      </div>
      <label><span className="label">备注</span><textarea name="notes" rows={3} defaultValue={file?.notes ?? ""} className="field" /></label>
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {currentUrl ? <a className="btn-secondary" href={currentUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />查看</a> : null}
          {currentDownloadUrl ? <a className="btn-secondary" href={currentDownloadUrl}><Download className="h-4 w-4" />下载</a> : null}
        </div>
        <button className="btn-primary">{file && upload ? "保存为新版本" : "保存文件记录"}</button>
      </div>
    </form>
  );
}

function inferFileType(fileName: string) {
  return fileName.toLowerCase().endsWith(".pdf") ? "MASTER_PDF" : "MASTER_WORD";
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-muted">{label}</div>
      <div className="mt-1 break-all font-semibold text-ink">{value}</div>
    </div>
  );
}
