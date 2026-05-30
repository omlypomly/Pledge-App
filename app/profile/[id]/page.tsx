import { getUserProfile } from "@/lib/actions/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Star, Zap, Target, Medal, Shield, Flame,
  TrendingUp, Calendar
} from "lucide-react";
import { formatCurrency, xpForLevel } from "@/lib/utils";
import { notFound } from "next/navigation";

const BADGE_META: Record<string, { emoji: string; label: string; desc: string; color: string }> = {
  PERFECT_CHALLENGER: { emoji: "💎", label: "Perfect Challenger", desc: "Completed all milestones", color: "text-cyan-400" },
  COMEBACK_KING: { emoji: "👑", label: "Comeback King", desc: "Won after nearly eliminated", color: "text-yellow-400" },
  LAST_SURVIVOR: { emoji: "🏆", label: "Last Survivor", desc: "Only winner in a challenge", color: "text-amber-400" },
  CONSISTENCY_MASTER: { emoji: "🔥", label: "Consistency Master", desc: "10+ day streak", color: "text-orange-400" },
  FIRST_WIN: { emoji: "⭐", label: "First Win", desc: "Won your first challenge", color: "text-yellow-400" },
  SOCIAL_BUTTERFLY: { emoji: "🦋", label: "Social Butterfly", desc: "Joined 5+ challenges", color: "text-[#785964]" },
  HIGH_ROLLER: { emoji: "💰", label: "High Roller", desc: "Staked $500+", color: "text-emerald-400" },
  STREAK_MASTER: { emoji: "⚡", label: "Streak Master", desc: "30-day streak", color: "text-[#91C687]" },
  EARLY_ADOPTER: { emoji: "🚀", label: "Early Adopter", desc: "Joined in the first month", color: "text-blue-400" },
  REFERRAL_KING: { emoji: "🤝", label: "Referral King", desc: "Invited 5+ friends", color: "text-green-400" },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserProfile(id);

  if (!user) notFound();

  const currentLevelXp = xpForLevel(user.level);
  const xpProgress = ((user.xp % currentLevelXp) / currentLevelXp) * 100;
  const winRate =
    user.challengesEntered > 0
      ? Math.round((user.challengesWon / user.challengesEntered) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#303D31] bg-grid py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="h-40 rounded-2xl bg-gradient-to-r from-[#303D31]/50 via-[#785964]/30 to-[#785964]/30 border border-white/10" />
          <div className="absolute -bottom-12 left-6 flex items-end gap-4">
            <Avatar className="w-24 h-24 ring-4 ring-[#303D31]">
              <AvatarImage src={user.avatarUrl ?? ""} />
              <AvatarFallback className="text-2xl">{user.displayName?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="mt-14 mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{user.displayName || "Anonymous"}</h1>
            {user.username && <p className="text-white/50 mt-0.5">@{user.username}</p>}
            {user.bio && <p className="text-white/70 mt-2 max-w-md">{user.bio}</p>}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Zap className="w-4 h-4 text-[#91C687]" />
              <span className="text-white font-bold">Level {user.level}</span>
            </div>
            <div className="text-xs text-white/40 mt-0.5">{user.xp.toLocaleString()} XP total</div>
            <Progress value={xpProgress} className="mt-2 w-32" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Trophy, label: "Challenges Won", value: user.challengesWon, color: "text-yellow-400" },
            { icon: Target, label: "Challenges Entered", value: user.challengesEntered, color: "text-[#91C687]" },
            { icon: TrendingUp, label: "Win Rate", value: `${winRate}%`, color: "text-emerald-400" },
            { icon: Star, label: "Total Earned", value: formatCurrency(user.totalEarned), color: "text-green-400" },
          ].map((stat) => (
            <Card key={stat.label} className="border-white/10 bg-white/5">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Streak & Badges Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Flame className="w-4 h-4 text-orange-400" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400">{user.streakCount}</div>
                  <div className="text-xs text-white/50">Current Streak</div>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-white/50">{user.longestStreak}</div>
                  <div className="text-xs text-white/50">Best Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Medal className="w-4 h-4 text-[#91C687]" />
                Badges ({user.badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge) => {
                    const meta = BADGE_META[badge.type];
                    return (
                      <div
                        key={badge.id}
                        title={meta?.desc}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm"
                      >
                        <span>{meta?.emoji}</span>
                        <span className={`font-medium ${meta?.color ?? "text-white"}`}>{meta?.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No badges yet. Complete challenges to earn them!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Challenge History */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-[#91C687]" />
              Challenge History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.participants.length > 0 ? (
              <div className="space-y-3">
                {user.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <div className="font-medium text-white">{p.challenge.name}</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {p.challenge.status} · {p.challenge.endsAt ? `Ends ${new Date(p.challenge.endsAt).toLocaleDateString()}` : "No end date"}
                      </div>
                    </div>
                    <Badge
                      variant={
                        p.status === "WINNER"
                          ? "default"
                          : p.status === "ELIMINATED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {p.status === "WINNER" ? "🏆 Winner" : p.status === "ELIMINATED" ? "🔴 Eliminated" : p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm text-center py-8">No challenges yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
