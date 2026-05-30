import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Participant {
  id: string;
  userId: string;
  status: string;
  stakeAmount: number;
  winProbability: number | null;
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    username: string | null;
    xp: number;
    level: number;
  };
}

interface ParticipantListProps {
  participants: Participant[];
  creatorId?: string;
}

const statusConfig = {
  ACTIVE: { emoji: "🟢", label: "Active", variant: "success" as const },
  ELIMINATED: { emoji: "🔴", label: "Eliminated", variant: "destructive" as const },
  WINNER: { emoji: "🏆", label: "Winner", variant: "default" as const },
  INVITED: { emoji: "⚪", label: "Invited", variant: "outline" as const },
};

export default function ParticipantList({ participants, creatorId }: ParticipantListProps) {
  const active = participants.filter((p) => p.status === "ACTIVE" || p.status === "WINNER");
  const eliminated = participants.filter((p) => p.status === "ELIMINATED");

  return (
    <div className="space-y-3">
      {participants.map((participant) => {
        const config = statusConfig[participant.status as keyof typeof statusConfig] || statusConfig.INVITED;
        const isCreator = participant.userId === creatorId;

        return (
          <Link href={`/profile/${participant.user.id}`} key={participant.id}>
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-white/5 cursor-pointer ${
              participant.status === "ELIMINATED"
                ? "opacity-50 border-white/5 bg-white/2"
                : "border-white/10 bg-white/5"
            }`}>
              <div className="relative">
                <Avatar className={`w-10 h-10 ${participant.status === "ELIMINATED" ? "grayscale" : ""}`}>
                  <AvatarImage src={participant.user.avatarUrl ?? ""} />
                  <AvatarFallback className="text-sm">
                    {participant.user.displayName?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 text-sm">{config.emoji}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">
                    {participant.user.displayName || "Anonymous"}
                  </span>
                  {isCreator && (
                    <Crown className="w-3 h-3 text-yellow-400" />
                  )}
                  <span className="text-xs text-white/30">Lv.{participant.user.level}</span>
                </div>
                {participant.winProbability !== null && participant.status === "ACTIVE" && (
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    <Progress
                      value={participant.winProbability}
                      className="h-1 flex-1"
                      indicatorClassName={
                        (participant.winProbability ?? 0) >= 70
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : (participant.winProbability ?? 0) >= 40
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          : "bg-gradient-to-r from-red-500 to-red-400"
                      }
                    />
                    <span className="text-xs text-white/40 w-8 text-right">
                      {participant.winProbability}%
                    </span>
                  </div>
                )}
              </div>

              <Badge variant={config.variant} className="text-xs flex-shrink-0">
                {config.label}
              </Badge>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
