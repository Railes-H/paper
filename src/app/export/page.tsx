import { PageHeader } from "@/components/page-header";

const exportItems = [
  ["papers", "全部完整版论文"],
  ["venues", "全部投稿对象"],
  ["submissions", "全部投稿记录"],
  ["conference-costs", "会议费用统计"],
  ["review-cycles", "审稿周期统计"],
  ["rejection-reasons", "拒稿原因统计"],
  ["files", "文件记录"],
  ["suggestions", "下一步投稿建议"]
];

export default function ExportPage() {
  return (
    <>
      <PageHeader title="数据导出" description="第一版支持 CSV 下载，表头使用中文，日期统一为 YYYY-MM-DD。" backHref="/dashboard" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exportItems.map(([type, label]) => (
          <section key={type} className="panel p-5">
            <h2 className="text-base font-semibold text-ink">{label}</h2>
            <p className="mt-2 text-sm text-slate-500">导出为 CSV 文件，可用 Excel、Numbers 或表格软件打开。</p>
            <a className="btn-primary mt-4" href={`/export/${type}`}>下载 CSV</a>
          </section>
        ))}
      </div>
    </>
  );
}
