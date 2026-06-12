PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS "Reminder";
DROP TABLE IF EXISTS "Suggestion";
DROP TABLE IF EXISTS "FileRecord";
DROP TABLE IF EXISTS "Submission";
DROP TABLE IF EXISTS "PaperVersion";
DROP TABLE IF EXISTS "FormatTemplate";
DROP TABLE IF EXISTS "VenueEvaluation";
DROP TABLE IF EXISTS "ConferenceInfo";
DROP TABLE IF EXISTS "JournalInfo";
DROP TABLE IF EXISTS "Venue";
DROP TABLE IF EXISTS "Paper";

CREATE TABLE "Paper" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "researchArea" TEXT NOT NULL,
  "authors" TEXT NOT NULL,
  "masterAbstract" TEXT,
  "masterKeywords" TEXT,
  "masterWordCount" INTEGER,
  "masterFileUrl" TEXT,
  "currentStatus" TEXT NOT NULL DEFAULT 'WRITING',
  "currentVersion" TEXT,
  "latestUpdateDate" DATETIME,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Venue" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "organizer" TEXT,
  "level" TEXT,
  "website" TEXT,
  "submissionUrl" TEXT,
  "researchFit" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ConferenceInfo" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "venueId" TEXT NOT NULL,
  "deadline" DATETIME,
  "notificationDate" DATETIME,
  "conferenceStartDate" DATETIME,
  "conferenceEndDate" DATETIME,
  "location" TEXT,
  "isOnline" BOOLEAN NOT NULL DEFAULT 0,
  "registrationRequired" BOOLEAN NOT NULL DEFAULT 0,
  "registrationFee" REAL,
  "needSelfFunded" BOOLEAN NOT NULL DEFAULT 0,
  "reimbursable" BOOLEAN NOT NULL DEFAULT 0,
  "travelBudget" REAL,
  "accommodationBudget" REAL,
  "totalBudget" REAL,
  "worthAttending" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "feeStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "callForPapersUrl" TEXT,
  "notes" TEXT,
  CONSTRAINT "ConferenceInfo_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ConferenceInfo_venueId_key" ON "ConferenceInfo"("venueId");

CREATE TABLE "JournalInfo" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "venueId" TEXT NOT NULL,
  "journalLevel" TEXT NOT NULL DEFAULT 'OTHER',
  "submissionSystemUrl" TEXT,
  "officialWebsite" TEXT,
  "hasReviewFee" BOOLEAN NOT NULL DEFAULT 0,
  "reviewFee" REAL,
  "hasPublicationFee" BOOLEAN NOT NULL DEFAULT 0,
  "publicationFee" REAL,
  "feeNotes" TEXT,
  "notes" TEXT,
  CONSTRAINT "JournalInfo_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "JournalInfo_venueId_key" ON "JournalInfo"("venueId");

CREATE TABLE "VenueEvaluation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "venueId" TEXT NOT NULL,
  "academicValue" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "submissionDifficulty" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "costPressure" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "participationValue" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "studentFriendly" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "worthSubmittingAgain" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "networkingValue" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "resumeValue" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "hasProceedings" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "hasCertificate" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "mustAttendOffline" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "mustPresent" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "evaluationNotes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VenueEvaluation_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "VenueEvaluation_venueId_key" ON "VenueEvaluation"("venueId");

CREATE TABLE "FormatTemplate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "venueId" TEXT,
  "templateName" TEXT NOT NULL,
  "venueType" TEXT NOT NULL,
  "wordLimit" INTEGER,
  "abstractRequirement" TEXT,
  "keywordRequirement" TEXT,
  "referenceStyle" TEXT,
  "citationStyle" TEXT,
  "anonymousRequirement" BOOLEAN NOT NULL DEFAULT 0,
  "authorInfoRequirement" BOOLEAN NOT NULL DEFAULT 0,
  "fundingRequirement" BOOLEAN NOT NULL DEFAULT 0,
  "englishTitleRequirement" BOOLEAN NOT NULL DEFAULT 0,
  "englishAbstractRequirement" BOOLEAN NOT NULL DEFAULT 0,
  "englishKeywordsRequirement" BOOLEAN NOT NULL DEFAULT 0,
  "plagiarismReportRequirement" BOOLEAN NOT NULL DEFAULT 0,
  "fileNamingRule" TEXT,
  "submissionMaterials" TEXT,
  "formatRequirementText" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FormatTemplate_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "PaperVersion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "paperId" TEXT NOT NULL,
  "templateId" TEXT,
  "versionName" TEXT NOT NULL,
  "versionType" TEXT NOT NULL,
  "targetVenueId" TEXT,
  "fileUrl" TEXT,
  "wordLimit" INTEGER,
  "actualWordCount" INTEGER,
  "abstractWordLimit" INTEGER,
  "keywordRequirement" TEXT,
  "referenceStyle" TEXT,
  "citationStyle" TEXT,
  "isAnonymous" BOOLEAN NOT NULL DEFAULT 0,
  "needsAuthorBio" BOOLEAN NOT NULL DEFAULT 0,
  "needsFundingInfo" BOOLEAN NOT NULL DEFAULT 0,
  "needsEnglishTitle" BOOLEAN NOT NULL DEFAULT 0,
  "needsEnglishAbstract" BOOLEAN NOT NULL DEFAULT 0,
  "needsEnglishKeywords" BOOLEAN NOT NULL DEFAULT 0,
  "needsPlagiarismReport" BOOLEAN NOT NULL DEFAULT 0,
  "fileNamingRule" TEXT,
  "submissionMaterials" TEXT,
  "formatRequirementText" TEXT,
  "formatNotes" TEXT,
  "reuseLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaperVersion_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PaperVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormatTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PaperVersion_targetVenueId_fkey" FOREIGN KEY ("targetVenueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Submission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "paperId" TEXT NOT NULL,
  "paperVersionId" TEXT NOT NULL,
  "venueId" TEXT NOT NULL,
  "submissionType" TEXT NOT NULL,
  "submissionDate" DATETIME,
  "deadline" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'PREPARING',
  "result" TEXT NOT NULL DEFAULT 'PENDING',
  "resultDate" DATETIME,
  "submissionSystemUrl" TEXT,
  "submittedFileUrl" TEXT,
  "submittedFileRecordId" TEXT,
  "receiptUrl" TEXT,
  "submissionMaterials" TEXT,
  "formatChecked" BOOLEAN NOT NULL DEFAULT 0,
  "submittedSuccessfully" BOOLEAN NOT NULL DEFAULT 0,
  "reviewStage" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "reviewNotes" TEXT,
  "rejectReason" TEXT,
  "rejectReasonCategory" TEXT,
  "rejectReasonDetail" TEXT,
  "reviewerComments" TEXT,
  "selfReflection" TEXT,
  "improvementPlan" TEXT,
  "nextSubmissionStrategy" TEXT,
  "targetAfterRejection" TEXT,
  "rejectionSeverity" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "canReuseVersion" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "needsMajorRevision" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "revisionDate" DATETIME,
  "revisionDeadline" DATETIME,
  "revisionSubmittedDate" DATETIME,
  "acceptDate" DATETIME,
  "rejectDate" DATETIME,
  "nextAction" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Submission_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Submission_paperVersionId_fkey" FOREIGN KEY ("paperVersionId") REFERENCES "PaperVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Submission_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Submission_submittedFileRecordId_fkey" FOREIGN KEY ("submittedFileRecordId") REFERENCES "FileRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Reminder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submissionId" TEXT,
  "reminderType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "reminderDate" DATETIME NOT NULL,
  "isDone" BOOLEAN NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reminder_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "FileRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "downloadUrl" TEXT,
  "storageProvider" TEXT NOT NULL DEFAULT 'EXTERNAL',
  "storagePath" TEXT,
  "mimeType" TEXT,
  "fileSize" INTEGER,
  "relatedPaperId" TEXT,
  "relatedPaperVersionId" TEXT,
  "relatedSubmissionId" TEXT,
  "sourceFileId" TEXT,
  "versionGroupId" TEXT,
  "versionNumber" INTEGER NOT NULL DEFAULT 1,
  "versionLabel" TEXT,
  "uploadDate" DATETIME,
  "isCurrent" BOOLEAN NOT NULL DEFAULT 1,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FileRecord_relatedPaperId_fkey" FOREIGN KEY ("relatedPaperId") REFERENCES "Paper" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "FileRecord_relatedPaperVersionId_fkey" FOREIGN KEY ("relatedPaperVersionId") REFERENCES "PaperVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "FileRecord_relatedSubmissionId_fkey" FOREIGN KEY ("relatedSubmissionId") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "FileRecord_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "FileRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Suggestion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "suggestionTitle" TEXT NOT NULL,
  "suggestionType" TEXT NOT NULL,
  "suggestionContent" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "relatedPaperId" TEXT,
  "relatedSubmissionId" TEXT,
  "relatedVenueId" TEXT,
  "isDone" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Suggestion_relatedPaperId_fkey" FOREIGN KEY ("relatedPaperId") REFERENCES "Paper" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Suggestion_relatedSubmissionId_fkey" FOREIGN KEY ("relatedSubmissionId") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Suggestion_relatedVenueId_fkey" FOREIGN KEY ("relatedVenueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
