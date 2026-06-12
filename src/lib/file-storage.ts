import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { formatFileSize } from "@/lib/utils";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream"
]);

const mimeByExtension: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

export type StoredFile = {
  fileName: string;
  fileUrl: string;
  downloadUrl: string;
  storageProvider: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
};

export function getUploadValidation(fileName: string, mimeType: string, fileSize: number) {
  const ext = path.extname(fileName).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    return "暂不支持该格式，请上传 PDF、DOC 或 DOCX 文件。";
  }
  if (mimeType && !allowedMimeTypes.has(mimeType)) {
    return "文件类型校验失败，请上传 PDF、DOC 或 DOCX 文件。";
  }
  if (fileSize > MAX_UPLOAD_BYTES) {
    return `文件过大，请上传 ${formatFileSize(MAX_UPLOAD_BYTES)} 以内的文件。`;
  }
  return "";
}

export function inferMimeType(fileName: string, mimeType?: string) {
  const ext = path.extname(fileName).toLowerCase();
  return mimeType && mimeType !== "application/octet-stream" ? mimeType : mimeByExtension[ext] ?? "application/octet-stream";
}

export function inferPaperFileType(fileName: string, fallback = "MASTER_WORD") {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return "MASTER_PDF";
  return fallback;
}

export function sanitizeFileName(fileName: string) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  const safeBase = base
    .normalize("NFKC")
    .replace(/[^\w\-\u4e00-\u9fa5]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 90);
  return `${safeBase || "paper-file"}${ext.toLowerCase()}`;
}

export async function storeUploadedFile(file: File, bytes?: Buffer): Promise<StoredFile> {
  const contentType = inferMimeType(file.name, file.type);

  if (process.env.VERCEL || process.env.BLOB_STORE_ID) {
    const { put } = await importBlobSdk();
    const blob = await put(file.name, file, {
      access: "private",
      addRandomSuffix: true
    });
    return {
      fileName: file.name,
      fileUrl: blob.url,
      downloadUrl: blob.downloadUrl,
      storageProvider: "VERCEL_BLOB",
      storagePath: blob.pathname,
      mimeType: blob.contentType || contentType,
      fileSize: file.size ?? bytes?.byteLength ?? 0
    };
  }

  const safeName = sanitizeFileName(file.name);
  const fileBytes = bytes ?? Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const localName = `${Date.now()}-${safeName}`;
  const targetPath = path.join(uploadDir, localName);
  await writeFile(targetPath, fileBytes);
  return {
    fileName: file.name,
    fileUrl: `/uploads/${localName}`,
    downloadUrl: `/uploads/${localName}`,
    storageProvider: "LOCAL_PUBLIC",
    storagePath: `public/uploads/${localName}`,
    mimeType: contentType,
    fileSize: file.size ?? fileBytes.byteLength
  };
}

export async function deleteStoredFile(fileUrl?: string | null, storageProvider?: string | null, storagePath?: string | null) {
  if (storageProvider !== "VERCEL_BLOB") return;
  const { del } = await importBlobSdk();
  await del(storagePath || fileUrl || "");
}

async function importBlobSdk() {
  return import("@vercel/blob");
}
