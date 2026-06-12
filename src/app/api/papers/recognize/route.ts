import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse";
import { recognizePaperText } from "@/lib/document-recognition";
import { getUploadValidation, inferPaperFileType, storeUploadedFile } from "@/lib/file-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请先选择要上传的文件。" }, { status: 400 });
  }

  const uploadedFile = file;
  const ext = path.extname(uploadedFile.name).toLowerCase();
  const validationError = getUploadValidation(uploadedFile.name, uploadedFile.type ?? "", uploadedFile.size ?? 0);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const bytes = Buffer.from(await uploadedFile.arrayBuffer());
  let storedFile;
  try {
    storedFile = await storeUploadedFile(uploadedFile, bytes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "文件上传失败，请稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const fileType = inferPaperFileType(uploadedFile.name);
  let fileRecord;
  try {
    fileRecord = await prisma.fileRecord.create({
      data: {
        fileName: storedFile.fileName,
        fileType,
        fileUrl: storedFile.fileUrl,
        downloadUrl: storedFile.downloadUrl,
        storageProvider: storedFile.storageProvider,
        storagePath: storedFile.storagePath,
        mimeType: storedFile.mimeType,
        fileSize: storedFile.fileSize,
        versionGroupId: randomUUID(),
        versionNumber: 1,
        uploadDate: new Date(),
        isCurrent: true,
        notes: "新增论文页上传的完整版论文文件，等待绑定论文"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "文件已上传，但文件记录保存失败。";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    let text = "";
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: bytes });
      text = result.value;
    } else if (ext === ".pdf") {
      const result = await pdfParse(bytes);
      text = result.text;
    }

    const result = recognizePaperText(text, uploadedFile.name, fileType, storedFile.fileUrl);
    return NextResponse.json({
      ...result,
      ...storedFile,
      fileRecordId: fileRecord.id,
      fileType,
      warning: [result.warning, ext === ".doc" ? "DOC 老格式已持久保存，但无法稳定自动识别正文，请手动补充信息。" : ""]
        .filter(Boolean)
        .join(" ")
    });
  } catch (error) {
    await prisma.fileRecord.update({
      where: { id: fileRecord.id },
      data: {
        notes: "新增论文页上传的完整版论文文件，自动识别失败，等待手动补充并绑定论文"
      }
    });
    return NextResponse.json({
      title: uploadedFile.name.replace(/\.[^.]+$/, ""),
      masterAbstract: "",
      masterKeywords: "",
      masterWordCount: 0,
      ...storedFile,
      fileRecordId: fileRecord.id,
      fileType,
      warning: error instanceof Error ? `自动识别或上传失败：${error.message}` : "自动识别失败，可手动填写论文信息。"
    });
  }
}
