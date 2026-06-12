import { daysBetween } from "@/lib/utils";

export type RuleSuggestion = {
  id: string;
  suggestionTitle: string;
  suggestionType: string;
  suggestionContent: string;
  priority: string;
  relatedPaperId?: string | null;
  relatedSubmissionId?: string | null;
  relatedVenueId?: string | null;
  isDone: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type BuildInput = {
  papers: any[];
  submissions: any[];
  venues: any[];
  templates?: any[];
  persistedSuggestions: Array<{ id: string; isDone: boolean; createdAt: Date; updatedAt: Date }>;
};

export function buildSuggestions(input: BuildInput, now = new Date()): RuleSuggestion[] {
  const doneMap = new Map(input.persistedSuggestions.map((item) => [item.id, item]));
  const suggestions: RuleSuggestion[] = [];

  const push = (item: Omit<RuleSuggestion, "isDone">) => {
    const persisted = doneMap.get(item.id);
    suggestions.push({
      ...item,
      isDone: persisted?.isDone ?? false,
      createdAt: persisted?.createdAt,
      updatedAt: persisted?.updatedAt
    });
  };

  for (const submission of input.submissions) {
    const rejected = submission.result === "REJECTED" || submission.status === "REJECTED";
    if (rejected && submission.submissionType !== "JOURNAL" && ["TOPIC_MISMATCH", "CONFERENCE_THEME_MISMATCH"].includes(submission.rejectReasonCategory)) {
      push({
        id: `rule-topic-mismatch-${submission.id}`,
        suggestionTitle: "改投更匹配主题的会议或论坛",
        suggestionType: "RESUBMISSION",
        suggestionContent: `《${submission.paper.title}》在 ${submission.venue.name} 的拒稿原因偏向主题不匹配，建议优先筛选研究方向匹配度更高的会议或论坛，而不是直接复用原投稿对象。`,
        priority: "HIGH",
        relatedPaperId: submission.paperId,
        relatedSubmissionId: submission.id,
        relatedVenueId: submission.venueId
      });
    }
    if (rejected && submission.submissionType === "JOURNAL" && submission.rejectReasonCategory === "THEORY_WEAK") {
      push({
        id: `rule-theory-${submission.id}`,
        suggestionTitle: "补强理论框架后再投期刊",
        suggestionType: "REVISION",
        suggestionContent: `《${submission.paper.title}》期刊投稿被指出理论不足，建议先补充核心概念、理论脉络和文献对话，再考虑继续投同级别期刊。`,
        priority: "HIGH",
        relatedPaperId: submission.paperId,
        relatedSubmissionId: submission.id,
        relatedVenueId: submission.venueId
      });
    }
    if (rejected && submission.submissionType === "JOURNAL" && submission.rejectReasonCategory === "LENGTH_ISSUE") {
      push({
        id: `rule-length-${submission.id}`,
        suggestionTitle: "压缩为会议版或论坛版",
        suggestionType: "REJECTION_HANDLING",
        suggestionContent: `《${submission.paper.title}》期刊投稿存在篇幅问题，可以先压缩为会议版或论坛版，保留核心论点，降低下一轮投稿成本。`,
        priority: "MEDIUM",
        relatedPaperId: submission.paperId,
        relatedSubmissionId: submission.id,
        relatedVenueId: submission.venueId
      });
    }
    if (submission.submissionDate && !submission.resultDate && submission.result === "PENDING") {
      const days = daysBetween(submission.submissionDate, now);
      if (days >= 90) {
        push({
          id: `rule-no-response-90-${submission.id}`,
          suggestionTitle: "投稿已超过 90 天无结果",
          suggestionType: "LONG_NO_RESPONSE",
          suggestionContent: `${submission.venue.name} 已投稿 ${days} 天仍未出结果，建议标记为长期无回应，并准备一个可快速改投的备选对象。`,
          priority: "HIGH",
          relatedPaperId: submission.paperId,
          relatedSubmissionId: submission.id,
          relatedVenueId: submission.venueId
        });
      }
    }
    if (submission.venue?.evaluation?.worthSubmittingAgain === "NO") {
      push({
        id: `rule-avoid-venue-${submission.venueId}`,
        suggestionTitle: "避免再次投稿该对象",
        suggestionType: "CONFERENCE_VALUE",
        suggestionContent: `${submission.venue.name} 已被标记为“不值得再次投稿”，后续建议降低优先级，除非主题高度匹配或有特殊机会。`,
        priority: "MEDIUM",
        relatedVenueId: submission.venueId,
        relatedSubmissionId: submission.id,
        relatedPaperId: submission.paperId
      });
    }
    if (submission.venue?.evaluation?.costPressure === "HIGH" && submission.venue?.conferenceInfo?.needSelfFunded) {
      push({
        id: `rule-cost-${submission.venueId}`,
        suggestionTitle: "费用压力较高，降低投稿优先级",
        suggestionType: "COST_RISK",
        suggestionContent: `${submission.venue.name} 费用压力为高且可能需要自费，建议优先确认报销可能性，再决定是否继续投稿或参会。`,
        priority: "HIGH",
        relatedVenueId: submission.venueId,
        relatedSubmissionId: submission.id,
        relatedPaperId: submission.paperId
      });
    }
  }

  for (const paper of input.papers) {
    const hasJournalVersion = paper.versions?.some((version: any) => version.versionType === "JOURNAL");
    const hasConferenceVersion = paper.versions?.some((version: any) => version.versionType === "CONFERENCE");
    const highReuse = paper.versions?.find((version: any) => version.reuseLevel === "HIGH");
    if (highReuse) {
      push({
        id: `rule-high-reuse-${highReuse.id}`,
        suggestionTitle: "复用历史投稿格式",
        suggestionType: "FORMAT_REUSE",
        suggestionContent: `《${paper.title}》已有可复用投稿格式“${highReuse.versionName}”，新投稿前可以参考它的格式要求和文档处理方式。`,
        priority: "MEDIUM",
        relatedPaperId: paper.id
      });
    }
    if (hasJournalVersion && !hasConferenceVersion) {
      push({
        id: `rule-journal-to-conference-${paper.id}`,
        suggestionTitle: "为期刊版生成会议版",
        suggestionType: "FORMAT_REUSE",
        suggestionContent: `《${paper.title}》已有期刊版但还没有会议版，建议压缩字数并生成一个会议版，方便应对近期会议截稿。`,
        priority: "LOW",
        relatedPaperId: paper.id
      });
    }
    if (hasConferenceVersion && !hasJournalVersion && (paper.masterWordCount ?? 0) >= 10000) {
      push({
        id: `rule-conference-to-journal-${paper.id}`,
        suggestionTitle: "扩展为期刊投稿版",
        suggestionType: "JOURNAL_SUBMISSION",
        suggestionContent: `《${paper.title}》已有会议版且内容较完整，可以补强文献和论证后扩展为期刊版。`,
        priority: "MEDIUM",
        relatedPaperId: paper.id
      });
    }
  }
  return suggestions.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
}

function priorityWeight(priority: string) {
  return priority === "HIGH" ? 3 : priority === "MEDIUM" ? 2 : 1;
}
