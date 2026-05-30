import { getLeaderboard } from "@/lib/actions/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown, TrendingUp, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const users = await getLeaderboard(100);

  const ranked = users.map((u, i) => ({
    ...u,
    rank: i + 1,
    winRate:
      u.challengesEntered > 0
        ? Math.round((u.challengesWon / u.challengesEntered) * 100)
        : 0,
  }));

  return (
    <div className="min-h-screen bg-[#303D31] bg-grid py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 text-sm mb-4">
            <Trophy className="w-4 h-4" />
            Global Rankings
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-white/60">Top challengers by XP and wins</p>
        </div>

        {/* Top 3 Podium */}
        {ranked.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-10">
            {/* 2nd */}
            <div className="text-center">
              <div className="relative mx-auto w-16 h-16 mb-3">
                <Avatar className="w-16 h-16 ring-4 ring-gray-400">
                  <AvatarImage src={ranked[1]?.avatarUrl ?? ""} />
                  <AvatarFallback>{ranked[1]?.displayName?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-black font-bold text-sm">
                  2
                </div>
              </div>
              <div className="bg-gray-400/10 border border-gray-400/30 rounded-xl p-4 w-28 h-28 flex flex-col justify-end">
                <div className="text-sm font-semibold text-white truncate">{ranked[1]?.displayName ?? "—"}</div>
                <div className="text-xs text-white/50">{ranked[1]?.xp.toLocaleString()} XP</div>
              </div>
            </div>

            {/* 1st */}
            <div className="text-center -mt-6">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
              <div className="relative mx-auto w-20 h-20 mb-3">
                <Avatar className="w-20 h-20 ring-4 ring-yellow-400">
                  <AvatarImage src={ranked[0]?.avatarUrl ?? ""} />
                  <AvatarFallback>{ranked[0]?.displayName?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
                  1
                </div>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 w-32 h-36 flex flex-col justify-end">
                <div className="text-sm font-semibold text-white truncate">{ranked[0]?.displayName ?? "—"}</div>
                <div className="text-xs text-white/50">{ranked[0]?.xp.toLocaleString()} XP</div>
                <div className="text-xs text-emerald-400 mt-1">{formatCurrency(ranked[0]?.totalEarned ?? 0)} earned</div>
              </div>
            </div>

            {/* 3rd */}
            <div className="text-center">
              <div className="relative mx-auto w-16 h-16 mb-3">
                <Avatar className="w-16 h-16 ring-4 ring-amber-600">
                  <AvatarImage src={ranked[2]?.avatarUrl ?? ""} />
                  <AvatarFallback>{ranked[2]?.displayName?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-black font-bold text-sm">
                  3
                </div>
              </div>
              <div className="bg-amber-600/10 border border-amber-600/30 rounded-xl p-4 w-28 h-24 flex flex-col justify-end">
                <div className="text-sm font-semibold text-white truncate">{ranked[2]?.displayName ?? "—"}</div>
                <div className="text-xs text-white/50">{ranked[2]?.xp.toLocaleString()} XP</div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Medal className="w-5 h-5 text-[#91C687]" />
              All Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {ranked.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div
                    className={`w-8 text-center font-bold text-sm ${
                      user.rank === 1
                        ? "text-yellow-400"
                        : user.rank === 2
                        ? "text-gray-400"
                        : user.rank === 3
                        ? "text-amber-600"
                        : "text-white/40"
                    }`}
                  >
                    {user.rank <= 3 ? (
                      <Medal className="w-5 h-5 mx-auto" />
                    ) : (
                      `#${user.rank}`
                    )}
                  </div>

                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatarUrl ?? ""} />
                    <AvatarFallback>{user.displayName?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{user.displayName || "Anonymous"}</div>
                    <div className="text-xs text-white/40">@{user.username || "user"}</div>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-white font-semibold">{user.xp.toLocaleString()}</div>
                      <div className="text-white/40 text-xs">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-emerald-400 font-semibold">{user.challengesWon}</div>
                      <div className="text-white/40 text-xs">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#91C687] font-semibold">{user.winRate}%</div>
                      <div className="text-white/40 text-xs">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-semibold">{formatCurrency(user.totalEarned)}</div>
                      <div className="text-white/40 text-xs">Earned</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Lv. {user.level}
                    </Badge>
                  </div>
                </div>
              ))}

              {ranked.length === 0 && (
                <div className="text-center py-16 text-white/40">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No challengers yet. Be the first!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
