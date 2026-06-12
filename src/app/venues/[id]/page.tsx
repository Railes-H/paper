import { notFound } from "next/navigation";
import { updateVenueEvaluation } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import {
  enumOptions,
  researchFitLabels,
  valueLevelLabels,
  venueTypeLabels,
  worthSubmittingAgainLabels,
  yesNoUnknownLabels
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";

export default async function VenueDetailPage({ params }: { params: { id: string } }) {
  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
    include: {
      evaluation: true,
      conferenceInfo: true,
      journalInfo: true,
      submissions: { include: { paper: true } },
      versions: true
    }
  });
  if (!venue) notFound();

  const accepted = venue.submissions.filter((item) => item.result === "ACCEPTED" || item.status === "ACCEPTED").length;
  const rejected = venue.submissions.filter((item) => item.result === "REJECTED" || item.status === "REJECTED").length;
  const hitRate = venue.submissions.length ? Math.round((accepted / venue.submissions.length) * 100) : 0;

  return (
    <>
      <PageHeader title={venue.name} description="投稿对象详情、评价信息和历史投稿表现。" backHref="/venues" />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="历史投稿次数" value={venue.submissions.length} tone="blue" />
        <StatCard label="录用次数" value={accepted} tone="green" />
        <StatCard label="拒稿次数" value={rejected} tone="red" />
        <StatCard label="命中率" value={`${hitRate}%`} tone="purple" />
      </div>

      <section className="panel mb-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">基础信息</h2>
        <div className="grid gap-4 text-sm md:grid-cols-4">
          <Info label="类型" value={venueTypeLabels[venue.type]} />
          <Info label="主办单位" value={venue.organizer ?? "-"} />
          <Info label="级别" value={venue.level ?? "-"} />
          <Info label="研究方向匹配度" value={researchFitLabels[venue.researchFit]} />
          <Info label="官网" value={venue.website ?? "-"} />
          <Info label="投稿系统" value={venue.submissionUrl ?? "-"} />
          <Info label="投稿格式数" value={String(venue.versions.length)} />
          <Info label="备注" value={venue.notes ?? "-"} />
        </div>
      </section>

      <section className="panel mb-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">投稿对象评价</h2>
        <form action={updateVenueEvaluation.bind(null, venue.id)} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-4">
            <EvalSelect name="academicValue" label="学术价值" options={valueLevelLabels} value={venue.evaluation?.academicValue} />
            <EvalSelect name="submissionDifficulty" label="投稿难度" options={valueLevelLabels} value={venue.evaluation?.submissionDifficulty} />
            <EvalSelect name="costPressure" label="费用压力" options={valueLevelLabels} value={venue.evaluation?.costPressure} />
            <EvalSelect name="participationValue" label="参会价值" options={valueLevelLabels} value={venue.evaluation?.participationValue} />
            <EvalSelect name="studentFriendly" label="适合学生" options={yesNoUnknownLabels} value={venue.evaluation?.studentFriendly} />
            <EvalSelect name="worthSubmittingAgain" label="值得再次投稿" options={worthSubmittingAgainLabels} value={venue.evaluation?.worthSubmittingAgain} />
            <EvalSelect name="networkingValue" label="人脉价值" options={valueLevelLabels} value={venue.evaluation?.networkingValue} />
            <EvalSelect name="resumeValue" label="简历价值" options={valueLevelLabels} value={venue.evaluation?.resumeValue} />
            <EvalSelect name="hasProceedings" label="有论文集" options={yesNoUnknownLabels} value={venue.evaluation?.hasProceedings} />
            <EvalSelect name="hasCertificate" label="有录用证书" options={yesNoUnknownLabels} value={venue.evaluation?.hasCertificate} />
            <EvalSelect name="mustAttendOffline" label="必须线下参会" options={yesNoUnknownLabels} value={venue.evaluation?.mustAttendOffline} />
            <EvalSelect name="mustPresent" label="必须本人汇报" options={yesNoUnknownLabels} value={venue.evaluation?.mustPresent} />
          </div>
          <label>
            <span className="label">评价备注</span>
            <textarea name="evaluationNotes" rows={3} defaultValue={venue.evaluation?.evaluationNotes ?? ""} className="field" />
          </label>
          <div className="flex justify-end">
            <button className="btn-primary">保存评价</button>
          </div>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <h2 className="border-b border-line p-5 text-base font-semibold text-ink">历史投稿记录</h2>
        <table className="w-full min-w-[760px]">
          <thead>
            <tr>
              <th className="table-th">论文</th>
              <th className="table-th">状态</th>
              <th className="table-th">结果</th>
              <th className="table-th">拒稿原因</th>
            </tr>
          </thead>
          <tbody>
            {venue.submissions.map((item) => (
              <tr key={item.id}>
                <td className="table-td font-medium text-ink">{item.paper.title}</td>
                <td className="table-td">{item.status}</td>
                <td className="table-td">{item.result}</td>
                <td className="table-td">{item.rejectReasonCategory ?? item.rejectReason ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function EvalSelect({ name, label, options, value }: { name: string; label: string; options: Record<string, string>; value?: string | null }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select name={name} defaultValue={value ?? "UNKNOWN"} className="field">
        {enumOptions(options).map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="text-slate-700">{value}</div>
    </div>
  );
}
