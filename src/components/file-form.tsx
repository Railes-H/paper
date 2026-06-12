import { FileRecord, Paper, PaperVersion, Submission, Venue } from "@prisma/client";
import { createFileRecord, updateFileRecord } from "@/app/actions";
import { enumOptions, fileTypeLabels } from "@/lib/labels";
import { toDateInputValue } from "@/lib/utils";

type SubmissionWithRelations = Submission & { paper: Paper; venue: Venue };

export function FileForm({
  file,
  papers,
  versions,
  submissions
}: {
  file?: FileRecord;
  papers: Paper[];
  versions: PaperVersion[];
  submissions: SubmissionWithRelations[];
}) {
  const action = file ? updateFileRecord.bind(null, file.id) : createFileRecord;
  return (
    <form action={action} className="panel grid gap-5 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label><span className="label">文件名</span><input name="fileName" required defaultValue={file?.fileName ?? ""} className="field" /></label>
        <label><span className="label">文件类型</span><select name="fileType" defaultValue={file?.fileType ?? "OTHER"} className="field">{enumOptions(fileTypeLabels).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label><span className="label">版本号或说明</span><input name="versionLabel" defaultValue={file?.versionLabel ?? ""} className="field" placeholder="例如 V1、V2、终稿、匿名版、返修版" /></label>
        <label className="md:col-span-2"><span className="label">文件链接或本地路径</span><input name="fileUrl" required defaultValue={file?.fileUrl ?? ""} className="field" /></label>
        <label><span className="label">日期</span><input name="uploadDate" type="date" defaultValue={toDateInputValue(file?.uploadDate)} className="field" /></label>
        <label><span className="label">关联论文</span><select name="relatedPaperId" defaultValue={file?.relatedPaperId ?? ""} className="field"><option value="">不关联</option>{papers.map((paper) => <option key={paper.id} value={paper.id}>{paper.title}</option>)}</select></label>
        <label><span className="label">关联投稿格式</span><select name="relatedPaperVersionId" defaultValue={file?.relatedPaperVersionId ?? ""} className="field"><option value="">不关联</option>{versions.map((version) => <option key={version.id} value={version.id}>{version.versionName}</option>)}</select></label>
        <label><span className="label">关联投稿记录</span><select name="relatedSubmissionId" defaultValue={file?.relatedSubmissionId ?? ""} className="field"><option value="">不关联</option>{submissions.map((item) => <option key={item.id} value={item.id}>{item.paper.title} - {item.venue.name}</option>)}</select></label>
      </div>
      <label><span className="label">备注</span><textarea name="notes" rows={3} defaultValue={file?.notes ?? ""} className="field" /></label>
      <div className="flex justify-end"><button className="btn-primary">保存文件记录</button></div>
    </form>
  );
}
