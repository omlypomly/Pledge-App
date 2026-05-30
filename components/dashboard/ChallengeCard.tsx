import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { formatCurrency, formatRelativeTime, getStatusEmoji } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: {
    id: string;
    name: string;
    status: string;
    prizePool: number;
    stakeAmount: number;
    durationMonths: number;
    endsAt: Date | null;
    coverImageUrl: string | null;
    creator: { displayName: string | null; avatarUrl: string | null };
    participants: Array<{ userId: string; status: string }>;
    milestones: Array<{ id: string; status: string; deadline: Date }>;
    _count: { participants: number };
  };
  userId: string;
}

export default function ChallengeCard({ challenge, userId }: ChallengeCardProps) {
  const userParticipant = challenge.participants.find((p) => p.userId === userId);
  const completedMilestones = challenge.milestones.filter((m) => m.status === "COMPLETED").length;
  const totalMilestones = challenge.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const nextDeadline = challenge.milestones
    .filter((m) => m.status === "ACTIVE" || m.status === "PENDING")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <Card className="border-white/10 bg-white/5 hover:border-violet-500/30 hover:bg-white/8 transition-all cursor-pointer group overflow-hidden">
        {challenge.coverImageUrl && (
          <div
            className="h-28 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${challenge.coverImageUrl})` }}
          />
        )}
        <CardContent className={`p-4 ${challenge.coverImageUrl ? "" : "pt-4"}`}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                {challenge.name}
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                by {challenge.creator.displayName || "Unknown"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-base">{getStatusEmoji(userParticipant?.status || challenge.status)}</span>
              <Badge
                variant={
                  challenge.status === "ACTIVE" ? "success" :
                  challenge.status === "COMPLETED" ? "secondary" :
                  challenge.status === "PENDING" ? "warning" :
                  "outline"
                }
                className="text-xs"
              >
                {challenge.status}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          {challenge.status === "ACTIVE" && totalMilestones > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Milestones</span>
                <span>{completedMilestones}/{totalMilestones}</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-white/50">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="font-semibold text-yellow-400">{formatCurrency(challenge.prizePool)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{challenge._count.participants}</span>
            </div>
            {nextDeadline && (
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3 text-violet-400" />
                <span className="text-violet-300">{formatRelativeTime(nextDeadline.deadline)}</span>
              </div>
            )}
            {challenge.endsAt && challenge.status === "ACTIVE" && !nextDeadline && (
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(challenge.endsAt)}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex -space-x-2">
              {challenge.participants.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold ${
                    p.status === "ACTIVE" ? "bg-violet-600" :
                    p.status === "ELIMINATED" ? "bg-red-600" :
                    "bg-gray-700"
                  }`}
                >
                  {p.status === "ACTIVE" ? "●" : "✕"}
                </div>
              ))}
            </div>
            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
