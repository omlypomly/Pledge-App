import { Card, CardContent } from "@/components/ui/card";
import { Trophy, DollarSign, Flame, TrendingUp, Target, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      icon: Trophy,
      label: "Active Challenges",
      value: stats.activeChallenges,
      color: "text-[#91C687]",
      bg: "from-[#91C687]/20 to-[#91C687]/5",
      border: "border-[#91C687]/20",
    },
    {
      icon: DollarSign,
      label: "Total Earned",
      value: formatCurrency(stats.totalEarned),
      color: "text-emerald-400",
      bg: "from-emerald-600/20 to-emerald-600/5",
      border: "border-emerald-500/20",
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
      color: "text-orange-400",
      bg: "from-orange-600/20 to-orange-600/5",
      border: "border-orange-500/20",
    },
    {
      icon: TrendingUp,
      label: "Win Rate",
      value: `${stats.winRate}%`,
      color: "text-yellow-400",
      bg: "from-yellow-600/20 to-yellow-600/5",
      border: "border-yellow-500/20",
    },
    {
      icon: Target,
      label: "Challenges Won",
      value: stats.challengesWon,
      color: "text-blue-400",
      bg: "from-blue-600/20 to-blue-600/5",
      border: "border-blue-500/20",
    },
    {
      icon: Zap,
      label: "XP",
      value: `${stats.xp.toLocaleString()} (Lv.${stats.level})`,
      color: "text-[#785964]",
      bg: "from-[#785964]/20 to-[#785964]/5",
      border: "border-[#785964]/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={`border ${card.border} bg-gradient-to-b ${card.bg}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-white/50 mt-0.5">{card.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
