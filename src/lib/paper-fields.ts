export const defaultResearchAreas = [
  "新闻传播",
  "游戏研究",
  "媒介地理学",
  "短视频研究",
  "乡村传播",
  "文化传播",
  "数字媒体",
  "网络传播",
  "自媒体研究",
  "侨乡文化传播",
  "其他"
];

export const defaultVersionOptions = [
  "初稿",
  "修改稿",
  "投稿母版",
  "完整版",
  "会议版母版",
  "期刊版母版",
  "终稿",
  "V1",
  "V2",
  "V3"
];

export function parseResearchAreas(value?: string | null) {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean);
  } catch {
    // Older rows stored one plain text value.
  }
  return trimmed
    .split(/[、,，;；\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringifyResearchAreas(values: string[]) {
  return JSON.stringify(Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))));
}

export function displayResearchAreas(value?: string | null) {
  const values = parseResearchAreas(value);
  return values.length ? values.join("、") : "-";
}

export function collectResearchAreaOptions(papers: Array<{ researchArea: string }>) {
  return Array.from(new Set([...defaultResearchAreas, ...papers.flatMap((paper) => parseResearchAreas(paper.researchArea))])).filter(Boolean);
}

export function collectVersionOptions(papers: Array<{ currentVersion: string | null }>) {
  return Array.from(new Set([...defaultVersionOptions, ...papers.map((paper) => paper.currentVersion ?? "").filter(Boolean)]));
}
