import { createVenue } from "@/app/actions";
import {
  enumOptions,
  feeStatusLabels,
  journalLevelLabels,
  researchFitLabels,
  valueLevelLabels,
  venueTypeLabels,
  worthAttendingLabels,
  worthSubmittingAgainLabels,
  yesNoUnknownLabels
} from "@/lib/labels";

export function VenueForm() {
  return (
    <form action={createVenue} className="panel grid gap-5 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label>
          <span className="label">名称</span>
          <input name="name" required className="field" />
        </label>
        <label>
          <span className="label">类型</span>
          <select name="type" className="field" defaultValue="CONFERENCE">
            {enumOptions(venueTypeLabels).map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">主办单位</span>
          <input name="organizer" className="field" />
        </label>
        <label>
          <span className="label">级别</span>
          <input name="level" className="field" placeholder="例如 CSSCI、全国会议、校级论坛" />
        </label>
        <label>
          <span className="label">研究方向匹配度</span>
          <select name="researchFit" className="field" defaultValue="UNKNOWN">
            {enumOptions(researchFitLabels).map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">官网链接</span>
          <input name="website" type="url" className="field" />
        </label>
        <label className="md:col-span-3">
          <span className="label">投稿系统链接</span>
          <input name="submissionUrl" type="url" className="field" />
        </label>
      </div>

      <section className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
        <h2 className="mb-4 text-sm font-semibold text-blue-900">会议 / 论坛信息</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <label><span className="label">征稿截止日期</span><input name="deadline" type="date" className="field" /></label>
          <label><span className="label">录用通知日期</span><input name="notificationDate" type="date" className="field" /></label>
          <label><span className="label">会议开始日期</span><input name="conferenceStartDate" type="date" className="field" /></label>
          <label><span className="label">会议结束日期</span><input name="conferenceEndDate" type="date" className="field" /></label>
          <label><span className="label">地点</span><input name="location" className="field" /></label>
          <label><span className="label">注册费金额</span><input name="registrationFee" type="number" step="0.01" className="field" /></label>
          <label><span className="label">交通预算</span><input name="travelBudget" type="number" step="0.01" className="field" /></label>
          <label><span className="label">住宿预算</span><input name="accommodationBudget" type="number" step="0.01" className="field" /></label>
          <label><span className="label">总预算</span><input name="totalBudget" type="number" step="0.01" className="field" /></label>
          <label><span className="label">费用状态</span><select name="feeStatus" className="field" defaultValue="UNKNOWN">{enumOptions(feeStatusLabels).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span className="label">是否值得参加</span><select name="worthAttending" className="field" defaultValue="UNKNOWN">{enumOptions(worthAttendingLabels).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span className="label">征稿启事链接</span><input name="callForPapersUrl" type="url" className="field" /></label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["isOnline", "线上会议"],
            ["registrationRequired", "需要注册费"],
            ["needSelfFunded", "需要自费"],
            ["reimbursable", "可报销"]
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-2 text-sm text-slate-700">
              <input name={name} type="checkbox" />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-orange-100 bg-orange-50/50 p-4">
        <h2 className="mb-4 text-sm font-semibold text-orange-900">投稿对象评价</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <EvalSelect name="academicValue" label="学术价值" options={valueLevelLabels} />
          <EvalSelect name="submissionDifficulty" label="投稿难度" options={valueLevelLabels} />
          <EvalSelect name="costPressure" label="费用压力" options={valueLevelLabels} />
          <EvalSelect name="participationValue" label="参会价值" options={valueLevelLabels} />
          <EvalSelect name="studentFriendly" label="适合学生" options={yesNoUnknownLabels} />
          <EvalSelect name="worthSubmittingAgain" label="值得再次投稿" options={worthSubmittingAgainLabels} />
          <EvalSelect name="networkingValue" label="人脉价值" options={valueLevelLabels} />
          <EvalSelect name="resumeValue" label="简历价值" options={valueLevelLabels} />
          <EvalSelect name="hasProceedings" label="有论文集" options={yesNoUnknownLabels} />
          <EvalSelect name="hasCertificate" label="有录用证书" options={yesNoUnknownLabels} />
          <EvalSelect name="mustAttendOffline" label="必须线下参会" options={yesNoUnknownLabels} />
          <EvalSelect name="mustPresent" label="必须本人汇报" options={yesNoUnknownLabels} />
        </div>
        <label className="mt-4 block">
          <span className="label">评价备注</span>
          <textarea name="evaluationNotes" rows={3} className="field" />
        </label>
      </section>

      <section className="rounded-lg border border-purple-100 bg-purple-50/50 p-4">
        <h2 className="mb-4 text-sm font-semibold text-purple-900">期刊信息</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <label><span className="label">期刊级别</span><select name="journalLevel" className="field" defaultValue="OTHER">{enumOptions(journalLevelLabels).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span className="label">投稿系统链接</span><input name="submissionSystemUrl" type="url" className="field" /></label>
          <label><span className="label">期刊官网</span><input name="officialWebsite" type="url" className="field" /></label>
          <label><span className="label">审稿费</span><input name="reviewFee" type="number" step="0.01" className="field" /></label>
          <label><span className="label">版面费</span><input name="publicationFee" type="number" step="0.01" className="field" /></label>
          <label className="md:col-span-3"><span className="label">费用备注</span><input name="feeNotes" className="field" /></label>
        </div>
        <div className="mt-4 flex gap-5 text-sm text-slate-700">
          <label className="flex items-center gap-2"><input name="hasReviewFee" type="checkbox" />是否收费</label>
          <label className="flex items-center gap-2"><input name="hasPublicationFee" type="checkbox" />是否有版面费</label>
        </div>
      </section>

      <label>
        <span className="label">备注</span>
        <textarea name="notes" rows={3} className="field" />
      </label>
      <div className="flex justify-end">
        <button className="btn-primary">保存投稿对象</button>
      </div>
    </form>
  );
}

function EvalSelect({ name, label, options }: { name: string; label: string; options: Record<string, string> }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select name={name} className="field" defaultValue="UNKNOWN">
        {enumOptions(options).map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
