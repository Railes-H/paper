export function csvResponse(filename: string, rows: Array<Record<string, string | number | null | undefined>>) {
  const headers = Object.keys(rows[0] ?? { 提示: "暂无数据" });
  const data = rows.length ? rows : [{ 提示: "暂无数据" }];
  const csv = [headers.join(","), ...data.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

function escapeCsv(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function dateOnly(date?: Date | string | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}
