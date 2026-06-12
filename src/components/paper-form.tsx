"use client";

import { Paper } from "@prisma/client";
import { AlertCircle, CheckCircle2, FileText, Plus, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createPaper, updatePaper } from "@/app/actions";
import { enumOptions, fileTypeLabels, paperStatusLabels } from "@/lib/labels";
import { parseResearchAreas, stringifyResearchAreas } from "@/lib/paper-fields";
import { toDateInputValue } from "@/lib/utils";

type RecognitionResult = {
  title: string;
  masterAbstract: string;
  masterKeywords: string;
  masterWordCount: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  warning?: string;
};

export function PaperForm({
  paper,
  researchAreaOptions,
  versionOptions
}: {
  paper?: Paper;
  researchAreaOptions: string[];
  versionOptions: string[];
}) {
  const action = paper ? updatePaper.bind(null, paper.id) : createPaper;
  const [title, setTitle] = useState(paper?.title ?? "");
  const [authors, setAuthors] = useState(paper?.authors ?? "");
  const [currentVersion, setCurrentVersion] = useState(paper?.currentVersion ?? "");
  const [masterWordCount, setMasterWordCount] = useState(paper?.masterWordCount?.toString() ?? "");
  const [masterFileUrl, setMasterFileUrl] = useState(paper?.masterFileUrl ?? "");
  const [masterAbstract, setMasterAbstract] = useState(paper?.masterAbstract ?? "");
  const [masterKeywords, setMasterKeywords] = useState(paper?.masterKeywords ?? "");
  const [selectedAreas, setSelectedAreas] = useState<string[]>(parseResearchAreas(paper?.researchArea));
  const [areaInput, setAreaInput] = useState("");
  const areaInputRef = useRef<HTMLInputElement>(null);
  const [recognition, setRecognition] = useState<RecognitionResult | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);

  const mergedAreaOptions = useMemo(
    () => Array.from(new Set([...researchAreaOptions, ...selectedAreas])).filter(Boolean),
    [researchAreaOptions, selectedAreas]
  );
  const mergedVersionOptions = useMemo(
    () => Array.from(new Set([...versionOptions, currentVersion].filter(Boolean))),
    [versionOptions, currentVersion]
  );
  const commonAreaOptions = mergedAreaOptions.slice(0, 11);
  const commonVersionOptions = mergedVersionOptions.slice(0, 10);
  const hasRecognition = Boolean(recognition);
  const needsAbstract = Boolean(recognition && !masterAbstract.trim());
  const needsKeywords = Boolean(recognition && !masterKeywords.trim());

  const addArea = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    setSelectedAreas((current) => Array.from(new Set([...current, cleaned])));
    setAreaInput("");
    if (areaInputRef.current) areaInputRef.current.value = "";
  };

  const addAreaFromInput = () => addArea(areaInputRef.current?.value ?? areaInput);

  const clearRecognition = () => {
    setRecognition(null);
    setUploadError("");
  };

  const recognizeFile = async (file?: File) => {
    if (!file) return;
    setIsRecognizing(true);
    setUploadError("");
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/papers/recognize", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        setUploadError(data.error ?? "自动识别失败，可手动填写。");
        return;
      }
      setRecognition(data);
      setTitle(data.title ?? "");
      setMasterAbstract(data.masterAbstract ?? "");
      setMasterKeywords(data.masterKeywords ?? "");
      setMasterWordCount(data.masterWordCount ? String(data.masterWordCount) : "");
      setMasterFileUrl(data.fileUrl ?? "");
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <form action={action} className="panel grid gap-5 p-5">
      <input type="hidden" name="researchArea" value={stringifyResearchAreas(selectedAreas)} />
      <input type="hidden" name="uploadedFileName" value={recognition?.fileName ?? ""} />
      <input type="hidden" name="uploadedFileType" value={recognition?.fileType ?? ""} />
      <input type="hidden" name="uploadedFileUrl" value={recognition?.fileUrl ?? ""} />

      {!paper ? (
        <section className="grid gap-4 rounded-md border-2 border-line bg-yellow-50/70 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md border-2 border-line bg-white p-2 text-ink">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="label mb-0">1 上传与识别</span>
                  <StatusPill active={isRecognizing} done={hasRecognition} />
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">上传完整版文件后，系统会先填入可编辑草稿，再由你确认保存。</p>
              </div>
            </div>
            <label className="btn-secondary cursor-pointer">
              {isRecognizing ? null : recognition ? <RotateCcw className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              {isRecognizing ? "自动识别中..." : recognition ? "重新上传" : "上传完整版论文"}
              <input
                type="file"
                accept=".docx,.pdf,.txt,.md"
                className="hidden"
                disabled={isRecognizing}
                onChange={(event) => recognizeFile(event.target.files?.[0])}
              />
            </label>
          </div>
          {uploadError ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div> : null}
          {recognition ? (
            <div className="rounded-md border border-orange-100 bg-white/90 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black text-ink">识别结果预览</h3>
                  <p className="mt-1 text-xs text-muted">下方表单已同步填入，可继续手动修正。</p>
                </div>
                <button type="button" className="btn-secondary h-8" onClick={clearRecognition}>
                  <Trash2 className="h-4 w-4" />
                  清空识别结果
                </button>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <Preview label="标题" value={recognition.title || "未识别，已使用文件名"} />
                <Preview label="文件名" value={recognition.fileName} />
                <Preview label="文件类型" value={fileTypeLabels[recognition.fileType] ?? recognition.fileType} />
                <Preview label="关键词" value={recognition.masterKeywords || "未识别，请补充"} />
                <Preview label="估算字数" value={String(recognition.masterWordCount || 0)} />
                <Preview label="文件链接" value={recognition.fileUrl} />
              </div>
              <div className="mt-3 grid gap-2">
                <InlineNotice tone="orange">字数为系统估算，可手动修改。{recognition.warning ? ` ${recognition.warning}` : ""}</InlineNotice>
                {needsAbstract ? <InlineNotice tone="red">未识别到摘要，请在“论文内容”中补充。</InlineNotice> : null}
                {needsKeywords ? <InlineNotice tone="red">未识别到关键词，请在“论文内容”中补充。</InlineNotice> : null}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <SectionHeader step={paper ? "1" : "2"} title="确认基础信息" description="标题、作者、研究方向和版本会影响后续检索、导出与文件关联。" />

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">论文标题</span>
          <input name="title" required value={title} onChange={(event) => setTitle(event.target.value)} className="field" />
        </label>

        <div>
          <span className="label">研究方向</span>
          <div className="flex gap-2">
            <input
              ref={areaInputRef}
              value={areaInput}
              onChange={(event) => setAreaInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addAreaFromInput();
                }
              }}
              list="research-area-options"
              className="field"
              placeholder="搜索已有方向，或输入新方向后回车"
            />
            <button type="button" className="btn-secondary" onClick={addAreaFromInput}>
              <Plus className="h-4 w-4" />
              添加
            </button>
          </div>
          <datalist id="research-area-options">
            {mergedAreaOptions.map((option) => <option key={option} value={option} />)}
          </datalist>
          {commonAreaOptions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {commonAreaOptions.map((option) => (
                <button key={option} type="button" className="rounded-md border border-orange-100 bg-white px-2.5 py-1 text-xs font-bold text-ink hover:bg-yellow-50" onClick={() => addArea(option)}>
                  {option}
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedAreas.map((area) => (
              <span key={area} className="inline-flex items-center gap-1 rounded-md border border-orange-100 bg-yellow-50 px-2.5 py-1 text-xs font-bold text-ink">
                {area}
                <button type="button" onClick={() => setSelectedAreas((current) => current.filter((item) => item !== area))} aria-label={`删除${area}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedAreas.length === 0 ? <span className="text-xs text-orange-700">请至少添加一个研究方向标签。</span> : null}
          </div>
        </div>

        <label>
          <span className="label">作者信息</span>
          <input name="authors" required value={authors} onChange={(event) => setAuthors(event.target.value)} className="field" />
        </label>
        <label>
          <span className="label">当前版本</span>
          <input
            name="currentVersion"
            value={currentVersion}
            onChange={(event) => setCurrentVersion(event.target.value)}
            list="version-options"
            className="field"
            placeholder="选择常用版本，或输入自定义版本"
          />
          <datalist id="version-options">
            {mergedVersionOptions.map((option) => <option key={option} value={option} />)}
          </datalist>
          {commonVersionOptions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {commonVersionOptions.map((option) => (
                <button key={option} type="button" className="rounded-md border border-orange-100 bg-white px-2.5 py-1 text-xs font-bold text-ink hover:bg-yellow-50" onClick={() => setCurrentVersion(option)}>
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </label>
      </div>

      <SectionHeader step={paper ? "2" : "3"} title="补充管理信息" description={hasRecognition ? "识别内容已填入，可在保存前继续修正。" : "可以手动填写摘要、关键词、字数和文件链接。"} />

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">完整版字数</span>
          <input name="masterWordCount" type="number" value={masterWordCount} onChange={(event) => setMasterWordCount(event.target.value)} className="field" />
        </label>
        <label>
          <span className="label">当前状态</span>
          <select name="currentStatus" defaultValue={paper?.currentStatus ?? "WRITING"} className="field">
            {enumOptions(paperStatusLabels).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">最新修改时间</span>
          <input name="latestUpdateDate" type="date" defaultValue={toDateInputValue(paper?.latestUpdateDate)} className="field" />
        </label>
        <label>
          <span className="label">完整版文件链接</span>
          <input name="masterFileUrl" value={masterFileUrl} onChange={(event) => setMasterFileUrl(event.target.value)} className="field" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">完整版摘要</span>
          <textarea name="masterAbstract" rows={5} value={masterAbstract} onChange={(event) => setMasterAbstract(event.target.value)} className="field" />
          {needsAbstract ? <FieldHint tone="red">建议补充摘要，便于后续投稿版本和导出使用。</FieldHint> : null}
        </label>
        <div className="grid gap-4">
          <label>
            <span className="label">关键词</span>
            <input name="masterKeywords" value={masterKeywords} onChange={(event) => setMasterKeywords(event.target.value)} className="field" />
            {needsKeywords ? <FieldHint tone="red">建议补充关键词，多个关键词可用分号或逗号分隔。</FieldHint> : null}
          </label>
          <label>
            <span className="label">备注</span>
            <textarea name="notes" rows={3} defaultValue={paper?.notes ?? ""} className="field" />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-orange-100 bg-yellow-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm text-slate-700">
          {selectedAreas.length > 0 ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />}
          <span>{recognition ? "保存后会创建完整版论文，并自动生成对应文件记录。" : "保存后会创建完整版论文；如果已上传文件，会同步生成文件记录。"}</span>
        </div>
        <button className="btn-primary" type="submit" disabled={selectedAreas.length === 0}>
          保存论文
        </button>
      </div>
    </form>
  );
}

function SectionHeader({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 border-t border-dashed border-orange-100 pt-5 first:border-t-0 first:pt-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-line bg-white text-xs font-black text-ink">{step}</div>
      <div>
        <h2 className="text-sm font-black text-ink">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
    </div>
  );
}

function StatusPill({ active, done }: { active: boolean; done: boolean }) {
  const label = active ? "识别中" : done ? "已识别" : "未上传";
  const className = active
    ? "border-orange-200 bg-orange-50 text-orange-700"
    : done
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-slate-200 bg-white text-muted";

  return <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${className}`}>{label}</span>;
}

function InlineNotice({ tone, children }: { tone: "orange" | "red"; children: React.ReactNode }) {
  const className = tone === "red" ? "border-red-200 bg-red-50 text-red-700" : "border-orange-200 bg-orange-50 text-orange-700";
  return <div className={`rounded-md border px-3 py-2 text-xs leading-5 ${className}`}>{children}</div>;
}

function FieldHint({ tone, children }: { tone: "red"; children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs leading-5 text-red-700">{children}</p>;
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm text-slate-700">{value}</div>
    </div>
  );
}
