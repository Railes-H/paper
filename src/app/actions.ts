"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  FeeStatus,
  JournalLevel,
  PaperStatus,
  ResearchFit,
  ReviewStage,
  SubmissionResult,
  SubmissionStatus,
  VenueType,
  WorthAttending
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile } from "@/lib/file-storage";
import {
  parseBoolean,
  parseDate,
  parseFloatField,
  parseIntField,
  parseOptionalString,
  parseString
} from "@/lib/utils";

type SubmissionUpload = {
  fileName: string;
  fileType: string;
  fileUrl: string;
  downloadUrl?: string;
  storageProvider?: string;
  storagePath?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt?: string;
};

function parseSubmissionUploads(value: FormDataEntryValue | null): SubmissionUpload[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SubmissionUpload =>
      item &&
      typeof item.fileName === "string" &&
      typeof item.fileType === "string" &&
      typeof item.fileUrl === "string"
    );
  } catch {
    return [];
  }
}

function resultForSubmissionStatus(status: string): SubmissionResult {
  if (status === "ACCEPTED") return "ACCEPTED";
  if (status === "REJECTED") return "REJECTED";
  if (status === "REVISION" || status === "REVISED") return "REVISION";
  if (status === "WITHDRAWN") return "WITHDRAWN";
  return "PENDING";
}

export async function createPaper(formData: FormData) {
  const uploadedFileRecordId = parseOptionalString(formData.get("uploadedFileRecordId"));
  const uploadedFileUrl = parseOptionalString(formData.get("uploadedFileUrl"));
  const uploadedFileName = parseOptionalString(formData.get("uploadedFileName"));
  const uploadedFileType = parseOptionalString(formData.get("uploadedFileType"));
  const uploadedDownloadUrl = parseOptionalString(formData.get("uploadedDownloadUrl"));
  const uploadedStorageProvider = parseOptionalString(formData.get("uploadedStorageProvider"));
  const uploadedStoragePath = parseOptionalString(formData.get("uploadedStoragePath"));
  const uploadedMimeType = parseOptionalString(formData.get("uploadedMimeType"));
  const uploadedFileSize = parseIntField(formData.get("uploadedFileSize"));
  const currentVersion = parseOptionalString(formData.get("currentVersion"));
  const paper = await prisma.paper.create({
    data: {
      title: parseString(formData.get("title")),
      researchArea: parseString(formData.get("researchArea")),
      authors: parseString(formData.get("authors")),
      masterAbstract: parseOptionalString(formData.get("masterAbstract")),
      masterKeywords: parseOptionalString(formData.get("masterKeywords")),
      masterWordCount: parseIntField(formData.get("masterWordCount")),
      masterFileUrl: parseOptionalString(formData.get("masterFileUrl")) ?? uploadedFileUrl,
      currentStatus: formData.get("currentStatus") as PaperStatus,
      currentVersion,
      latestUpdateDate: parseDate(formData.get("latestUpdateDate")),
      notes: parseOptionalString(formData.get("notes"))
    }
  });
  if (uploadedFileRecordId) {
    await prisma.fileRecord.updateMany({
      where: { id: uploadedFileRecordId },
      data: {
        relatedPaperId: paper.id,
        versionLabel: currentVersion,
        notes: "自动识别生成的完整版论文文件"
      }
    });
  } else if (uploadedFileUrl && uploadedFileName && uploadedFileType) {
    await prisma.fileRecord.create({
      data: {
        fileName: uploadedFileName,
        fileType: uploadedFileType,
        fileUrl: uploadedFileUrl,
        downloadUrl: uploadedDownloadUrl,
        storageProvider: uploadedStorageProvider ?? "EXTERNAL",
        storagePath: uploadedStoragePath,
        mimeType: uploadedMimeType,
        fileSize: uploadedFileSize,
        relatedPaperId: paper.id,
        versionGroupId: randomUUID(),
        versionNumber: 1,
        versionLabel: currentVersion,
        uploadDate: new Date(),
        isCurrent: true,
        notes: "自动识别生成的完整版论文文件"
      }
    });
  }
  revalidatePath("/papers");
  redirect("/papers");
}

export async function updatePaper(id: string, formData: FormData) {
  await prisma.paper.update({
    where: { id },
    data: {
      title: parseString(formData.get("title")),
      researchArea: parseString(formData.get("researchArea")),
      authors: parseString(formData.get("authors")),
      masterAbstract: parseOptionalString(formData.get("masterAbstract")),
      masterKeywords: parseOptionalString(formData.get("masterKeywords")),
      masterWordCount: parseIntField(formData.get("masterWordCount")),
      masterFileUrl: parseOptionalString(formData.get("masterFileUrl")),
      currentStatus: formData.get("currentStatus") as PaperStatus,
      currentVersion: parseOptionalString(formData.get("currentVersion")),
      latestUpdateDate: parseDate(formData.get("latestUpdateDate")),
      notes: parseOptionalString(formData.get("notes"))
    }
  });
  revalidatePath("/papers");
  redirect(`/papers/${id}`);
}

export async function deletePaper(id: string) {
  await prisma.paper.delete({ where: { id } });
  revalidatePath("/papers");
}

export async function createVenue(formData: FormData) {
  const type = formData.get("type") as VenueType;
  await prisma.venue.create({
    data: {
      name: parseString(formData.get("name")),
      type,
      organizer: parseOptionalString(formData.get("organizer")),
      level: parseOptionalString(formData.get("level")),
      website: parseOptionalString(formData.get("website")),
      submissionUrl: parseOptionalString(formData.get("submissionUrl")),
      researchFit: formData.get("researchFit") as ResearchFit,
      notes: parseOptionalString(formData.get("notes")),
      conferenceInfo:
        type === "CONFERENCE" || type === "FORUM"
          ? {
              create: {
                deadline: parseDate(formData.get("deadline")),
                notificationDate: parseDate(formData.get("notificationDate")),
                conferenceStartDate: parseDate(formData.get("conferenceStartDate")),
                conferenceEndDate: parseDate(formData.get("conferenceEndDate")),
                location: parseOptionalString(formData.get("location")),
                isOnline: parseBoolean(formData.get("isOnline")),
                registrationRequired: parseBoolean(formData.get("registrationRequired")),
                registrationFee: parseFloatField(formData.get("registrationFee")),
                needSelfFunded: parseBoolean(formData.get("needSelfFunded")),
                reimbursable: parseBoolean(formData.get("reimbursable")),
                travelBudget: parseFloatField(formData.get("travelBudget")),
                accommodationBudget: parseFloatField(formData.get("accommodationBudget")),
                totalBudget: parseFloatField(formData.get("totalBudget")),
                worthAttending: formData.get("worthAttending") as WorthAttending,
                feeStatus: formData.get("feeStatus") as FeeStatus,
                callForPapersUrl: parseOptionalString(formData.get("callForPapersUrl"))
              }
            }
          : undefined,
      journalInfo:
        type === "JOURNAL"
          ? {
              create: {
                journalLevel: formData.get("journalLevel") as JournalLevel,
                submissionSystemUrl: parseOptionalString(formData.get("submissionSystemUrl")),
                officialWebsite: parseOptionalString(formData.get("officialWebsite")),
                hasReviewFee: parseBoolean(formData.get("hasReviewFee")),
                reviewFee: parseFloatField(formData.get("reviewFee")),
                hasPublicationFee: parseBoolean(formData.get("hasPublicationFee")),
                publicationFee: parseFloatField(formData.get("publicationFee")),
                feeNotes: parseOptionalString(formData.get("feeNotes"))
              }
            }
          : undefined
      ,
      evaluation: {
        create: {
          academicValue: parseString(formData.get("academicValue")) || "UNKNOWN",
          submissionDifficulty: parseString(formData.get("submissionDifficulty")) || "UNKNOWN",
          costPressure: parseString(formData.get("costPressure")) || "UNKNOWN",
          participationValue: parseString(formData.get("participationValue")) || "UNKNOWN",
          studentFriendly: parseString(formData.get("studentFriendly")) || "UNKNOWN",
          worthSubmittingAgain: parseString(formData.get("worthSubmittingAgain")) || "UNKNOWN",
          networkingValue: parseString(formData.get("networkingValue")) || "UNKNOWN",
          resumeValue: parseString(formData.get("resumeValue")) || "UNKNOWN",
          hasProceedings: parseString(formData.get("hasProceedings")) || "UNKNOWN",
          hasCertificate: parseString(formData.get("hasCertificate")) || "UNKNOWN",
          mustAttendOffline: parseString(formData.get("mustAttendOffline")) || "UNKNOWN",
          mustPresent: parseString(formData.get("mustPresent")) || "UNKNOWN",
          evaluationNotes: parseOptionalString(formData.get("evaluationNotes"))
        }
      }
    }
  });
  revalidatePath("/venues");
  redirect("/venues");
}

export async function updateVenueEvaluation(venueId: string, formData: FormData) {
  await prisma.venueEvaluation.upsert({
    where: { venueId },
    update: {
      academicValue: parseString(formData.get("academicValue")) || "UNKNOWN",
      submissionDifficulty: parseString(formData.get("submissionDifficulty")) || "UNKNOWN",
      costPressure: parseString(formData.get("costPressure")) || "UNKNOWN",
      participationValue: parseString(formData.get("participationValue")) || "UNKNOWN",
      studentFriendly: parseString(formData.get("studentFriendly")) || "UNKNOWN",
      worthSubmittingAgain: parseString(formData.get("worthSubmittingAgain")) || "UNKNOWN",
      networkingValue: parseString(formData.get("networkingValue")) || "UNKNOWN",
      resumeValue: parseString(formData.get("resumeValue")) || "UNKNOWN",
      hasProceedings: parseString(formData.get("hasProceedings")) || "UNKNOWN",
      hasCertificate: parseString(formData.get("hasCertificate")) || "UNKNOWN",
      mustAttendOffline: parseString(formData.get("mustAttendOffline")) || "UNKNOWN",
      mustPresent: parseString(formData.get("mustPresent")) || "UNKNOWN",
      evaluationNotes: parseOptionalString(formData.get("evaluationNotes"))
    },
    create: {
      venueId,
      academicValue: parseString(formData.get("academicValue")) || "UNKNOWN",
      submissionDifficulty: parseString(formData.get("submissionDifficulty")) || "UNKNOWN",
      costPressure: parseString(formData.get("costPressure")) || "UNKNOWN",
      participationValue: parseString(formData.get("participationValue")) || "UNKNOWN",
      studentFriendly: parseString(formData.get("studentFriendly")) || "UNKNOWN",
      worthSubmittingAgain: parseString(formData.get("worthSubmittingAgain")) || "UNKNOWN",
      networkingValue: parseString(formData.get("networkingValue")) || "UNKNOWN",
      resumeValue: parseString(formData.get("resumeValue")) || "UNKNOWN",
      hasProceedings: parseString(formData.get("hasProceedings")) || "UNKNOWN",
      hasCertificate: parseString(formData.get("hasCertificate")) || "UNKNOWN",
      mustAttendOffline: parseString(formData.get("mustAttendOffline")) || "UNKNOWN",
      mustPresent: parseString(formData.get("mustPresent")) || "UNKNOWN",
      evaluationNotes: parseOptionalString(formData.get("evaluationNotes"))
    }
  });
  revalidatePath("/venues");
  revalidatePath(`/venues/${venueId}`);
}

export async function deleteVenue(id: string) {
  await prisma.venue.delete({ where: { id } });
  revalidatePath("/venues");
}

export async function createSubmission(formData: FormData) {
  const paperId = parseString(formData.get("paperId"));
  const venueName = parseString(formData.get("venueName"));
  const submissionType = formData.get("submissionType") as VenueType;
  const status = formData.get("status") as SubmissionStatus;
  const isJournal = submissionType === "JOURNAL";
  const uploadedFiles = parseSubmissionUploads(formData.get("uploadedSubmissionFiles"));
  const primaryFile = uploadedFiles[0];
  const existingVenue = await prisma.venue.findFirst({
    where: { name: venueName, type: submissionType },
    select: { id: true }
  });
  const venue = existingVenue ?? await prisma.venue.create({
    data: {
      name: venueName,
      type: submissionType
    },
    select: { id: true }
  });
  const venueId = venue.id;
  const formatLabel = parseString(formData.get("formatLabel"));
  const paperVersion = await prisma.paperVersion.create({
    data: {
      paperId,
      templateId: null,
      targetVenueId: venueId,
      versionName: formatLabel,
      versionType: submissionType,
      fileUrl: primaryFile?.fileUrl,
      reuseLevel: "MEDIUM"
    }
  });
  const submission = await prisma.submission.create({
    data: {
      paperId,
      paperVersionId: paperVersion.id,
      venueId,
      submissionType,
      submissionDate: parseDate(formData.get("submissionDate")),
      deadline: parseDate(formData.get("deadline")),
      status,
      result: resultForSubmissionStatus(status),
      submissionSystemUrl: parseOptionalString(formData.get("submissionSystemUrl")),
      submittedFileUrl: primaryFile?.fileUrl,
      receiptUrl: parseOptionalString(formData.get("receiptUrl")),
      submissionMaterials: parseOptionalString(formData.get("submissionMaterials")),
      formatChecked: parseBoolean(formData.get("formatChecked")),
      submittedSuccessfully: parseBoolean(formData.get("submittedSuccessfully")),
      reviewStage: isJournal ? (formData.get("reviewStage") as ReviewStage) : "NOT_STARTED",
      reviewNotes: parseOptionalString(formData.get("reviewNotes")),
      rejectReason: parseOptionalString(formData.get("rejectReason")),
      rejectReasonCategory: parseOptionalString(formData.get("rejectReasonCategory")),
      rejectReasonDetail: parseOptionalString(formData.get("rejectReasonDetail")),
      reviewerComments: parseOptionalString(formData.get("reviewerComments")),
      selfReflection: parseOptionalString(formData.get("selfReflection")),
      improvementPlan: parseOptionalString(formData.get("improvementPlan")),
      nextSubmissionStrategy: parseOptionalString(formData.get("nextSubmissionStrategy")),
      targetAfterRejection: parseOptionalString(formData.get("targetAfterRejection")),
      rejectionSeverity: parseString(formData.get("rejectionSeverity")) || "UNKNOWN",
      canReuseVersion: parseString(formData.get("canReuseVersion")) || "UNKNOWN",
      needsMajorRevision: parseString(formData.get("needsMajorRevision")) || "UNKNOWN",
      revisionDate: isJournal ? parseDate(formData.get("revisionDate")) : null,
      revisionDeadline: isJournal ? parseDate(formData.get("revisionDeadline")) : null,
      revisionSubmittedDate: isJournal ? parseDate(formData.get("revisionSubmittedDate")) : null,
      acceptDate: parseDate(formData.get("acceptDate")),
      rejectDate: parseDate(formData.get("rejectDate")),
      nextAction: parseOptionalString(formData.get("nextAction"))
    }
  });
  if (uploadedFiles.length > 0) {
    const fileRecords = uploadedFiles.map((file) => ({
      id: randomUUID(),
      fileName: file.fileName,
      fileType: file.fileType === "SUBMISSION_PDF" ? "SUBMISSION_PDF" : "SUBMISSION_WORD",
      fileUrl: file.fileUrl,
      downloadUrl: file.downloadUrl,
      storageProvider: file.storageProvider ?? "EXTERNAL",
      storagePath: file.storagePath,
      mimeType: file.mimeType,
      fileSize: typeof file.fileSize === "number" ? file.fileSize : null,
      relatedPaperId: paperId,
      relatedPaperVersionId: paperVersion.id,
      relatedSubmissionId: submission.id,
      versionGroupId: randomUUID(),
      versionNumber: 1,
      versionLabel: formatLabel,
      uploadDate: file.uploadedAt ? new Date(file.uploadedAt) : new Date(),
      isCurrent: true,
      notes: "新增投稿记录时上传的投稿文档"
    }));
    await prisma.fileRecord.createMany({ data: fileRecords });
    await prisma.submission.update({
      where: { id: submission.id },
      data: { submittedFileRecordId: fileRecords[0].id }
    });
  }
  revalidatePath("/submissions");
  revalidatePath("/venues");
  revalidatePath("/dashboard");
  revalidatePath("/stats");
  redirect("/submissions");
}

export async function deleteSubmission(id: string) {
  await prisma.submission.delete({ where: { id } });
  revalidatePath("/submissions");
}

export async function updateSubmissionStatus(id: string, status: string) {
  if (!Object.prototype.hasOwnProperty.call({
    PREPARING: true,
    SUBMITTED: true,
    WAITING_RESULT: true,
    INITIAL_REVIEW: true,
    EXTERNAL_REVIEW: true,
    REVISION: true,
    REVISED: true,
    ACCEPTED: true,
    REJECTED: true,
    WITHDRAWN: true,
    ARCHIVED: true
  }, status)) {
    throw new Error("无效的投稿状态");
  }

  await prisma.submission.update({ where: { id }, data: { status, result: resultForSubmissionStatus(status) } });
  revalidatePath("/submissions");
  revalidatePath(`/submissions/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/stats");
}

export async function updateSubmission(id: string, formData: FormData) {
  const current = await prisma.submission.findUnique({ where: { id }, select: { paperVersionId: true } });
  if (!current) throw new Error("投稿记录不存在");

  const paperId = parseString(formData.get("paperId"));
  const venueName = parseString(formData.get("venueName"));
  const submissionType = formData.get("submissionType") as VenueType;
  const status = formData.get("status") as SubmissionStatus;
  const isJournal = submissionType === "JOURNAL";
  const existingVenue = await prisma.venue.findFirst({
    where: { name: venueName, type: submissionType },
    select: { id: true }
  });
  const venue = existingVenue ?? await prisma.venue.create({
    data: { name: venueName, type: submissionType },
    select: { id: true }
  });

  await prisma.$transaction([
    prisma.paperVersion.update({
      where: { id: current.paperVersionId },
      data: {
        paperId,
        targetVenueId: venue.id,
        versionName: parseString(formData.get("formatLabel")),
        versionType: submissionType
      }
    }),
    prisma.submission.update({
      where: { id },
      data: {
        paperId,
        venueId: venue.id,
        submissionType,
        submissionDate: parseDate(formData.get("submissionDate")),
        deadline: parseDate(formData.get("deadline")),
        status,
        result: resultForSubmissionStatus(status),
        submissionSystemUrl: parseOptionalString(formData.get("submissionSystemUrl")),
        receiptUrl: parseOptionalString(formData.get("receiptUrl")),
        submissionMaterials: parseOptionalString(formData.get("submissionMaterials")),
        formatChecked: parseBoolean(formData.get("formatChecked")),
        submittedSuccessfully: parseBoolean(formData.get("submittedSuccessfully")),
        reviewStage: isJournal ? (formData.get("reviewStage") as ReviewStage) : "NOT_STARTED",
        reviewNotes: parseOptionalString(formData.get("reviewNotes")),
        revisionDate: isJournal ? parseDate(formData.get("revisionDate")) : null,
        revisionDeadline: isJournal ? parseDate(formData.get("revisionDeadline")) : null,
        revisionSubmittedDate: isJournal ? parseDate(formData.get("revisionSubmittedDate")) : null,
        acceptDate: parseDate(formData.get("acceptDate")),
        rejectDate: parseDate(formData.get("rejectDate")),
        nextAction: parseOptionalString(formData.get("nextAction"))
      }
    }),
    prisma.fileRecord.updateMany({
      where: { relatedSubmissionId: id },
      data: { relatedPaperId: paperId, relatedPaperVersionId: current.paperVersionId }
    })
  ]);

  revalidatePath("/submissions");
  revalidatePath(`/submissions/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/stats");
  redirect(`/submissions/${id}`);
}

export async function updateRejectionReview(id: string, formData: FormData) {
  await prisma.submission.update({
    where: { id },
    data: {
      rejectReasonCategory: parseOptionalString(formData.get("rejectReasonCategory")),
      rejectReasonDetail: parseOptionalString(formData.get("rejectReasonDetail")),
      reviewerComments: parseOptionalString(formData.get("reviewerComments")),
      selfReflection: parseOptionalString(formData.get("selfReflection")),
      improvementPlan: parseOptionalString(formData.get("improvementPlan")),
      nextSubmissionStrategy: parseOptionalString(formData.get("nextSubmissionStrategy")),
      targetAfterRejection: parseOptionalString(formData.get("targetAfterRejection")),
      rejectionSeverity: parseString(formData.get("rejectionSeverity")) || "UNKNOWN",
      canReuseVersion: parseString(formData.get("canReuseVersion")) || "UNKNOWN",
      needsMajorRevision: parseString(formData.get("needsMajorRevision")) || "UNKNOWN"
    }
  });
  revalidatePath("/submissions");
  revalidatePath(`/submissions/${id}`);
}

export async function createFileRecord(formData: FormData) {
  const uploadedFileUrl = parseOptionalString(formData.get("uploadedFileUrl"));
  await prisma.fileRecord.create({
    data: {
      fileName: parseString(formData.get("fileName")),
      fileType: parseString(formData.get("fileType")),
      fileUrl: uploadedFileUrl ?? parseString(formData.get("fileUrl")),
      downloadUrl: parseOptionalString(formData.get("uploadedDownloadUrl")),
      storageProvider: parseOptionalString(formData.get("uploadedStorageProvider")) ?? "EXTERNAL",
      storagePath: parseOptionalString(formData.get("uploadedStoragePath")),
      mimeType: parseOptionalString(formData.get("uploadedMimeType")),
      fileSize: parseIntField(formData.get("uploadedFileSize")),
      relatedPaperId: parseOptionalString(formData.get("relatedPaperId")),
      relatedPaperVersionId: parseOptionalString(formData.get("relatedPaperVersionId")),
      relatedSubmissionId: parseOptionalString(formData.get("relatedSubmissionId")),
      versionGroupId: randomUUID(),
      versionNumber: parseIntField(formData.get("versionNumber")) ?? 1,
      versionLabel: parseOptionalString(formData.get("versionLabel")),
      uploadDate: parseDate(formData.get("uploadDate")) ?? new Date(),
      isCurrent: true,
      notes: parseOptionalString(formData.get("notes"))
    }
  });
  revalidatePath("/files");
  redirect("/files");
}

export async function updateFileRecord(id: string, formData: FormData) {
  const uploadedFileUrl = parseOptionalString(formData.get("uploadedFileUrl"));
  if (uploadedFileUrl) {
    const current = await prisma.fileRecord.findUnique({ where: { id } });
    if (!current) return;
    const versionGroupId = current.versionGroupId ?? current.id;
    const latest = await prisma.fileRecord.findFirst({
      where: { versionGroupId },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true }
    });
    const nextVersionNumber = (latest?.versionNumber ?? current.versionNumber ?? 1) + 1;
    await prisma.$transaction([
      prisma.fileRecord.updateMany({ where: { versionGroupId }, data: { isCurrent: false } }),
      prisma.fileRecord.update({ where: { id: current.id }, data: { isCurrent: false, versionGroupId } }),
      prisma.fileRecord.create({
        data: {
          fileName: parseString(formData.get("fileName")),
          fileType: parseString(formData.get("fileType")),
          fileUrl: uploadedFileUrl,
          downloadUrl: parseOptionalString(formData.get("uploadedDownloadUrl")),
          storageProvider: parseOptionalString(formData.get("uploadedStorageProvider")) ?? "EXTERNAL",
          storagePath: parseOptionalString(formData.get("uploadedStoragePath")),
          mimeType: parseOptionalString(formData.get("uploadedMimeType")),
          fileSize: parseIntField(formData.get("uploadedFileSize")),
          relatedPaperId: parseOptionalString(formData.get("relatedPaperId")),
          relatedPaperVersionId: parseOptionalString(formData.get("relatedPaperVersionId")),
          relatedSubmissionId: parseOptionalString(formData.get("relatedSubmissionId")),
          sourceFileId: current.id,
          versionGroupId,
          versionNumber: nextVersionNumber,
          versionLabel: parseOptionalString(formData.get("versionLabel")) ?? `V${nextVersionNumber}`,
          uploadDate: new Date(),
          isCurrent: true,
          notes: parseOptionalString(formData.get("notes"))
        }
      })
    ]);
    revalidatePath("/files");
    revalidatePath("/papers");
    revalidatePath("/submissions");
    redirect("/files");
  }

  await prisma.fileRecord.update({
    where: { id },
    data: {
      fileName: parseString(formData.get("fileName")),
      fileType: parseString(formData.get("fileType")),
      fileUrl: parseString(formData.get("fileUrl")),
      downloadUrl: parseOptionalString(formData.get("uploadedDownloadUrl")) ?? parseOptionalString(formData.get("downloadUrl")),
      storageProvider: parseOptionalString(formData.get("uploadedStorageProvider")) ?? parseOptionalString(formData.get("storageProvider")) ?? "EXTERNAL",
      storagePath: parseOptionalString(formData.get("uploadedStoragePath")) ?? parseOptionalString(formData.get("storagePath")),
      mimeType: parseOptionalString(formData.get("uploadedMimeType")) ?? parseOptionalString(formData.get("mimeType")),
      fileSize: parseIntField(formData.get("uploadedFileSize")) ?? parseIntField(formData.get("fileSize")),
      relatedPaperId: parseOptionalString(formData.get("relatedPaperId")),
      relatedPaperVersionId: parseOptionalString(formData.get("relatedPaperVersionId")),
      relatedSubmissionId: parseOptionalString(formData.get("relatedSubmissionId")),
      versionNumber: parseIntField(formData.get("versionNumber")) ?? 1,
      versionLabel: parseOptionalString(formData.get("versionLabel")),
      uploadDate: parseDate(formData.get("uploadDate")),
      notes: parseOptionalString(formData.get("notes"))
    }
  });
  revalidatePath("/files");
  redirect("/files");
}

export async function deleteFileRecord(id: string) {
  const file = await prisma.fileRecord.findUnique({ where: { id } });
  if (!file) return;
  await deleteStoredFile(file.fileUrl, file.storageProvider, file.storagePath).catch(() => undefined);
  await prisma.fileRecord.delete({ where: { id } });
  if (file.isCurrent && file.versionGroupId) {
    const previous = await prisma.fileRecord.findFirst({
      where: { versionGroupId: file.versionGroupId },
      orderBy: { versionNumber: "desc" }
    });
    if (previous) {
      await prisma.fileRecord.update({ where: { id: previous.id }, data: { isCurrent: true } });
    }
  }
  revalidatePath("/files");
  revalidatePath("/papers");
  revalidatePath("/submissions");
}

export async function markSuggestionDone(id: string, formData: FormData) {
  await prisma.suggestion.upsert({
    where: { id },
    update: { isDone: true },
    create: {
      id,
      suggestionTitle: parseString(formData.get("suggestionTitle")),
      suggestionType: parseString(formData.get("suggestionType")),
      suggestionContent: parseString(formData.get("suggestionContent")),
      priority: parseString(formData.get("priority")) || "MEDIUM",
      relatedPaperId: parseOptionalString(formData.get("relatedPaperId")),
      relatedSubmissionId: parseOptionalString(formData.get("relatedSubmissionId")),
      relatedVenueId: parseOptionalString(formData.get("relatedVenueId")),
      isDone: true
    }
  });
  revalidatePath("/suggestions");
  revalidatePath("/dashboard");
}
