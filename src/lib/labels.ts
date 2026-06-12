export type PaperStatus =
  | "WRITING"
  | "NEEDS_REVISION"
  | "READY_TO_SUBMIT"
  | "SUBMITTING"
  | "ACCEPTED"
  | "REJECTED"
  | "PUBLISHED"
  | "PAUSED";

export type VersionType = "CONFERENCE" | "FORUM" | "JOURNAL" | "ABSTRACT" | "ANONYMOUS" | "FULL_SUBMISSION" | "RESUBMISSION";
export type ReuseLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_RECOMMENDED";
export type VenueType = "CONFERENCE" | "FORUM" | "JOURNAL";
export type ResearchFit = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type WorthAttending = "VERY_WORTH" | "CONSIDER" | "AVERAGE" | "NOT_RECOMMENDED" | "UNKNOWN";
export type FeeStatus = "FREE" | "REGISTRATION_REQUIRED" | "SELF_FUNDED" | "REIMBURSABLE" | "UNKNOWN";
export type JournalLevel = "GENERAL" | "UNIVERSITY_JOURNAL" | "COLLECTION" | "CSSCI" | "PKU_CORE" | "CSSCI_EXPANDED" | "OTHER";
export type SubmissionStatus =
  | "PREPARING"
  | "SUBMITTED"
  | "WAITING_RESULT"
  | "INITIAL_REVIEW"
  | "EXTERNAL_REVIEW"
  | "REVISION"
  | "REVISED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"
  | "ARCHIVED";
export type SubmissionResult = "PENDING" | "ACCEPTED" | "REJECTED" | "REVISION" | "NO_RESPONSE" | "WITHDRAWN";
export type ReviewStage = "NOT_STARTED" | "RECEIVED" | "INITIAL_REVIEW" | "EXTERNAL_REVIEW" | "REVISION" | "FINAL_REVIEW" | "ACCEPTED" | "REJECTED";
export type ReminderType =
  | "DEADLINE_SOON"
  | "CONFERENCE_START"
  | "NOTIFICATION_SOON"
  | "REVISION_DUE"
  | "NO_RESPONSE_30"
  | "NO_RESPONSE_60"
  | "NO_RESPONSE_90"
  | "FORMAT_CHECK"
  | "SELF_FUNDING_CONFIRM"
  | "PAYMENT_REQUIRED"
  | "REVIEW_STATUS_UPDATE"
  | "CUSTOM";

export const paperStatusLabels: Record<string, string> = {
  WRITING: "写作中",
  NEEDS_REVISION: "待修改",
  READY_TO_SUBMIT: "可投稿",
  SUBMITTING: "投稿中",
  ACCEPTED: "已录用",
  REJECTED: "已拒稿",
  PUBLISHED: "已发表",
  PAUSED: "暂缓"
};

export const versionTypeLabels: Record<string, string> = {
  CONFERENCE: "会议版",
  FORUM: "论坛版",
  JOURNAL: "期刊版",
  ABSTRACT: "摘要版",
  ANONYMOUS: "匿名版",
  FULL_SUBMISSION: "完整投稿版",
  RESUBMISSION: "修改重投版"
};

export const reuseLevelLabels: Record<string, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
  NOT_RECOMMENDED: "不建议复用"
};

export const venueTypeLabels: Record<string, string> = {
  CONFERENCE: "会议",
  FORUM: "论坛",
  JOURNAL: "期刊"
};

export const researchFitLabels: Record<string, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
  UNKNOWN: "未判断"
};

export const worthAttendingLabels: Record<string, string> = {
  VERY_WORTH: "很值得参加",
  CONSIDER: "可以考虑",
  AVERAGE: "一般",
  NOT_RECOMMENDED: "不建议",
  UNKNOWN: "信息不足"
};

export const feeStatusLabels: Record<string, string> = {
  FREE: "不收费",
  REGISTRATION_REQUIRED: "需要注册费",
  SELF_FUNDED: "自费",
  REIMBURSABLE: "可报销",
  UNKNOWN: "费用未知"
};

export const journalLevelLabels: Record<string, string> = {
  GENERAL: "普刊",
  UNIVERSITY_JOURNAL: "学报",
  COLLECTION: "集刊",
  CSSCI: "CSSCI",
  PKU_CORE: "北大核心",
  CSSCI_EXPANDED: "C刊扩展",
  OTHER: "其他"
};

export const submissionStatusLabels: Record<string, string> = {
  PREPARING: "准备投稿",
  SUBMITTED: "已投稿",
  WAITING_RESULT: "等待结果",
  INITIAL_REVIEW: "初审中",
  EXTERNAL_REVIEW: "外审中",
  REVISION: "退修中",
  REVISED: "已返修",
  ACCEPTED: "已录用",
  REJECTED: "已拒稿",
  WITHDRAWN: "已撤稿",
  ARCHIVED: "已归档"
};

export const journalSubmissionStatusLabels: Record<string, string> = {
  PREPARING: "准备投稿",
  SUBMITTED: "已投稿",
  INITIAL_REVIEW: "初审中",
  EXTERNAL_REVIEW: "外审中",
  REVISION: "退修中",
  REVISED: "已返修",
  ACCEPTED: "已录用",
  REJECTED: "已拒稿",
  WITHDRAWN: "已撤稿"
};

export const forumSubmissionStatusLabels: Record<string, string> = {
  PREPARING: "准备投稿",
  SUBMITTED: "已投稿",
  WAITING_RESULT: "等待结果",
  ACCEPTED: "已录用",
  REJECTED: "已拒稿",
  WITHDRAWN: "已撤稿"
};

export const submissionResultLabels: Record<string, string> = {
  PENDING: "未出结果",
  ACCEPTED: "录用",
  REJECTED: "拒稿",
  REVISION: "退修",
  NO_RESPONSE: "无回应",
  WITHDRAWN: "撤稿"
};

export const finalSubmissionResultLabels: Record<string, string> = {
  PENDING: "未出结果",
  ACCEPTED: "录用",
  REJECTED: "拒稿",
  NO_RESPONSE: "无回应",
  WITHDRAWN: "撤稿"
};

export const reviewStageLabels: Record<string, string> = {
  NOT_STARTED: "未开始",
  RECEIVED: "已收稿",
  INITIAL_REVIEW: "初审中",
  EXTERNAL_REVIEW: "外审中",
  REVISION: "退修中",
  FINAL_REVIEW: "终审中",
  ACCEPTED: "已录用",
  REJECTED: "已拒稿"
};

export const reminderTypeLabels: Record<string, string> = {
  DEADLINE_SOON: "即将截稿",
  CONFERENCE_START: "会议即将开始",
  NOTIFICATION_SOON: "录用通知即将公布",
  REVISION_DUE: "返修即将截止",
  NO_RESPONSE_30: "投稿超过30天未回复",
  NO_RESPONSE_60: "投稿超过60天未回复",
  NO_RESPONSE_90: "投稿超过90天未回复",
  FORMAT_CHECK: "需要检查格式",
  SELF_FUNDING_CONFIRM: "需要确认是否自费",
  PAYMENT_REQUIRED: "需要缴费",
  REVIEW_STATUS_UPDATE: "需要更新审稿状态",
  CUSTOM: "自定义提醒"
};

export const valueLevelLabels: Record<string, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
  UNKNOWN: "未判断"
};

export const yesNoUnknownLabels: Record<string, string> = {
  YES: "是",
  NO: "否",
  UNKNOWN: "不确定"
};

export const worthSubmittingAgainLabels: Record<string, string> = {
  YES: "是",
  NO: "否",
  CONDITIONAL: "视情况",
  UNKNOWN: "未判断"
};

export const rejectReasonCategoryLabels: Record<string, string> = {
  TOPIC_MISMATCH: "选题不符",
  THEORY_WEAK: "理论不足",
  METHOD_WEAK: "方法不足",
  INNOVATION_WEAK: "创新性不足",
  FORMAT_ISSUE: "格式问题",
  LENGTH_ISSUE: "篇幅问题",
  COLUMN_MISMATCH: "不符合栏目",
  CONFERENCE_THEME_MISMATCH: "不符合会议主题",
  REVIEW_TOO_LONG: "审稿周期过长",
  DUPLICATION_ISSUE: "重复率问题",
  UNCLEAR_WRITING: "表达不清",
  INSUFFICIENT_DATA: "资料不足",
  NO_REASON: "未说明原因",
  OTHER: "其他"
};

export const nextSubmissionStrategyLabels: Record<string, string> = {
  RESUBMIT_SIMILAR_CONFERENCE: "修改后重投同类会议",
  CHANGE_CONFERENCE: "改投其他会议",
  CHANGE_FORUM: "改投研究生论坛",
  EXPAND_TO_JOURNAL: "扩展为期刊版",
  COMPRESS_TO_CONFERENCE: "压缩为会议版",
  SPLIT_INTO_TWO: "拆分成两篇文章",
  PAUSE: "暂时搁置",
  NEW_TOPIC: "重新选题",
  OTHER: "其他"
};

export const rejectionSeverityLabels: Record<string, string> = {
  MINOR: "轻微",
  MEDIUM: "中等",
  SEVERE: "严重",
  UNKNOWN: "未判断"
};

export const reuseAfterRejectLabels: Record<string, string> = {
  YES: "是",
  NO: "否",
  NEEDS_REVISION: "需要修改",
  UNKNOWN: "未判断"
};

export const majorRevisionLabels: Record<string, string> = {
  YES: "是",
  NO: "否",
  UNKNOWN: "不确定"
};

export const suggestionTypeLabels: Record<string, string> = {
  RESUBMISSION: "改投建议",
  REVISION: "修改建议",
  FORMAT_REUSE: "格式复用建议",
  COST_RISK: "费用风险建议",
  CONFERENCE_VALUE: "会议价值建议",
  JOURNAL_SUBMISSION: "期刊投稿建议",
  LONG_NO_RESPONSE: "长期无回应提醒",
  REJECTION_HANDLING: "拒稿后处理建议"
};

export const priorityLabels: Record<string, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低"
};

export const fileTypeLabels: Record<string, string> = {
  MASTER_WORD: "完整版 Word",
  MASTER_PDF: "完整版 PDF",
  SUBMISSION_WORD: "投稿版 Word",
  SUBMISSION_PDF: "投稿版 PDF",
  ANONYMOUS: "匿名版",
  ABSTRACT: "摘要版",
  PLAGIARISM_REPORT: "查重报告",
  RECEIPT: "投稿回执",
  ACCEPTANCE_NOTICE: "录用通知",
  REJECTION_EMAIL: "拒稿邮件",
  REVISION_NOTE: "修改说明",
  REVISED_MANUSCRIPT: "返修稿",
  REVIEW_COMMENTS: "审稿意见",
  CONFERENCE_NOTICE: "会议通知",
  PAYMENT_PROOF: "缴费凭证",
  OTHER: "其他"
};

export const calendarEventTypeLabels: Record<string, string> = {
  DEADLINE: "截稿",
  CONFERENCE: "会议",
  REVISION: "返修",
  REVIEW_REMINDER: "审稿提醒",
  ACCEPTED: "录用",
  REJECTED: "拒稿",
  COST: "费用",
  FORMAT_CHECK: "格式检查",
  SUBMISSION: "投稿"
};

export const enumOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));
