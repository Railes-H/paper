export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: string;
  href: string;
};

export function buildCalendarEvents(submissions: any[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const add = (event: CalendarEvent | null) => {
    if (event?.date) events.push(event);
  };

  for (const item of submissions) {
    add(item.submissionDate ? { id: `submission-${item.id}`, title: `${item.paper.title} 投稿`, date: item.submissionDate, type: "SUBMISSION", href: `/submissions/${item.id}` } : null);
    add(item.deadline ? { id: `deadline-${item.id}`, title: `${item.venue.name} 截稿`, date: item.deadline, type: "DEADLINE", href: `/submissions/${item.id}` } : null);
    add(item.revisionDeadline ? { id: `revision-${item.id}`, title: `${item.paper.title} 返修截止`, date: item.revisionDeadline, type: "REVISION", href: `/submissions/${item.id}` } : null);
    add(item.acceptDate ? { id: `accept-${item.id}`, title: `${item.paper.title} 录用`, date: item.acceptDate, type: "ACCEPTED", href: `/submissions/${item.id}` } : null);
    add(item.rejectDate ? { id: `reject-${item.id}`, title: `${item.paper.title} 拒稿`, date: item.rejectDate, type: "REJECTED", href: `/submissions/${item.id}` } : null);
    if (item.submissionDate && item.result === "PENDING") {
      for (const days of [30, 60, 90]) {
        const date = new Date(item.submissionDate);
        date.setDate(date.getDate() + days);
        add({ id: `review-${days}-${item.id}`, title: `${item.venue.name} 投稿满 ${days} 天`, date, type: "REVIEW_REMINDER", href: `/submissions/${item.id}` });
      }
    }
    if (!item.formatChecked) {
      add({ id: `format-${item.id}`, title: `${item.paper.title} 检查格式`, date: item.deadline ?? item.createdAt, type: "FORMAT_CHECK", href: `/submissions/${item.id}` });
    }
    const conference = item.venue?.conferenceInfo;
    if (conference) {
      add(conference.notificationDate ? { id: `notice-${item.id}`, title: `${item.venue.name} 录用通知`, date: conference.notificationDate, type: "REVIEW_REMINDER", href: `/venues/${item.venueId}` } : null);
      add(conference.conferenceStartDate ? { id: `conf-start-${item.id}`, title: `${item.venue.name} 开始`, date: conference.conferenceStartDate, type: "CONFERENCE", href: `/venues/${item.venueId}` } : null);
      add(conference.conferenceEndDate ? { id: `conf-end-${item.id}`, title: `${item.venue.name} 结束`, date: conference.conferenceEndDate, type: "CONFERENCE", href: `/venues/${item.venueId}` } : null);
      if (conference.registrationRequired) {
        add({ id: `cost-${item.id}`, title: `${item.venue.name} 确认缴费`, date: item.deadline ?? conference.conferenceStartDate ?? item.createdAt, type: "COST", href: `/venues/${item.venueId}` });
      }
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function yyyyMmDd(date: Date) {
  return date.toISOString().slice(0, 10);
}
