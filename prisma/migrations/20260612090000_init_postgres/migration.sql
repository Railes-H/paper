-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "researchArea" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "masterAbstract" TEXT,
    "masterKeywords" TEXT,
    "masterWordCount" INTEGER,
    "masterFileUrl" TEXT,
    "currentStatus" TEXT NOT NULL DEFAULT 'WRITING',
    "currentVersion" TEXT,
    "latestUpdateDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperVersion" (
    "id" TEXT NOT NULL,
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
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "needsAuthorBio" BOOLEAN NOT NULL DEFAULT false,
    "needsFundingInfo" BOOLEAN NOT NULL DEFAULT false,
    "needsEnglishTitle" BOOLEAN NOT NULL DEFAULT false,
    "needsEnglishAbstract" BOOLEAN NOT NULL DEFAULT false,
    "needsEnglishKeywords" BOOLEAN NOT NULL DEFAULT false,
    "needsPlagiarismReport" BOOLEAN NOT NULL DEFAULT false,
    "fileNamingRule" TEXT,
    "submissionMaterials" TEXT,
    "formatRequirementText" TEXT,
    "formatNotes" TEXT,
    "reuseLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaperVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormatTemplate" (
    "id" TEXT NOT NULL,
    "venueId" TEXT,
    "templateName" TEXT NOT NULL,
    "venueType" TEXT NOT NULL,
    "wordLimit" INTEGER,
    "abstractRequirement" TEXT,
    "keywordRequirement" TEXT,
    "referenceStyle" TEXT,
    "citationStyle" TEXT,
    "anonymousRequirement" BOOLEAN NOT NULL DEFAULT false,
    "authorInfoRequirement" BOOLEAN NOT NULL DEFAULT false,
    "fundingRequirement" BOOLEAN NOT NULL DEFAULT false,
    "englishTitleRequirement" BOOLEAN NOT NULL DEFAULT false,
    "englishAbstractRequirement" BOOLEAN NOT NULL DEFAULT false,
    "englishKeywordsRequirement" BOOLEAN NOT NULL DEFAULT false,
    "plagiarismReportRequirement" BOOLEAN NOT NULL DEFAULT false,
    "fileNamingRule" TEXT,
    "submissionMaterials" TEXT,
    "formatRequirementText" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormatTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "organizer" TEXT,
    "level" TEXT,
    "website" TEXT,
    "submissionUrl" TEXT,
    "researchFit" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueEvaluation" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceInfo" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "notificationDate" TIMESTAMP(3),
    "conferenceStartDate" TIMESTAMP(3),
    "conferenceEndDate" TIMESTAMP(3),
    "location" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "registrationRequired" BOOLEAN NOT NULL DEFAULT false,
    "registrationFee" DOUBLE PRECISION,
    "needSelfFunded" BOOLEAN NOT NULL DEFAULT false,
    "reimbursable" BOOLEAN NOT NULL DEFAULT false,
    "travelBudget" DOUBLE PRECISION,
    "accommodationBudget" DOUBLE PRECISION,
    "totalBudget" DOUBLE PRECISION,
    "worthAttending" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "feeStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "callForPapersUrl" TEXT,
    "notes" TEXT,

    CONSTRAINT "ConferenceInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalInfo" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "journalLevel" TEXT NOT NULL DEFAULT 'OTHER',
    "submissionSystemUrl" TEXT,
    "officialWebsite" TEXT,
    "hasReviewFee" BOOLEAN NOT NULL DEFAULT false,
    "reviewFee" DOUBLE PRECISION,
    "hasPublicationFee" BOOLEAN NOT NULL DEFAULT false,
    "publicationFee" DOUBLE PRECISION,
    "feeNotes" TEXT,
    "notes" TEXT,

    CONSTRAINT "JournalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "paperVersionId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "submissionType" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PREPARING',
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "resultDate" TIMESTAMP(3),
    "submissionSystemUrl" TEXT,
    "submittedFileUrl" TEXT,
    "submittedFileRecordId" TEXT,
    "receiptUrl" TEXT,
    "submissionMaterials" TEXT,
    "formatChecked" BOOLEAN NOT NULL DEFAULT false,
    "submittedSuccessfully" BOOLEAN NOT NULL DEFAULT false,
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
    "revisionDate" TIMESTAMP(3),
    "revisionDeadline" TIMESTAMP(3),
    "revisionSubmittedDate" TIMESTAMP(3),
    "acceptDate" TIMESTAMP(3),
    "rejectDate" TIMESTAMP(3),
    "nextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT,
    "reminderType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileRecord" (
    "id" TEXT NOT NULL,
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
    "uploadDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "suggestionTitle" TEXT NOT NULL,
    "suggestionType" TEXT NOT NULL,
    "suggestionContent" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "relatedPaperId" TEXT,
    "relatedSubmissionId" TEXT,
    "relatedVenueId" TEXT,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VenueEvaluation_venueId_key" ON "VenueEvaluation"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "ConferenceInfo_venueId_key" ON "ConferenceInfo"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalInfo_venueId_key" ON "JournalInfo"("venueId");

-- AddForeignKey
ALTER TABLE "PaperVersion" ADD CONSTRAINT "PaperVersion_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperVersion" ADD CONSTRAINT "PaperVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormatTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperVersion" ADD CONSTRAINT "PaperVersion_targetVenueId_fkey" FOREIGN KEY ("targetVenueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormatTemplate" ADD CONSTRAINT "FormatTemplate_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueEvaluation" ADD CONSTRAINT "VenueEvaluation_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceInfo" ADD CONSTRAINT "ConferenceInfo_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalInfo" ADD CONSTRAINT "JournalInfo_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_paperVersionId_fkey" FOREIGN KEY ("paperVersionId") REFERENCES "PaperVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedFileRecordId_fkey" FOREIGN KEY ("submittedFileRecordId") REFERENCES "FileRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileRecord" ADD CONSTRAINT "FileRecord_relatedPaperId_fkey" FOREIGN KEY ("relatedPaperId") REFERENCES "Paper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileRecord" ADD CONSTRAINT "FileRecord_relatedPaperVersionId_fkey" FOREIGN KEY ("relatedPaperVersionId") REFERENCES "PaperVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileRecord" ADD CONSTRAINT "FileRecord_relatedSubmissionId_fkey" FOREIGN KEY ("relatedSubmissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileRecord" ADD CONSTRAINT "FileRecord_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "FileRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_relatedPaperId_fkey" FOREIGN KEY ("relatedPaperId") REFERENCES "Paper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_relatedSubmissionId_fkey" FOREIGN KEY ("relatedSubmissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_relatedVenueId_fkey" FOREIGN KEY ("relatedVenueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

