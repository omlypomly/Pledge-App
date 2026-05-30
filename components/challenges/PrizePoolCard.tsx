import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface PrizePoolCardProps {
  prizePool: number;
  stakeAmount: number;
  participantCount: number;
  maxParticipants: number;
  winnersCount?: number;
  platformFeePercent?: number;
  endsAt?: Date | null;
  userStake?: number;
  status: string;
}

export default function PrizePoolCard({
  prizePool,
  stakeAmount,
  participantCount,
  maxParticipants,
  winnersCount,
  platformFeePercent = 10,
  endsAt,
  userStake,
  status,
}: PrizePoolCardProps) {
  const netPool = prizePool * (1 - platformFeePercent / 100);
  const estimatedPayout = winnersCount && winnersCount > 0
    ? netPool / winnersCount
    : netPool / Math.max(1, participantCount);

  return (
    <Card className="border-violet-500/30 bg-gradient-to-b from-violet-600/10 to-transparent sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Prize Pool
          {status === "ACTIVE" && (
            <Badge variant="success" className="ml-auto text-xs">Live</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Pool */}
        <div className="text-center py-4 rounded-xl bg-gradient-to-b from-yellow-400/10 to-transparent border border-yellow-400/20">
          <div className="text-4xl font-bold text-yellow-400">
            {formatCurrency(prizePool)}
          </div>
          <div className="text-xs text-white/50 mt-1">Total Prize Pool</div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Platform fee ({platformFeePercent}%)</span>
            <span className="text-red-400">-{formatCurrency(prizePool * platformFeePercent / 100)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Net to winners</span>
            <span className="text-emerald-400 font-semibold">{formatCurrency(netPool)}</span>
          </div>
          {participantCount > 0 && (
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="text-white/60">Est. per winner</span>
              <span className="text-violet-400 font-bold">{formatCurrency(estimatedPayout)}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2.5 rounded-lg bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{participantCount}</div>
            <div className="text-xs text-white/40">of {maxParticipants}</div>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-white/5 border border-white/10">
            <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{formatCurrency(stakeAmount)}</div>
            <div className="text-xs text-white/40">per person</div>
          </div>
        </div>

        {/* Spots remaining */}
        <div>
          <div className="flex justify-between text-xs text-white/50 mb-1.5">
            <span>Spots filled</span>
            <span>{participantCount}/{maxParticipants}</span>
          </div>
          <Progress value={(participantCount / maxParticipants) * 100} className="h-1.5" />
        </div>

        {/* Time remaining */}
        {endsAt && status === "ACTIVE" && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="w-4 h-4 text-violet-400" />
            <span>Ends {formatRelativeTime(endsAt)}</span>
          </div>
        )}

        {/* User's stake */}
        {userStake && (
          <div className="p-3 rounded-lg bg-violet-600/10 border border-violet-500/30 text-center">
            <div className="text-xs text-white/50">Your stake</div>
            <div className="text-lg font-bold text-violet-400">{formatCurrency(userStake)}</div>
            <div className="text-xs text-white/40 mt-0.5">
              {estimatedPayout > userStake
                ? `+${formatCurrency(estimatedPayout - userStake)} potential gain`
                : "At risk"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
