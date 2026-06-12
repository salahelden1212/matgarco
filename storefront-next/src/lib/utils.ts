import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | undefined | null, currency = 'ج.م'): string {
  if (amount == null) return `0 ${currency}`;
  return `${amount.toLocaleString('en-US')}${currency ? ` ${currency}` : ''}`;
}