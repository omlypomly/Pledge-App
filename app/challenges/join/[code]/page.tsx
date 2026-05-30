"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { joinChallenge } from "@/lib/actions/challenges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
} from "lucide-react";

interface ChallengePreview {
  id: string;
  name: string;
  description: string;
  stakeAmount: number;
  prizePool: number;
  maxParticipants: number;
  participantCount: number;
  status: string;
  durationMonths: number;
  verificationMethod: string;
  goalType: string;
  isPrivate: boolean;
  startsAt: string | null;
  endsAt: string | null;
  creator: {
    displayName: string | null;
    avatarUrl: string | null;
    username: string | null;
  };
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    deadline: string;
    orderIndex: number;
  }>;
  alreadyJoined: boolean;
  isFull: boolean;
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

export default function JoinChallengePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [challenge, setChallenge] = useState<ChallengePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const res = await fetch(`/api/challenges/preview?code=${code}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Challenge not found");
          return;
        }
        const data = await res.json();
        setChallenge(data);
      } catch {
        setError("Failed to load challenge. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchChallenge();
  }, [code]);

  function handleJoin() {
    setJoinError(null);
    startTransition(async () => {
      try {
        const result = await joinChallenge(code);
        setJoined(true);
        // Redirect to deposit/checkout page
        router.push(`/challenges/${result.challenge.id}?joined=true`);
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : "Failed to join challenge");
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#303D31] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#91C687] border-t-transparent animate-spin" />
          <p className="text-white/60 text-sm">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-[#303D31] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-red-500/5">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400" />
            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                Challenge Not Found
              </h2>
              <p className="text-white/50 text-sm">
                {error ?? "This invite link is invalid or has expired."}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#303D31] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#91C687]/10 border border-[#91C687]/20 text-[#91C687] text-sm font-medium mb-2">
            <Trophy className="w-4 h-4" />
            You&apos;ve been invited!
          </div>
          <h1 className="text-3xl font-bold text-white">{challenge.name}</h1>
          <p className="text-white/50 text-sm">
            Join the challenge and put your stake on the line
          </p>
        </div>

        {/* Already joined / Full messages */}
        {challenge.alreadyJoined && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-emerald-300 font-semibold text-sm">
                  You&apos;re already in this challenge
                </p>
                <p className="text-emerald-400/60 text-xs">
                  Head to the challenge page to track your progress.
                </p>
              </div>
              <Button variant="success" size="sm" className="ml-auto shrink-0" asChild>
                <Link href={`/challenges/${challenge.id}`}>
                  View Challenge
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {challenge.isFull && !challenge.alreadyJoined && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 font-semibold text-sm">
                This challenge is full ({challenge.maxParticipants}/{challenge.maxParticipants} participants)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Challenge Preview Card */}
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6 space-y-5">
            {/* Creator */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <Avatar className="w-10 h-10">
                <AvatarImage src={challenge.creator.avatarUrl ?? undefined} />
                <AvatarFallback>
                  {challenge.creator.displayName?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-white/40">Created by</p>
                <p className="text-sm font-semibold text-white">
                  {challenge.creator.displayName ??
                    challenge.creator.username ??
                    "Unknown"}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge variant={challenge.status === "ACTIVE" ? "success" : "warning"}>
                  {challenge.status}
                </Badge>
                {challenge.isPrivate && (
                  <Badge variant="secondary">
                    <Lock className="w-2.5 h-2.5 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/60 leading-relaxed">
              {challenge.description}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  {formatCurrency(challenge.stakeAmount)}
                </p>
                <p className="text-[10px] text-white/40">Your Stake</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Trophy className="w-4 h-4 text-[#91C687] mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  {formatCurrency(
                    challenge.prizePool > 0
                      ? challenge.prizePool
                      : challenge.participantCount * challenge.stakeAmount
                  )}
                </p>
                <p className="text-[10px] text-white/40">Est. Prize Pool</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  {challenge.participantCount}/{challenge.maxParticipants}
                </p>
                <p className="text-[10px] text-white/40">Participants</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  {challenge.durationMonths}mo
                </p>
                <p className="text-[10px] text-white/40">Duration</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Calendar className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  {challenge.milestones.length}
                </p>
                <p className="text-[10px] text-white/40">Milestones</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Shield className="w-4 h-4 text-[#91C687] mx-auto mb-1" />
                <p className="text-xs font-bold text-white leading-tight">
                  {challenge.verificationMethod.replace(/_/g, " ")}
                </p>
                <p className="text-[10px] text-white/40">Verification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Preview */}
        {challenge.milestones.length > 0 && (
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Milestone Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenge.milestones.slice(0, 4).map((milestone, idx) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                >
                  <div className="w-7 h-7 rounded-full bg-[#785964]/20 border border-[#91C687]/30 flex items-center justify-center text-xs font-bold text-[#91C687] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {milestone.title}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                      {milestone.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/40">
                      {new Date(milestone.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {challenge.milestones.length > 4 && (
                <p className="text-xs text-white/40 text-center py-1">
                  +{challenge.milestones.length - 4} more milestones
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stake warning */}
        {!challenge.alreadyJoined && !challenge.isFull && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-yellow-300 font-semibold text-sm">
                  This challenge requires a{" "}
                  <strong>{formatCurrency(challenge.stakeAmount)}</strong> stake
                </p>
                <p className="text-yellow-400/70 text-xs leading-relaxed">
                  Your stake is held in escrow for the duration of the
                  challenge. Complete all milestones to win your share of the
                  prize pool. Miss a milestone and you&apos;re eliminated — your
                  stake is redistributed to the remaining participants.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Join error */}
        {joinError && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{joinError}</p>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {!challenge.alreadyJoined && !challenge.isFull && !joined && (
            <Button
              variant="gradient"
              size="xl"
              className="w-full"
              onClick={handleJoin}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  Join Challenge — Stake {formatCurrency(challenge.stakeAmount)}
                </>
              )}
            </Button>
          )}

          {challenge.alreadyJoined && (
            <Button variant="gradient" size="xl" className="w-full" asChild>
              <Link href={`/challenges/${challenge.id}`}>
                <ArrowRight className="w-5 h-5" />
                Go to Challenge
              </Link>
            </Button>
          )}

          <Button variant="ghost" className="w-full text-white/40" asChild>
            <Link href="/dashboard">Maybe later</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
