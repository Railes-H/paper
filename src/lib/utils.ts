import { Submission } from "@prisma/client";
import clsx from "clsx";

export function cn(...classes: Array<string | false | null | undefined>) {
  return clsx(classes);
}

export function formatDate(date?: Date | string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date));
}

export function toDateInputValue(date?: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export function parseDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return null;
  return value ? new Date(`${value}T00:00:00`) : null;
}

export function parseString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function parseOptionalString(value: FormDataEntryValue | null) {
  const parsed = parseString(value);
  return parsed.length ? parsed : null;
}

export function parseIntField(value: FormDataEntryValue | null) {
  const parsed = Number(parseString(value));
  return Number.isFinite(parsed) && parseString(value) !== "" ? parsed : null;
}

export function parseFloatField(value: FormDataEntryValue | null) {
  const parsed = Number(parseString(value));
  return Number.isFinite(parsed) && parseString(value) !== "" ? parsed : null;
}

export function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export function daysBetween(from: Date, to: Date) {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function isActiveSubmission(status: string) {
  return [
    "PREPARING",
    "SUBMITTED",
    "WAITING_RESULT",
    "INITIAL_REVIEW",
    "EXTERNAL_REVIEW",
    "REVISION",
    "REVISED"
  ].includes(status);
}

export function reviewDays(submission: Pick<Submission, "submissionDate" | "resultDate" | "acceptDate" | "rejectDate">) {
  if (!submission.submissionDate) return null;
  const end = submission.resultDate ?? submission.acceptDate ?? submission.rejectDate;
  if (!end) return null;
  return daysBetween(submission.submissionDate, end);
}
