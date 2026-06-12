import { NextRequest, NextResponse } from "next/server";
import {
  getUploadValidation,
  inferPaperFileType,
  storeUploadedFile
} from "@/lib/file-storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请先选择要上传的文件。" }, { status: 400 });
  }

  const uploadedFile = file;
  const fileSize = uploadedFile.size ?? 0;
  const validationError = getUploadValidation(uploadedFile.name, uploadedFile.type ?? "", fileSize);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await uploadedFile.arrayBuffer());
    const storedFile = await storeUploadedFile(uploadedFile, bytes);
    return NextResponse.json({
      ...storedFile,
      fileType: inferPaperFileType(uploadedFile.name),
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "文件上传失败，请稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
