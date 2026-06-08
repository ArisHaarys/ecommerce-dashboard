import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function toNumber(value: FormDataEntryValue | null) {
  return Number(value || 0);
}

export function getPagination(searchParams: Record<string, string | string[] | undefined>) {
  const page = Math.max(Number(searchParams.page || 1), 1);
  const pageSize = 8;
  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}
