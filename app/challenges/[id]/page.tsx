import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getChallengeById, startChallenge } from "@/lib/actions/challenges";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Trophy,
  DollarSign,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Circle,
  Upload,
  Play,
  Shield,
  Zap,
  MessageSquare,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "success" | "destructive" | "warning" | "secondary" | "outline" | "info" }> = {
    DRAFT: { label: "Draft", variant: "secondary" },
    PENDING: { label: "Pending Start", variant: "warning" },
    ACTIVE: { label: "Active", variant: "success" },
    COMPLETED: { label: "Completed", variant: "info" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
  };
  const config = map[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function ParticipantStatusIcon({ status }: { status: string }) {
  if (status === "ACTIVE" || status === "WINNER") {
    return <span className="text-emerald-400 text-xs">🟢</span>;
  }
  if (status === "ELIMINATED") {
    return <span className="text-red-400 text-xs">🔴</span>;
  }
  return <span className="text-yellow-400 text-xs">🟡</span>;
}

function MilestoneStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    case "FAILED":
      return <XCircle className="w-5 h-5 text-red-400" />;
    case "ACTIVE":
      return <Circle className="w-5 h-5 text-violet-400 animate-pulse" />;
    default:
      return <Circle className="w-5 h-5 text-white/20" />;
  }
}

export const dynamic = "force-dynamic";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  const challenge = await getChallengeById(id);

  if (!challenge) notFound();

  const isCreator = dbUser && challenge.creatorId === dbUser.id;
  const myParticipant = dbUser
    ? challenge.participants.find((p) => p.userId === dbUser.id)
    : null;
  const isActiveParticipant =
    myParticipant?.status === "ACTIVE" || myParticipant?.status === "WINNER";

  const now = new Date();
  const daysLeft = challenge.endsAt
    ? Math.max(0, differenceInDays(new Date(challenge.endsAt), now))
    : null;

  const activeMilestone = challenge.milestones.find(
    (m) => m.status === "ACTIVE"
  );
  const nextMilestone =
    activeMilestone ??
    challenge.milestones.find((m) => m.status === "PENDING");

  const platformFeeAmount = (challenge.prizePool * challenge.platformFeePercent) / 100;
  const netPool = challenge.prizePool - platformFeeAmount;
  const activeWinners = challenge.participants.filter(
    (p) => p.status === "ACTIVE" || p.status === "WINNER"
  ).length;
  const estimatedPayout =
    isActiveParticipant && activeWinners > 0
      ? netPool / activeWinners
      : 0;

  // Fetch recent chat messages for activity feed
  const chatMessages = await prisma.chatMessage.findMany({
    where: { challengeId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { displayName: true, avatarUrl: true, username: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Cover / Header */}
      <div className="relative">
        <div className="h-48 sm:h-64 w-full overflow-hidden bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-[#080810]">
          {challenge.coverImageUrl ? (
            <Image
              src={challenge.coverImageUrl}
              alt={challenge.name}
              fill
              className="object-cover opacity-40"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-800/20 to-purple-800/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <StatusBadge status={challenge.status} />
                  {myParticipant && (
                    <Badge variant="outline" className="border-violet-500/40 text-violet-300">
                      You&apos;re In
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">
                  {challenge.name}
                </h1>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {isCreator && challenge.status === "PENDING" && (
                  <form
                    action={async () => {
                      "use server";
                      await startChallenge(id);
                    }}
                  >
                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                    >
                      <Play className="w-4 h-4" />
                      Start Challenge
                    </Button>
                  </form>
                )}
                {isActiveParticipant && nextMilestone && (
                  <Button variant="gradient" size="lg" asChild>
                    <Link href={`/challenges/${id}/submit`}>
                      <Upload className="w-4 h-4" />
                      Submit Proof
                    </Link>
                  </Button>
                )}
                {!myParticipant && challenge.status === "PENDING" && (
                  <Button variant="gradient" size="lg" asChild>
                    <Link href={`/challenges/join/${challenge.inviteCode}`}>
                      Join Challenge
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main content with tabs */}
          <div className="xl:col-span-2">
            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-violet-400">
                  {formatCurrency(challenge.prizePool)}
                </p>
                <p className="text-xs text-white/50 mt-1">Prize Pool</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {challenge._count.participants}
                </p>
                <p className="text-xs text-white/50 mt-1">Participants</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {daysLeft !== null ? `${daysLeft}d` : "—"}
                </p>
                <p className="text-xs text-white/50 mt-1">Days Left</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {challenge.milestones.length}
                </p>
                <p className="text-xs text-white/50 mt-1">Milestones</p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full flex gap-1 h-auto p-1 bg-white/5 border border-white/10 rounded-xl mb-6 overflow-x-auto">
                <TabsTrigger value="overview" className="flex-1 min-w-fit">Overview</TabsTrigger>
                <TabsTrigger value="milestones" className="flex-1 min-w-fit">Milestones</TabsTrigger>
                <TabsTrigger value="participants" className="flex-1 min-w-fit">Participants</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1 min-w-fit">Activity</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1 min-w-fit">
                  Chat
                  {challenge._count.chatMessages > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-[9px] px-1">
                      {challenge._count.chatMessages}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-white/10 bg-white/[0.03]">
                  <CardHeader>
                    <CardTitle className="text-base">About this Challenge</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/70 leading-relaxed text-sm">
                      {challenge.description}
                    </p>
                    {challenge.customRules && (
                      <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <p className="text-xs font-semibold text-yellow-400 mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Custom Rules
                        </p>
                        <p className="text-sm text-white/60">
                          {challenge.customRules}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Goal Type</p>
                        <p className="text-sm text-white font-medium">
                          {challenge.goalType.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Verification</p>
                        <p className="text-sm text-white font-medium flex items-center gap-1">
                          <Shield className="w-3 h-3 text-violet-400" />
                          {challenge.verificationMethod.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Stake Amount</p>
                        <p className="text-sm text-emerald-400 font-bold">
                          {formatCurrency(challenge.stakeAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Duration</p>
                        <p className="text-sm text-white font-medium">
                          {challenge.durationMonths} month
                          {challenge.durationMonths !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {challenge.startsAt && (
                        <div>
                          <p className="text-xs text-white/40 mb-1">Started</p>
                          <p className="text-sm text-white font-medium">
                            {format(new Date(challenge.startsAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                      {challenge.endsAt && (
                        <div>
                          <p className="text-xs text-white/40 mb-1">Ends</p>
                          <p className="text-sm text-white font-medium">
                            {format(new Date(challenge.endsAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Creator info */}
                <Card className="border-white/10 bg-white/[0.03]">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={challenge.creator.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {challenge.creator.displayName?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-white/40 mb-0.5">Created by</p>
                      <p className="text-sm font-semibold text-white">
                        {challenge.creator.displayName ?? challenge.creator.username ?? "Unknown"}
                      </p>
                      {challenge.creator.username && (
                        <p className="text-xs text-white/40">
                          @{challenge.creator.username}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Participants summary */}
                <Card className="border-white/10 bg-white/[0.03]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Participants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {challenge.participants.slice(0, 8).map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 py-1.5"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.user.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {participant.user.displayName?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {participant.user.displayName ?? participant.user.username ?? "Unknown"}
                          </p>
                        </div>
                        <ParticipantStatusIcon status={participant.status} />
                        <Badge
                          variant={
                            participant.status === "ACTIVE" || participant.status === "WINNER"
                              ? "success"
                              : participant.status === "ELIMINATED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {participant.status === "WINNER" ? "Winner" : participant.status}
                        </Badge>
                      </div>
                    ))}
                    {challenge.participants.length > 8 && (
                      <p className="text-xs text-white/40 text-center pt-1">
                        +{challenge.participants.length - 8} more participants
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Milestones Tab */}
              <TabsContent value="milestones" className="space-y-4">
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />
                  <div className="space-y-4">
                    {challenge.milestones.map((milestone, idx) => {
                      const isPast = new Date(milestone.deadline) < now;
                      const isCurrentMilestone = milestone.status === "ACTIVE";
                      const mySubmission = milestone.submissions?.[0];
                      const canSubmit =
                        isActiveParticipant &&
                        (isCurrentMilestone || milestone.status === "PENDING") &&
                        !mySubmission;

                      return (
                        <div key={milestone.id} className="flex gap-4">
                          <div className="flex flex-col items-center z-10">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                milestone.status === "COMPLETED"
                                  ? "bg-emerald-500/20 border-emerald-500"
                                  : milestone.status === "ACTIVE"
                                  ? "bg-violet-500/20 border-violet-500"
                                  : milestone.status === "FAILED"
                                  ? "bg-red-500/20 border-red-500"
                                  : "bg-white/5 border-white/20"
                              }`}
                            >
                              <MilestoneStatusIcon status={milestone.status} />
                            </div>
                          </div>
                          <Card
                            className={`flex-1 border-white/10 bg-white/[0.03] mb-0 ${
                              isCurrentMilestone
                                ? "border-violet-500/40 shadow-lg shadow-violet-500/5"
                                : ""
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-white/40">
                                      #{idx + 1}
                                    </span>
                                    <h3 className="font-semibold text-white text-sm">
                                      {milestone.title}
                                    </h3>
                                    {isCurrentMilestone && (
                                      <Badge variant="default" className="text-[10px]">
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-white/50">
                                    {milestone.description}
                                  </p>
                                </div>
                                {canSubmit && (
                                  <Button variant="gradient" size="sm" asChild className="shrink-0">
                                    <Link href={`/challenges/${id}/submit?milestone=${milestone.id}`}>
                                      <Upload className="w-3 h-3" />
                                      Submit Proof
                                    </Link>
                                  </Button>
                                )}
                              </div>

                              {mySubmission && (
                                <div
                                  className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-2 ${
                                    mySubmission.status === "APPROVED"
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : mySubmission.status === "REJECTED"
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-violet-500/10 text-violet-400"
                                  }`}
                                >
                                  {mySubmission.status === "APPROVED" ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : mySubmission.status === "REJECTED" ? (
                                    <XCircle className="w-3 h-3" />
                                  ) : (
                                    <Clock className="w-3 h-3 animate-pulse" />
                                  )}
                                  <span>
                                    Your submission:{" "}
                                    <strong>{mySubmission.status.replace(/_/g, " ")}</strong>
                                    {mySubmission.aiConfidence !== null &&
                                      mySubmission.aiConfidence !== undefined && (
                                        <span className="ml-1 opacity-70">
                                          (AI confidence: {Math.round(mySubmission.aiConfidence)}%)
                                        </span>
                                      )}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-3 text-xs text-white/40">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(milestone.deadline), "MMM d, yyyy")}
                                    {isPast && milestone.status !== "COMPLETED" && (
                                      <span className="text-red-400 ml-1">• Overdue</span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                  <span className="text-emerald-400">
                                    {milestone.completedCount} completed
                                  </span>
                                  {milestone.failedCount > 0 && (
                                    <span className="text-red-400">
                                      {milestone.failedCount} failed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Participants Tab */}
              <TabsContent value="participants" className="space-y-3">
                {challenge.participants.map((participant) => {
                  const winProb = participant.winProbability ?? null;
                  const submissionCount = 0; // would need to join
                  return (
                    <Card
                      key={participant.id}
                      className="border-white/10 bg-white/[0.03]"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={participant.user.avatarUrl ?? undefined}
                            />
                            <AvatarFallback>
                              {participant.user.displayName?.[0] ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-white text-sm truncate">
                                {participant.user.displayName ??
                                  participant.user.username ??
                                  "Unknown"}
                              </p>
                              <ParticipantStatusIcon status={participant.status} />
                              <Badge
                                variant={
                                  participant.status === "ACTIVE" || participant.status === "WINNER"
                                    ? "success"
                                    : participant.status === "ELIMINATED"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-[10px]"
                              >
                                {participant.status}
                              </Badge>
                            </div>
                            {winProb !== null && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-white/40">
                                  <span>Win probability</span>
                                  <span>{Math.round(winProb * 100)}%</span>
                                </div>
                                <Progress
                                  value={winProb * 100}
                                  className="h-1.5"
                                />
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-white/40">Level</p>
                            <p className="text-sm font-bold text-violet-400">
                              {participant.user.level}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-3">
                {chatMessages.filter((m) => m.isSystem).length === 0 ? (
                  <Card className="border-white/10 bg-white/[0.03]">
                    <CardContent className="py-12 text-center">
                      <Zap className="w-8 h-8 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">No activity yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  chatMessages
                    .filter((m) => m.isSystem)
                    .map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                          <Zap className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 leading-snug">
                            {message.content}
                          </p>
                          <p className="text-[10px] text-white/30 mt-1">
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat">
                <Card className="border-white/10 bg-white/[0.03]">
                  <CardContent className="p-4 space-y-4">
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                      {chatMessages.length === 0 ? (
                        <div className="py-12 text-center">
                          <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-3" />
                          <p className="text-white/40 text-sm">
                            No messages yet. Start the conversation!
                          </p>
                        </div>
                      ) : (
                        [...chatMessages].reverse().map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start gap-3 ${
                              message.isSystem ? "opacity-60" : ""
                            }`}
                          >
                            <Avatar className="w-7 h-7 shrink-0">
                              <AvatarImage
                                src={message.user.avatarUrl ?? undefined}
                              />
                              <AvatarFallback className="text-[10px]">
                                {message.user.displayName?.[0] ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-white">
                                  {message.isSystem
                                    ? "System"
                                    : (message.user.displayName ??
                                      message.user.username ??
                                      "Unknown")}
                                </span>
                                <span className="text-[10px] text-white/30">
                                  {formatDistanceToNow(
                                    new Date(message.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-white/70 leading-snug">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {myParticipant && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs text-white/40 text-center">
                          Chat is available in the full view
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sticky column — Prize Pool Card */}
          <div className="space-y-4">
            <div className="sticky top-6 space-y-4">
              <Card className="border-violet-500/30 bg-violet-600/5 shadow-xl shadow-violet-500/5" glow>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="w-4 h-4 text-violet-400" />
                    Prize Pool
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                      {formatCurrency(challenge.prizePool)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">total pool</p>
                  </div>

                  <div className="space-y-3 py-3 border-t border-white/10">
                    {myParticipant && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Your stake</span>
                        <span className="font-semibold text-white">
                          {formatCurrency(myParticipant.stakeAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Active survivors</span>
                      <span className="font-semibold text-white">
                        {activeWinners}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Platform fee</span>
                      <span className="font-semibold text-white">
                        {challenge.platformFeePercent}%
                        {challenge.prizePool > 0 && (
                          <span className="text-white/40 font-normal ml-1">
                            ({formatCurrency(platformFeeAmount)})
                          </span>
                        )}
                      </span>
                    </div>
                    {isActiveParticipant && estimatedPayout > 0 && (
                      <div className="flex justify-between text-sm py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-300 font-medium flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Est. payout if you win
                        </span>
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(estimatedPayout)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isActiveParticipant && nextMilestone && (
                    <Button variant="gradient" className="w-full" asChild>
                      <Link href={`/challenges/${id}/submit`}>
                        <Upload className="w-4 h-4" />
                        Submit Proof
                      </Link>
                    </Button>
                  )}

                  {isCreator && challenge.status === "PENDING" && (
                    <form
                      action={async () => {
                        "use server";
                        await startChallenge(id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="gradient"
                        className="w-full"
                      >
                        <Play className="w-4 h-4" />
                        Start Challenge
                      </Button>
                    </form>
                  )}

                  {!myParticipant && challenge.status === "PENDING" && (
                    <Button variant="gradient" className="w-full" asChild>
                      <Link href={`/challenges/join/${challenge.inviteCode}`}>
                        <Users className="w-4 h-4" />
                        Join for {formatCurrency(challenge.stakeAmount)}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Milestone tracker */}
              {challenge.milestones.length > 0 && (
                <Card className="border-white/10 bg-white/[0.03]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-violet-400" />
                      Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs text-white/50 mb-2">
                      <span>
                        {
                          challenge.milestones.filter(
                            (m) => m.status === "COMPLETED"
                          ).length
                        }{" "}
                        of {challenge.milestones.length} milestones
                      </span>
                      <span>
                        {Math.round(
                          (challenge.milestones.filter(
                            (m) => m.status === "COMPLETED"
                          ).length /
                            challenge.milestones.length) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (challenge.milestones.filter(
                          (m) => m.status === "COMPLETED"
                        ).length /
                          challenge.milestones.length) *
                        100
                      }
                      className="h-2"
                    />
                    <div className="flex gap-1 pt-1 flex-wrap">
                      {challenge.milestones.map((m, i) => (
                        <div
                          key={m.id}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                            m.status === "COMPLETED"
                              ? "bg-emerald-500 border-emerald-400 text-white"
                              : m.status === "ACTIVE"
                              ? "bg-violet-600 border-violet-400 text-white"
                              : m.status === "FAILED"
                              ? "bg-red-600 border-red-400 text-white"
                              : "bg-white/5 border-white/10 text-white/30"
                          }`}
                          title={m.title}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
