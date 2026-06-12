import type { ReminderType } from "@/lib/labels";
import { daysBetween } from "@/lib/utils";

type ReminderSource = {
  id: string;
  status: string;
  resultDate: Date | null;
  submissionDate: Date | null;
  deadline: Date | null;
  revisionDeadline: Date | null;
  submittedFileUrl: string | null;
  formatChecked: boolean;
  paper: { title: string };
  venue: {
    name: string;
    type: string;
    conferenceInfo: {
      conferenceStartDate: Date | null;
      notificationDate: Date | null;
      registrationRequired: boolean;
      needSelfFunded: boolean;
      feeStatus: string;
    } | null;
    journalInfo: {
      hasReviewFee: boolean;
      hasPublicationFee: boolean;
      reviewFee: number | null;
      publicationFee: number | null;
    } | null;
  };
};

export type ComputedReminder = {
  submissionId: string;
  type: ReminderType;
  title: string;
  date: Date;
  priority: "high" | "medium" | "low";
};

export function computeSubmissionReminders(submissions: ReminderSource[], now = new Date()) {
  const reminders: ComputedReminder[] = [];

  for (const item of submissions) {
    if (item.deadline) {
      const days = daysBetween(now, item.deadline);
      if (days >= 0 && days <= 7) {
        reminders.push({
          submissionId: item.id,
          type: "DEADLINE_SOON",
          title: `${item.venue.name} 截稿仅剩 ${days} 天`,
          date: item.deadline,
          priority: "high"
        });
      }
    }

    if (item.venue.conferenceInfo?.conferenceStartDate) {
      const days = daysBetween(now, item.venue.conferenceInfo.conferenceStartDate);
      if (days >= 0 && days <= 14) {
        reminders.push({
          submissionId: item.id,
          type: "CONFERENCE_START",
          title: `${item.venue.name} 即将开始`,
          date: item.venue.conferenceInfo.conferenceStartDate,
          priority: "medium"
        });
      }
    }

    if (item.venue.conferenceInfo?.notificationDate) {
      const days = daysBetween(now, item.venue.conferenceInfo.notificationDate);
      if (days >= 0 && days <= 7) {
        reminders.push({
          submissionId: item.id,
          type: "NOTIFICATION_SOON",
          title: `${item.venue.name} 近期公布录用通知`,
          date: item.venue.conferenceInfo.notificationDate,
          priority: "medium"
        });
      }
    }

    if (item.revisionDeadline) {
      const days = daysBetween(now, item.revisionDeadline);
      if (days >= 0 && days <= 7) {
        reminders.push({
          submissionId: item.id,
          type: "REVISION_DUE",
          title: `${item.paper.title} 返修截止仅剩 ${days} 天`,
          date: item.revisionDeadline,
          priority: "high"
        });
      }
    }

    if (item.submissionDate && !item.resultDate && item.status !== "ACCEPTED" && item.status !== "REJECTED") {
      const passed = daysBetween(item.submissionDate, now);
      const type = passed >= 90 ? "NO_RESPONSE_90" : passed >= 60 ? "NO_RESPONSE_60" : passed >= 30 ? "NO_RESPONSE_30" : null;
      if (type) {
        reminders.push({
          submissionId: item.id,
          type,
          title: `${item.venue.name} 已投稿 ${passed} 天未出结果`,
          date: now,
          priority: passed >= 90 ? "high" : "medium"
        });
      }
    }

    if (!item.formatChecked) {
      reminders.push({
        submissionId: item.id,
        type: "FORMAT_CHECK",
        title: `${item.paper.title} 需要检查投稿格式`,
        date: item.deadline ?? now,
        priority: "medium"
      });
    }

    if (!item.submittedFileUrl) {
      reminders.push({
        submissionId: item.id,
        type: "FORMAT_CHECK",
        title: `${item.paper.title} 还没有填写投稿文件链接`,
        date: item.deadline ?? now,
        priority: "low"
      });
    }

    const feeUnknown =
      item.venue.conferenceInfo &&
      item.venue.conferenceInfo.registrationRequired &&
      !item.venue.conferenceInfo.needSelfFunded &&
      item.venue.conferenceInfo.feeStatus === "UNKNOWN";
    if (feeUnknown) {
      reminders.push({
        submissionId: item.id,
        type: "SELF_FUNDING_CONFIRM",
        title: `${item.venue.name} 需要确认注册费或自费情况`,
        date: item.deadline ?? now,
        priority: "high"
      });
    }
  }

  return reminders.sort((a, b) => a.date.getTime() - b.date.getTime());
}
