"use server";

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
import {
  parseBoolean,
  parseDate,
  parseFloatField,
  parseIntField,
  parseOptionalString,
  parseString
} from "@/lib/utils";

export async function createPaper(formData: FormData) {
  const uploadedFileUrl = parseOptionalString(formData.get("uploadedFileUrl"));
  const uploadedFileName = parseOptionalString(formData.get("uploadedFileName"));
  const uploadedFileType = parseOptionalString(formData.get("uploadedFileType"));
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
  if (uploadedFileUrl && uploadedFileName && uploadedFileType) {
    await prisma.fileRecord.create({
      data: {
        fileName: uploadedFileName,
        fileType: uploadedFileType,
        fileUrl: uploadedFileUrl,
        relatedPaperId: paper.id,
        versionLabel: currentVersion,
        uploadDate: new Date(),
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
  const venueId = parseString(formData.get("venueId"));
  const submissionType = formData.get("submissionType") as VenueType;
  const isJournal = submissionType === "JOURNAL";
  const submittedFileUrl = parseOptionalString(formData.get("submittedFileUrl"));
  const formatDocumentUrl = parseOptionalString(formData.get("formatDocumentUrl"));
  const venue = await prisma.venue.findUnique({ where: { id: venueId }, select: { name: true } });
  const formatLabel = parseOptionalString(formData.get("formatLabel")) ?? `${venue?.name ?? "投稿对象"}格式`;
  const paperVersion = await prisma.paperVersion.create({
    data: {
      paperId,
      templateId: null,
      targetVenueId: venueId,
      versionName: formatLabel,
      versionType: submissionType,
      fileUrl: formatDocumentUrl ?? submittedFileUrl,
      wordLimit: parseIntField(formData.get("wordLimit")),
      actualWordCount: parseIntField(formData.get("actualWordCount")),
      referenceStyle: parseOptionalString(formData.get("referenceStyle")),
      citationStyle: parseOptionalString(formData.get("citationStyle")),
      fileNamingRule: parseOptionalString(formData.get("fileNamingRule")),
      submissionMaterials: parseOptionalString(formData.get("submissionMaterials")),
      formatRequirementText: parseOptionalString(formData.get("formatRequirementText")),
      formatNotes: parseOptionalString(formData.get("fileNamingRule")),
      reuseLevel: "MEDIUM"
    }
  });
  await prisma.submission.create({
    data: {
      paperId,
      paperVersionId: paperVersion.id,
      venueId,
      submissionType,
      submissionDate: parseDate(formData.get("submissionDate")),
      deadline: parseDate(formData.get("deadline")),
      status: formData.get("status") as SubmissionStatus,
      result: formData.get("result") as SubmissionResult,
      resultDate: parseDate(formData.get("resultDate")),
      submissionSystemUrl: parseOptionalString(formData.get("submissionSystemUrl")),
      submittedFileUrl: submittedFileUrl ?? formatDocumentUrl,
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
  revalidatePath("/submissions");
  redirect("/submissions");
}

export async function deleteSubmission(id: string) {
  await prisma.submission.delete({ where: { id } });
  revalidatePath("/submissions");
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
  await prisma.fileRecord.create({
    data: {
      fileName: parseString(formData.get("fileName")),
      fileType: parseString(formData.get("fileType")),
      fileUrl: parseString(formData.get("fileUrl")),
      relatedPaperId: parseOptionalString(formData.get("relatedPaperId")),
      relatedPaperVersionId: parseOptionalString(formData.get("relatedPaperVersionId")),
      relatedSubmissionId: parseOptionalString(formData.get("relatedSubmissionId")),
      versionLabel: parseOptionalString(formData.get("versionLabel")),
      uploadDate: parseDate(formData.get("uploadDate")),
      notes: parseOptionalString(formData.get("notes"))
    }
  });
  revalidatePath("/files");
  redirect("/files");
}

export async function updateFileRecord(id: string, formData: FormData) {
  await prisma.fileRecord.update({
    where: { id },
    data: {
      fileName: parseString(formData.get("fileName")),
      fileType: parseString(formData.get("fileType")),
      fileUrl: parseString(formData.get("fileUrl")),
      relatedPaperId: parseOptionalString(formData.get("relatedPaperId")),
      relatedPaperVersionId: parseOptionalString(formData.get("relatedPaperVersionId")),
      relatedSubmissionId: parseOptionalString(formData.get("relatedSubmissionId")),
      versionLabel: parseOptionalString(formData.get("versionLabel")),
      uploadDate: parseDate(formData.get("uploadDate")),
      notes: parseOptionalString(formData.get("notes"))
    }
  });
  revalidatePath("/files");
  redirect("/files");
}

export async function deleteFileRecord(id: string) {
  await prisma.fileRecord.delete({ where: { id } });
  revalidatePath("/files");
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
