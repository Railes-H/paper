import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.reminder.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.fileRecord.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.paperVersion.deleteMany();
  await prisma.formatTemplate.deleteMany();
  await prisma.venueEvaluation.deleteMany();
  await prisma.conferenceInfo.deleteMany();
  await prisma.journalInfo.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.paper.deleteMany();

  const conference = await prisma.venue.create({
    data: {
      name: "中国新闻传播学年会",
      type: "CONFERENCE",
      organizer: "中国新闻传播学会",
      level: "全国性会议",
      website: "https://example.com",
      researchFit: "HIGH",
      conferenceInfo: {
        create: {
          deadline: new Date("2026-07-05"),
          notificationDate: new Date("2026-08-10"),
          conferenceStartDate: new Date("2026-09-20"),
          conferenceEndDate: new Date("2026-09-22"),
          location: "北京",
          registrationRequired: true,
          registrationFee: 1200,
          needSelfFunded: false,
          reimbursable: false,
          totalBudget: 3200,
          feeStatus: "UNKNOWN",
          worthAttending: "VERY_WORTH",
          callForPapersUrl: "https://example.com/cfp"
        }
      },
      evaluation: {
        create: {
          academicValue: "HIGH",
          submissionDifficulty: "MEDIUM",
          costPressure: "HIGH",
          participationValue: "HIGH",
          studentFriendly: "YES",
          worthSubmittingAgain: "CONDITIONAL",
          networkingValue: "HIGH",
          resumeValue: "HIGH",
          hasProceedings: "YES",
          hasCertificate: "YES",
          mustAttendOffline: "UNKNOWN",
          mustPresent: "YES",
          evaluationNotes: "学术价值较高，但需要提前确认费用和报销。"
        }
      }
    }
  });

  const journal = await prisma.venue.create({
    data: {
      name: "现代传播",
      type: "JOURNAL",
      organizer: "某高校",
      level: "CSSCI",
      submissionUrl: "https://example.com/journal",
      researchFit: "MEDIUM",
      journalInfo: {
        create: {
          journalLevel: "CSSCI",
          submissionSystemUrl: "https://example.com/journal-submit",
          officialWebsite: "https://example.com/journal",
          hasReviewFee: false,
          hasPublicationFee: false
        }
      },
      evaluation: {
        create: {
          academicValue: "HIGH",
          submissionDifficulty: "HIGH",
          costPressure: "LOW",
          participationValue: "UNKNOWN",
          studentFriendly: "UNKNOWN",
          worthSubmittingAgain: "YES",
          networkingValue: "MEDIUM",
          resumeValue: "HIGH",
          evaluationNotes: "期刊级别较高，适合成熟论文。"
        }
      }
    }
  });

  const paper = await prisma.paper.create({
    data: {
      title: "平台化传播中的地方文化再生产研究",
      researchArea: "新闻传播学",
      authors: "昊昊",
      masterAbstract: "围绕平台机制、地方文化表达与传播实践之间的关系展开分析。",
      masterKeywords: "平台化；地方文化；传播实践",
      masterWordCount: 14800,
      masterFileUrl: "https://example.com/master.docx",
      currentStatus: "SUBMITTING",
      currentVersion: "投稿母版 V2",
      latestUpdateDate: new Date("2026-06-02"),
      notes: "可继续拆分为会议版和期刊版。"
    }
  });

  const version = await prisma.paperVersion.create({
    data: {
      paperId: paper.id,
      targetVenueId: conference.id,
      versionName: "年会匿名 12000 字版",
      versionType: "CONFERENCE",
      fileUrl: "https://example.com/conference-version.docx",
      wordLimit: 12000,
      actualWordCount: 11920,
      abstractWordLimit: 300,
      keywordRequirement: "3-5 个",
      referenceStyle: "GB/T 7714",
      citationStyle: "脚注",
      isAnonymous: true,
      needsEnglishAbstract: true,
      fileNamingRule: "论文题目-匿名版.docx",
      submissionMaterials: "匿名全文、摘要、作者信息表",
      formatRequirementText: "正文小四宋体，一级标题黑体。",
      formatNotes: "已删除作者身份信息。",
      reuseLevel: "HIGH"
    }
  });

  const conferenceSubmission = await prisma.submission.create({
    data: {
      paperId: paper.id,
      paperVersionId: version.id,
      venueId: conference.id,
      submissionType: "CONFERENCE",
      submissionDate: new Date("2026-06-01"),
      deadline: new Date("2026-07-05"),
      status: "WAITING_RESULT",
      result: "PENDING",
      submissionSystemUrl: "https://example.com/submit",
      submittedFileUrl: "https://example.com/conference-version.docx",
      receiptUrl: "https://example.com/receipt",
      submissionMaterials: "匿名全文、作者信息表",
      formatChecked: true,
      submittedSuccessfully: true,
      reviewStage: "RECEIVED",
      nextAction: "等待录用通知，准备期刊长版。"
    }
  });

  const journalVersion = await prisma.paperVersion.create({
    data: {
      paperId: paper.id,
      targetVenueId: journal.id,
      versionName: "现代传播期刊完整版",
      versionType: "JOURNAL",
      wordLimit: 15000,
      actualWordCount: 14680,
      referenceStyle: "GB/T 7714",
      citationStyle: "页下注",
      needsAuthorBio: true,
      needsFundingInfo: true,
      needsEnglishTitle: true,
      needsEnglishAbstract: true,
      needsEnglishKeywords: true,
      reuseLevel: "MEDIUM"
    }
  });

  await prisma.submission.create({
    data: {
      paperId: paper.id,
      paperVersionId: journalVersion.id,
      venueId: journal.id,
      submissionType: "JOURNAL",
      submissionDate: new Date("2026-01-12"),
      status: "REJECTED",
      result: "REJECTED",
      resultDate: new Date("2026-03-20"),
      rejectDate: new Date("2026-03-20"),
      formatChecked: true,
      submittedSuccessfully: true,
      reviewStage: "REJECTED",
      rejectReasonCategory: "THEORY_WEAK",
      rejectReasonDetail: "编辑意见认为理论框架仍偏弱，文献对话不足。",
      reviewerComments: "建议进一步明确理论贡献。",
      selfReflection: "目前案例分析较充分，但理论提升不够。",
      improvementPlan: "补充平台化治理和地方文化生产相关理论。",
      nextSubmissionStrategy: "EXPAND_TO_JOURNAL",
      targetAfterRejection: "同方向 CSSCI 扩展或核心期刊",
      rejectionSeverity: "MEDIUM",
      canReuseVersion: "NEEDS_REVISION",
      needsMajorRevision: "YES",
      nextAction: "补理论后重新选择期刊。"
    }
  });

  const journalSubmission = await prisma.submission.create({
    data: {
      paperId: paper.id,
      paperVersionId: journalVersion.id,
      venueId: journal.id,
      submissionType: "JOURNAL",
      submissionDate: new Date("2026-04-20"),
      status: "EXTERNAL_REVIEW",
      result: "PENDING",
      formatChecked: false,
      submittedSuccessfully: true,
      reviewStage: "EXTERNAL_REVIEW",
      nextAction: "6 月底前检查系统状态。"
    }
  });

  await prisma.fileRecord.createMany({
    data: [
      {
        id: "file-master-demo",
        fileName: "平台化传播地方文化研究-投稿母版V2.docx",
        fileType: "MASTER_WORD",
        fileUrl: "https://example.com/master.docx",
        relatedPaperId: paper.id,
        versionLabel: "投稿母版 V2",
        uploadDate: new Date("2026-06-02")
      },
      {
        id: "file-receipt-demo",
        fileName: "新闻传播学年会投稿回执.pdf",
        fileType: "RECEIPT",
        fileUrl: "https://example.com/receipt",
        relatedPaperId: paper.id,
        relatedPaperVersionId: version.id,
        relatedSubmissionId: conferenceSubmission.id,
        versionLabel: "会议投稿回执",
        uploadDate: new Date("2026-06-01")
      },
      {
        id: "file-review-demo",
        fileName: "现代传播审稿意见.pdf",
        fileType: "REVIEW_COMMENTS",
        fileUrl: "https://example.com/review-comments",
        relatedPaperId: paper.id,
        relatedPaperVersionId: journalVersion.id,
        relatedSubmissionId: journalSubmission.id,
        versionLabel: "拒稿意见",
        uploadDate: new Date("2026-03-20")
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
