import { NextRequest } from "next/server";
import { csvResponse, dateOnly } from "@/lib/csv";
import { fileTypeLabels, rejectReasonCategoryLabels, venueTypeLabels } from "@/lib/labels";
import { displayResearchAreas } from "@/lib/paper-fields";
import { prisma } from "@/lib/prisma";
import { reviewDays } from "@/lib/utils";

export async function GET(_request: NextRequest, { params }: { params: { type: string } }) {
  const type = params.type;
  if (type === "papers") {
    const rows = await prisma.paper.findMany({ orderBy: { updatedAt: "desc" } });
    return csvResponse("papers.csv", rows.map((item) => ({ 论文标题: item.title, 研究方向: displayResearchAreas(item.researchArea), 作者: item.authors, 字数: item.masterWordCount, 当前状态: item.currentStatus, 当前版本: item.currentVersion, 文件链接: item.masterFileUrl, 创建时间: dateOnly(item.createdAt) })));
  }
  if (type === "versions") {
    const rows = await prisma.paperVersion.findMany({ include: { paper: true, targetVenue: true }, orderBy: { updatedAt: "desc" } });
    return csvResponse("paper_versions.csv", rows.map((item) => ({ 版本名称: item.versionName, 母版论文: item.paper.title, 版本类型: item.versionType, 投稿对象: item.targetVenue?.name, 字数要求: item.wordLimit, 实际字数: item.actualWordCount, 是否匿名: item.isAnonymous ? "是" : "否", 文件链接: item.fileUrl })));
  }
  if (type === "venues") {
    const rows = await prisma.venue.findMany({ include: { evaluation: true, conferenceInfo: true, journalInfo: true }, orderBy: { updatedAt: "desc" } });
    return csvResponse("venues.csv", rows.map((item) => ({ 名称: item.name, 类型: venueTypeLabels[item.type], 主办单位: item.organizer, 级别: item.level, 学术价值: item.evaluation?.academicValue, 投稿难度: item.evaluation?.submissionDifficulty, 费用压力: item.evaluation?.costPressure, 值得再次投稿: item.evaluation?.worthSubmittingAgain, 官网: item.website })));
  }
  if (type === "submissions") {
    const rows = await prisma.submission.findMany({ include: { paper: true, paperVersion: true, venue: true }, orderBy: { updatedAt: "desc" } });
    return csvResponse("submissions.csv", rows.map((item) => ({ 论文标题: item.paper.title, 投稿格式: item.paperVersion.versionName, 格式要求: item.paperVersion.formatRequirementText, 格式文档: item.paperVersion.fileUrl, 投稿对象名称: item.venue.name, 投稿类型: venueTypeLabels[item.submissionType], 投稿日期: dateOnly(item.submissionDate), 截稿日期: dateOnly(item.deadline), 当前状态: item.status, 最终结果: item.result, 结果日期: dateOnly(item.resultDate), 拒稿原因分类: item.rejectReasonCategory ? rejectReasonCategoryLabels[item.rejectReasonCategory] : "", 下一步计划: item.nextAction })));
  }
  if (type === "conference-costs") {
    const rows = await prisma.venue.findMany({ where: { OR: [{ type: "CONFERENCE" }, { type: "FORUM" }] }, include: { conferenceInfo: true, evaluation: true } });
    return csvResponse("conference_costs.csv", rows.map((item) => ({ 会议论坛名称: item.name, 注册费: item.conferenceInfo?.registrationFee, 交通预算: item.conferenceInfo?.travelBudget, 住宿预算: item.conferenceInfo?.accommodationBudget, 总预算: item.conferenceInfo?.totalBudget, 是否自费: item.conferenceInfo?.needSelfFunded ? "是" : "否", 是否可报销: item.conferenceInfo?.reimbursable ? "是" : "否", 费用压力: item.evaluation?.costPressure })));
  }
  if (type === "review-cycles") {
    const rows = await prisma.submission.findMany({ include: { paper: true, venue: true } });
    return csvResponse("review_cycles.csv", rows.map((item) => ({ 论文标题: item.paper.title, 投稿对象: item.venue.name, 投稿日期: dateOnly(item.submissionDate), 结果日期: dateOnly(item.resultDate ?? item.acceptDate ?? item.rejectDate), 审稿周期天数: reviewDays(item) ?? "" })));
  }
  if (type === "rejection-reasons") {
    const rows = await prisma.submission.findMany({ where: { OR: [{ result: "REJECTED" }, { status: "REJECTED" }] }, include: { paper: true, venue: true } });
    const grouped = new Map<string, { count: number; items: string[] }>();
    for (const item of rows) {
      const key = item.rejectReasonCategory ?? "NO_REASON";
      const existing = grouped.get(key) ?? { count: 0, items: [] };
      existing.count += 1;
      existing.items.push(`${item.paper.title} - ${item.venue.name}`);
      grouped.set(key, existing);
    }
    return csvResponse("rejection_reasons.csv", Array.from(grouped.entries()).map(([key, value]) => ({ 拒稿原因分类: rejectReasonCategoryLabels[key] ?? key, 数量: value.count, 对应论文和投稿对象: value.items.join("；") })));
  }
  if (type === "files") {
    const rows = await prisma.fileRecord.findMany({ include: { relatedPaper: true, relatedPaperVersion: true, relatedSubmission: { include: { paper: true, venue: true } } } });
    return csvResponse("files.csv", rows.map((item) => ({ 文件名: item.fileName, 文件类型: fileTypeLabels[item.fileType], 文件链接: item.fileUrl, 版本说明: item.versionLabel, 关联论文: item.relatedPaper?.title, 关联投稿格式: item.relatedPaperVersion?.versionName, 关联投稿记录: item.relatedSubmission ? `${item.relatedSubmission.paper.title} - ${item.relatedSubmission.venue.name}` : "" })));
  }
  if (type === "suggestions") {
    const rows = await prisma.suggestion.findMany({ include: { relatedPaper: true, relatedSubmission: { include: { venue: true } }, relatedVenue: true } });
    return csvResponse("suggestions.csv", rows.map((item) => ({ 建议标题: item.suggestionTitle, 建议类型: item.suggestionType, 优先级: item.priority, 建议内容: item.suggestionContent, 是否完成: item.isDone ? "是" : "否", 关联论文: item.relatedPaper?.title, 关联投稿对象: item.relatedVenue?.name ?? item.relatedSubmission?.venue.name })));
  }
  return csvResponse("unknown.csv", [{ 提示: "未知导出类型" }]);
}
