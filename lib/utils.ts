import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `${diffDays}d left`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w left`;
  return `${Math.ceil(diffDays / 30)}mo left`;
}

export function generateInviteCode(): string {
  return nanoid(8).toUpperCase();
}

export function generateInviteLink(code: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/challenges/join/${code}`;
}

export function calculatePrizePool(
  stakeAmount: number,
  participantCount: number,
  feePercent = 10
): { gross: number; fee: number; net: number } {
  const gross = stakeAmount * participantCount;
  const fee = gross * (feePercent / 100);
  const net = gross - fee;
  return { gross, fee, net };
}

export function calculatePayout(
  prizePool: number,
  winnersCount: number,
  feePercent = 10
): number {
  const net = prizePool * (1 - feePercent / 100);
  return winnersCount > 0 ? net / winnersCount : 0;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "text-green-400",
    ELIMINATED: "text-red-400",
    PENDING: "text-yellow-400",
    WINNER: "text-purple-400",
    COMPLETED: "text-blue-400",
    DRAFT: "text-gray-400",
  };
  return map[status] ?? "text-gray-400";
}

export function getStatusEmoji(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "🟢",
    ELIMINATED: "🔴",
    PENDING: "⚪",
    WINNER: "🏆",
    COMPLETED: "✅",
    DRAFT: "📝",
  };
  return map[status] ?? "⚪";
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let totalXp = 0;
  while (totalXp + xpForLevel(level) <= xp) {
    totalXp += xpForLevel(level);
    level++;
  }
  return level;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}
