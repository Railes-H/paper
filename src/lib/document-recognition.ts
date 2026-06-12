export type RecognizedPaper = {
  title: string;
  masterAbstract: string;
  masterKeywords: string;
  masterWordCount: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  warning?: string;
};

export function recognizePaperText(text: string, fileName: string, fileType: string, fileUrl: string): RecognizedPaper {
  const normalized = text.replace(/\r/g, "\n").replace(/\u3000/g, " ").replace(/[ \t]+/g, " ");
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const fallbackTitle = stripExtension(fileName);
  const title = lines.find((line) => line.length >= 4 && line.length <= 80 && !/^(摘要|摘 要|关键词|关键字)/.test(line)) ?? fallbackTitle;
  const masterAbstract = extractAbstract(normalized);
  const masterKeywords = extractKeywords(normalized);
  const body = removeBackMatter(normalized);
  const masterWordCount = estimateWordCount(body);
  return {
    title,
    masterAbstract,
    masterKeywords,
    masterWordCount,
    fileName,
    fileType,
    fileUrl,
    warning: [masterAbstract ? "" : "未识别到摘要，请手动补充。", masterKeywords ? "" : "未识别到关键词，请手动补充。"]
      .filter(Boolean)
      .join(" ")
  };
}

function extractAbstract(text: string) {
  const marker = text.match(/(?:内容摘要|摘\s*要)[:：\s]*/i);
  if (!marker || marker.index === undefined) return "";

  const afterMarker = text.slice(marker.index + marker[0].length);
  const stopIndex = afterMarker.search(/\n?\s*(?:关键词|关键字)[:：\s]|中图分类号|Abstract|正文|一、/i);
  const section = stopIndex >= 0 ? afterMarker.slice(0, stopIndex) : afterMarker.slice(0, 600);
  return cleanParagraph(section);
}

function extractKeywords(text: string) {
  const match = text.match(/(?:关键词|关键字)[:：\s]*([^\n]{2,200})/);
  if (!match?.[1]) return "";
  return match[1]
    .replace(/[。.;；]+$/g, "")
    .split(/[、,，;；\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("；");
}

function removeBackMatter(text: string) {
  const index = text.search(/\n\s*(参考文献|注释|致谢|附录)\s*[:：]?\s*\n/);
  return index > 0 ? text.slice(0, index) : text;
}

function estimateWordCount(text: string) {
  const chinese = text.match(/[\u4e00-\u9fa5]/g)?.length ?? 0;
  const englishWords = text.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g)?.length ?? 0;
  const numbers = text.match(/\b\d+(?:\.\d+)?\b/g)?.length ?? 0;
  return chinese + englishWords + numbers;
}

function cleanParagraph(text: string) {
  return text.replace(/\s+/g, " ").replace(/^[:：\s]+/, "").trim();
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}
