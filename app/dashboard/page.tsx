import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getUserChallenges,
} from "@/lib/actions/challenges";
import { syncUser } from "@/lib/actions/users";
import { getSubmissionsForVoting } from "@/lib/actions/submissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  DollarSign,
  Flame,
  Target,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  ArrowRight,
  Zap,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}! 🔥`;
  if (hour < 17) return `Good afternoon, ${name}! 🔥`;
  return `Good evening, ${name}! 🔥`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await syncUser();
  if (!user) redirect("/sign-in");

  const [challenges, notifications] = await Promise.all([
    getUserChallenges(),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { challenge: { select: { id: true, name: true } } },
    }),
  ]);

  const activeChallenges = challenges.filter((c) => c.status === "ACTIVE");
  const winRate =
    user.challengesEntered > 0
      ? Math.round((user.challengesWon / user.challengesEntered) * 100)
      : 0;

  // Build upcoming milestones across all active challenges
  const now = new Date();
  const upcomingMilestones = activeChallenges
    .flatMap((c) =>
      c.milestones
        .filter(
          (m) =>
            m.status === "ACTIVE" ||
            (m.status === "PENDING" && new Date(m.deadline) > now)
        )
        .map((m) => ({
          ...m,
          challengeName: c.name,
          challengeId: c.id,
        }))
    )
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Activity feed from notifications
  const activityFeed = notifications.slice(0, 8);

  // Pending votes across challenges
  const pendingVoteSubmissions = await Promise.all(
    activeChallenges.map((c) => getSubmissionsForVoting(c.id))
  );
  const pendingVotes = pendingVoteSubmissions.flat().slice(0, 5);

  const stats = [
    {
      label: "Active Challenges",
      value: activeChallenges.length,
      icon: Trophy,
      color: "text-[#91C687]",
      bg: "bg-[#91C687]/10",
    },
    {
      label: "Total Earned",
      value: formatCurrency(user.totalEarned),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Current Streak",
      value: `${user.streakCount} days`,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Target,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
  ];

  const displayName =
    user.displayName?.split(" ")[0] || user.username || "Champion";

  return (
    <div className="min-h-screen bg-[#303D31] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting(displayName)}
            </h1>
            <p className="text-white/50 mt-1">
              Level {user.level} · {user.xp.toLocaleString()} XP
            </p>
          </div>
          <Button variant="gradient" asChild>
            <Link href="/challenges/create">
              <PlusCircle className="w-4 h-4" />
              New Challenge
            </Link>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="relative overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur-sm"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-white/50">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="xl:col-span-2 space-y-8">
            {/* My Active Challenges */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  My Active Challenges
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/challenges" className="text-[#91C687] hover:text-[#91C687]">
                    View all
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>

              {activeChallenges.length === 0 ? (
                <Card className="border-dashed border-white/20 bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#91C687]/10 border border-[#91C687]/20 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-[#91C687]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        No active challenges
                      </p>
                      <p className="text-white/50 text-sm mt-1">
                        Put your money where your mouth is. Create or join a
                        challenge.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="gradient" asChild>
                        <Link href="/challenges/create">
                          <PlusCircle className="w-4 h-4" />
                          Create Challenge
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/challenges">Browse Challenges</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeChallenges.map((challenge) => {
                    const myParticipant = challenge.participants.find(
                      (p) => p.userId === user.id
                    );
                    const completedMilestones = challenge.milestones.filter(
                      (m) => m.status === "COMPLETED"
                    ).length;
                    const totalMilestones = challenge.milestones.length;
                    const progress =
                      totalMilestones > 0
                        ? (completedMilestones / totalMilestones) * 100
                        : 0;
                    const daysLeft = challenge.endsAt
                      ? Math.max(
                          0,
                          differenceInDays(new Date(challenge.endsAt), now)
                        )
                      : null;
                    const isEliminated =
                      myParticipant?.status === "ELIMINATED";

                    return (
                      <Card
                        key={challenge.id}
                        className={`border-white/10 bg-white/[0.03] overflow-hidden transition-all hover:border-[#91C687]/30 ${
                          isEliminated ? "opacity-60" : ""
                        }`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white truncate">
                                  {challenge.name}
                                </h3>
                                <Badge
                                  variant={
                                    isEliminated ? "destructive" : "default"
                                  }
                                  className="shrink-0 text-[10px]"
                                >
                                  {isEliminated ? "ELIMINATED" : "ACTIVE"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-white/50">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {challenge._count.participants} participants
                                </span>
                                {daysLeft !== null && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {daysLeft === 0
                                      ? "Last day!"
                                      : `${daysLeft}d left`}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {formatCurrency(challenge.prizePool)} pool
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs text-white/50">
                              <span>Milestones</span>
                              <span>
                                {completedMilestones}/{totalMilestones}{" "}
                                completed
                              </span>
                            </div>
                            <Progress
                              value={progress}
                              className="h-2"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-white/60">
                              <span className="text-emerald-400 font-semibold">
                                {formatCurrency(challenge.stakeAmount)}
                              </span>{" "}
                              staked
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/challenges/${challenge.id}`}>
                                View Challenge
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Upcoming Milestones */}
            {upcomingMilestones.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">
                  Upcoming Milestones
                </h2>
                <div className="space-y-3">
                  {upcomingMilestones.map((milestone) => {
                    const daysUntil = differenceInDays(
                      new Date(milestone.deadline),
                      now
                    );
                    const isUrgent = daysUntil <= 2;
                    return (
                      <Card
                        key={milestone.id}
                        className="border-white/10 bg-white/[0.03]"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                                isUrgent
                                  ? "bg-red-500/10 border border-red-500/20"
                                  : "bg-[#91C687]/10 border border-[#91C687]/20"
                              }`}
                            >
                              <Calendar
                                className={`w-4 h-4 ${
                                  isUrgent
                                    ? "text-red-400"
                                    : "text-[#91C687]"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                {milestone.title}
                              </p>
                              <p className="text-xs text-white/50 truncate">
                                {milestone.challengeName}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p
                                className={`text-xs font-semibold ${
                                  isUrgent
                                    ? "text-red-400"
                                    : "text-white/60"
                                }`}
                              >
                                {daysUntil === 0
                                  ? "Due today!"
                                  : daysUntil === 1
                                  ? "Due tomorrow"
                                  : `${daysUntil}d left`}
                              </p>
                              <p className="text-[10px] text-white/40">
                                {new Date(milestone.deadline).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/challenges/${milestone.challengeId}/submit`}
                              >
                                Submit
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Pending Votes */}
            {pendingVotes.length > 0 && (
              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Pending Votes</CardTitle>
                    <Badge variant="warning" className="text-[10px]">
                      {pendingVotes.length} pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {pendingVotes.map((submission) => (
                    <div
                      key={submission.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarImage
                            src={submission.participant.user.avatarUrl ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {submission.participant.user.displayName?.[0] ??
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">
                            {submission.participant.user.displayName ??
                              "Unknown"}
                          </p>
                          <p className="text-[10px] text-white/50 truncate">
                            {submission.milestone.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          asChild
                        >
                          <Link
                            href={`/challenges/${submission.challengeId}`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Vote
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          asChild
                        >
                          <Link
                            href={`/challenges/${submission.challengeId}`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                            Reject
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Activity Feed */}
            <Card className="border-white/10 bg-white/[0.03]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activity Feed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {activityFeed.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  activityFeed.map((notification) => {
                    const isPositive =
                      notification.type === "MILESTONE_APPROVED" ||
                      notification.type === "CHALLENGE_STARTED" ||
                      notification.type === "PAYOUT_SENT" ||
                      notification.type === "BADGE_EARNED";
                    const isNegative =
                      notification.type === "ELIMINATED" ||
                      notification.type === "MILESTONE_REJECTED";

                    return (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 ${
                            isPositive
                              ? "bg-emerald-500/10"
                              : isNegative
                              ? "bg-red-500/10"
                              : "bg-white/5"
                          }`}
                        >
                          {isPositive ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isNegative ? (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-[#91C687]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white leading-snug">
                            {notification.title}
                          </p>
                          <p className="text-[10px] text-white/40 mt-0.5 truncate">
                            {notification.challenge?.name &&
                              `${notification.challenge.name} · `}
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#91C687] shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-[#91C687]/20 bg-[#91C687]/5">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  Quick Actions
                </h3>
                <Button variant="gradient" className="w-full" asChild>
                  <Link href="/challenges/create">
                    <PlusCircle className="w-4 h-4" />
                    Create a Challenge
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/challenges">
                    <Trophy className="w-4 h-4" />
                    Browse Challenges
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/leaderboard">
                    <Target className="w-4 h-4" />
                    View Leaderboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
