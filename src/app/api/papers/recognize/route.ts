import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse";
import { recognizePaperText } from "@/lib/document-recognition";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get("file");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file) || !("name" in file)) {
    return NextResponse.json({ error: "请先选择要上传的文件。" }, { status: 400 });
  }

  const uploadedFile = file as { name: string; arrayBuffer: () => Promise<ArrayBuffer> };
  const ext = path.extname(uploadedFile.name).toLowerCase();
  if (![".docx", ".pdf", ".txt", ".md"].includes(ext)) {
    return NextResponse.json({ error: "暂不支持该格式，请上传 docx 或 pdf 文件。" }, { status: 400 });
  }

  const bytes = Buffer.from(await uploadedFile.arrayBuffer());
  const safeName = `${Date.now()}-${uploadedFile.name.replace(/[^\w.\-\u4e00-\u9fa5]+/g, "_")}`;
  const fileUrl = await persistUploadedFile(bytes, safeName);

  try {
    let text = "";
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: bytes });
      text = result.value;
    } else if (ext === ".pdf") {
      const result = await pdfParse(bytes);
      text = result.text;
    } else {
      text = bytes.toString("utf-8");
    }

    const fileType = ext === ".pdf" ? "MASTER_PDF" : "MASTER_WORD";
    const result = recognizePaperText(text, uploadedFile.name, fileType, fileUrl);
    return NextResponse.json({
      ...result,
      warning: [result.warning, process.env.VERCEL ? "Vercel 线上环境已完成识别，但未保存原文件；如需长期下载请接入 Vercel Blob 或对象存储。" : ""]
        .filter(Boolean)
        .join(" ")
    });
  } catch {
    const fileType = ext === ".pdf" ? "MASTER_PDF" : "MASTER_WORD";
    return NextResponse.json({
      title: uploadedFile.name.replace(/\.[^.]+$/, ""),
      masterAbstract: "",
      masterKeywords: "",
      masterWordCount: 0,
      fileName: uploadedFile.name,
      fileType,
      fileUrl,
      warning: `自动识别失败，可手动填写论文信息。${process.env.VERCEL ? " Vercel 线上环境未保存原文件。" : ""}`
    });
  }
}

async function persistUploadedFile(bytes: Buffer, safeName: string) {
  if (process.env.VERCEL) {
    return `vercel-memory://${safeName}`;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const targetPath = path.join(uploadDir, safeName);
  await writeFile(targetPath, bytes);
  return `/uploads/${safeName}`;
}
